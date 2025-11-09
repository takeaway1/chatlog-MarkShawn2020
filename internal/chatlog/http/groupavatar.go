package http

import (
	"bytes"
	"image/png"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"

	"github.com/sjzar/chatlog/internal/errors"
	"github.com/sjzar/chatlog/pkg/util/groupavatar"
)

// GroupAvatarCache stores generated group avatars
type GroupAvatarCache struct {
	data map[string]*CachedAvatar
	mu   sync.RWMutex
}

// CachedAvatar represents a cached avatar image
type CachedAvatar struct {
	Data      []byte
	CreatedAt time.Time
}

var (
	avatarCache  = &GroupAvatarCache{data: make(map[string]*CachedAvatar)}
	avatarGen    = groupavatar.NewGenerator(200, 2)
	cacheDuration = 24 * time.Hour
)

// Get retrieves a cached avatar
func (c *GroupAvatarCache) Get(key string) ([]byte, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if cached, ok := c.data[key]; ok {
		// Check if expired
		if time.Since(cached.CreatedAt) < cacheDuration {
			return cached.Data, true
		}
		// Expired, will be replaced
	}
	return nil, false
}

// Set stores an avatar in cache
func (c *GroupAvatarCache) Set(key string, data []byte) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.data[key] = &CachedAvatar{
		Data:      data,
		CreatedAt: time.Now(),
	}

	// Clean up old entries periodically (simple strategy)
	if len(c.data) > 1000 {
		c.cleanup()
	}
}

// cleanup removes expired entries
func (c *GroupAvatarCache) cleanup() {
	now := time.Now()
	for key, cached := range c.data {
		if now.Sub(cached.CreatedAt) > cacheDuration {
			delete(c.data, key)
		}
	}
}

// handleGroupAvatar generates and returns a composite avatar for a chatroom
// URL format: /group-avatar/{chatroomId}
func (s *Service) handleGroupAvatar(c *gin.Context) {
	chatroomID := strings.TrimPrefix(c.Param("id"), "/")
	if chatroomID == "" {
		errors.Err(c, errors.InvalidArg("chatroom id"))
		return
	}

	// Get chatroom info from database
	chatroomsResp, err := s.db.GetChatRooms(chatroomID, 1, 0)
	if err != nil {
		errors.Err(c, err)
		return
	}

	if chatroomsResp == nil || len(chatroomsResp.Items) == 0 {
		errors.Err(c, errors.ErrMediaNotFound)
		return
	}

	chatroom := chatroomsResp.Items[0]

	// Collect member avatar URLs (up to 9)
	memberAvatarURLs := make([]string, 0, 9)
	count := len(chatroom.Users)
	if count > 9 {
		count = 9
	}

	// Get contacts for these users to retrieve their avatars
	for i := 0; i < count; i++ {
		userName := chatroom.Users[i].UserName

		// Query contact for this user
		contacts, err := s.db.GetContacts(userName, 1, 0)
		if err != nil || contacts == nil || len(contacts.Items) == 0 {
			continue
		}

		contact := contacts.Items[0]
		avatarURL := ""
		if contact.SmallHeadImgUrl != "" {
			avatarURL = contact.SmallHeadImgUrl
		} else if contact.BigHeadImgUrl != "" {
			avatarURL = contact.BigHeadImgUrl
		}

		if avatarURL != "" {
			memberAvatarURLs = append(memberAvatarURLs, avatarURL)
		}
	}

	if len(memberAvatarURLs) == 0 {
		// No member avatars available, return 404
		errors.Err(c, errors.ErrMediaNotFound)
		return
	}

	// Generate cache key
	cacheKey := groupavatar.GenerateHash(memberAvatarURLs)

	// Check cache
	if cachedData, found := avatarCache.Get(cacheKey); found {
		c.Data(http.StatusOK, "image/png", cachedData)
		return
	}

	// Generate composite avatar
	log.Info().
		Str("chatroom", chatroomID).
		Int("members", len(memberAvatarURLs)).
		Msg("Generating group avatar")

	img, err := avatarGen.Generate(memberAvatarURLs)
	if err != nil {
		log.Error().Err(err).Msg("Failed to generate group avatar")
		errors.Err(c, err)
		return
	}

	// Encode to PNG
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		errors.Err(c, err)
		return
	}

	avatarData := buf.Bytes()

	// Cache the result
	avatarCache.Set(cacheKey, avatarData)

	// Return image
	c.Data(http.StatusOK, "image/png", avatarData)
}
