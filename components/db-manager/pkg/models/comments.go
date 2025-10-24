package models

import (
	"time"

	"github.com/google/uuid"
)

//easyjson:json
type Comment struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	OwnerID   uuid.UUID  `json:"ownerId" db:"owner_id"`
	Text      string     `json:"text" db:"text"`
	AudioID   *uuid.UUID `json:"audioId" db:"audio_id"` // nullable media id
	Replies   UUIDArray  `json:"replies" db:"replies"`  // comment ids
	UpdatedAt time.Time  `json:"updatedAt" db:"updated_at"`
	CreatedAt time.Time  `json:"createdAt" db:"created_at"`
}

// CommentInputAPI is what the client POSTs / PUTs
type CommentInputAPI struct {
	Text    string     `json:"text,omitempty" example:"Great picture!"`
	AudioID *uuid.UUID `json:"audioId,omitempty" format:"uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
	Replies UUIDArray  `json:"replies,omitempty"` // UUID strings
}
