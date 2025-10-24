package models

import (
	"time"

	"github.com/google/uuid"
)

//easyjson:json
type Media struct {
	ID           uuid.UUID   `json:"id" db:"id"`
	OwnerID      uuid.UUID   `json:"ownerId" db:"owner_id"`
	Name         string      `json:"name" db:"name"`                // original file name
	URL          string      `json:"url" db:"url"`                  // served path
	ContentType  string      `json:"ContentType" db:"content_type"` // ENUM checked at API level
	Participants UUIDArray   `json:"participants" db:"participants"`
	Tags         StringArray `json:"tags" db:"tags"`
	Comments     UUIDArray   `json:"comments" db:"comments"`
	IsAt         *time.Time  `json:"isAt" db:"is_at"`
	UpdatedAt    time.Time   `json:"updatedAt" db:"updated_at"`
	CreatedAt    time.Time   `json:"createdAt" db:"created_at"`
}

// MediaInputAPI is what the client sends as form-data
type MediaInputAPI struct {
	Tags StringArray `form:"tags"`
	IsAt *int64      `form:"isAt"` // unix ms
}

// MediaPut is what the client sends as form-data during put
type MediaPutAPI struct {
	Participants UUIDArray   `json:"participants"`
	Comments     UUIDArray   `json:"comments"`
	Tags         StringArray `form:"tags"`
	IsAt         *int64      `form:"isAt"` // unix ms
}
