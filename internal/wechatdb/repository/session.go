package repository

import (
	"context"
	"sort"

	"github.com/sjzar/chatlog/internal/model"
)

func (r *Repository) GetSessions(ctx context.Context, key string, limit, offset int) ([]*model.Session, error) {
	// Step 1: Get pinned usernames from contact table
	pinnedUserNames, err := r.ds.GetPinnedUserNames(ctx)
	if err != nil {
		return nil, err
	}
	pinnedMap := make(map[string]bool, len(pinnedUserNames))
	for _, userName := range pinnedUserNames {
		pinnedMap[userName] = true
	}

	// Step 2: Get sessions from session table (load more to ensure we have enough after filtering)
	// We need to load extra records because some might be filtered out (placeholders)
	fetchLimit := limit * 2
	if fetchLimit < 50 {
		fetchLimit = 50 // Minimum fetch size
	}
	sessions, err := r.ds.GetSessions(ctx, key, fetchLimit, 0)
	if err != nil {
		return nil, err
	}

	// Step 3: Enrich sessions with contact/chatroom information and filter placeholders
	result := make([]*model.Session, 0, len(sessions))
	for _, session := range sessions {
		// Skip placeholder sessions
		if session.UserName == "@placeholder_foldgroup" || session.UserName == "" {
			continue
		}

		// Get contact or chatroom information for the userName
		if contact := r.findContact(session.UserName); contact != nil {
			// Use contact's display name, not the last message sender's name
			session.NickName = contact.DisplayName()

			// Set avatar
			if contact.SmallHeadImgUrl != "" {
				session.AvatarURL = contact.SmallHeadImgUrl
			} else if contact.BigHeadImgUrl != "" {
				session.AvatarURL = contact.BigHeadImgUrl
			}

			// Set pinned status from contact
			session.IsPinned = contact.IsPinned
		} else if chatroom, err := r.GetChatRoom(ctx, session.UserName); err == nil && chatroom != nil {
			// For chatrooms, use chatroom display name
			session.NickName = chatroom.DisplayName()
			// Check if chatroom is pinned
			if pinnedMap[session.UserName] {
				session.IsPinned = true
			}
		}

		result = append(result, session)
	}

	// Step 4: Sort by pinned status first, then by time
	sort.Slice(result, func(i, j int) bool {
		// Pinned sessions come first
		if result[i].IsPinned != result[j].IsPinned {
			return result[i].IsPinned
		}
		// Then sort by time (descending)
		return result[i].NTime.After(result[j].NTime)
	})

	// Step 5: Apply pagination
	start := offset
	end := offset + limit
	if start > len(result) {
		return []*model.Session{}, nil
	}
	if end > len(result) {
		end = len(result)
	}

	return result[start:end], nil
}
