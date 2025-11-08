package repository

import (
	"context"

	"github.com/sjzar/chatlog/internal/model"
)

func (r *Repository) GetSessions(ctx context.Context, key string, limit, offset int) ([]*model.Session, error) {
	sessions, err := r.ds.GetSessions(ctx, key, limit, offset)
	if err != nil {
		return nil, err
	}

	// Enrich sessions with avatar information from contacts/chatrooms
	for _, session := range sessions {
		if contact := r.findContact(session.UserName); contact != nil {
			if contact.SmallHeadImgUrl != "" {
				session.AvatarURL = contact.SmallHeadImgUrl
			} else if contact.BigHeadImgUrl != "" {
				session.AvatarURL = contact.BigHeadImgUrl
			}
		}
	}

	return sessions, nil
}
