package models

import (
	"time"

	"github.com/google/uuid"
)

//easyjson:json
type Post struct {
	ID            uuid.UUID   `json:"id" db:"id"`
	OwnerID       uuid.UUID   `json:"ownerId" db:"owner_id"`
	LocationID    *uuid.UUID  `json:"locationId,omitempty" db:"location_id"` // nullable
	Name          string      `json:"name" db:"name"`
	DescriptionId *uuid.UUID  `json:"descriptionId,omitempty" db:"description"` // -> comment id
	Medias        UUIDArray   `json:"medias" db:"medias"`                       // media ids
	Tags          StringArray `json:"tags" db:"tags"`                           // tag names
	Comments      UUIDArray   `json:"comments" db:"comments"`                   // comment ids
	StartAt       *time.Time  `json:"startAt,omitempty" db:"start_at"`
	EndAt         *time.Time  `json:"endAt,omitempty" db:"end_at"`
	UpdatedAt     time.Time   `json:"updatedAt" db:"updated_at"`
	CreatedAt     time.Time   `json:"createdAt" db:"created_at"`
}

// PostInputAPI is what the client POSTs / PUTs
type PostInputAPI struct {
	Name          string      `json:"name" example:"Summer vacation"`
	DescriptionId *uuid.UUID  `json:"descriptionId,omitempty" format:"uuid"`
	LocationID    *uuid.UUID  `json:"locationId,omitempty" format:"uuid"`
	Medias        UUIDArray   `json:"medias"`   // UUID strings
	Tags          StringArray `json:"tags"`     // tag names
	Comments      UUIDArray   `json:"comments"` // UUID strings
	StartAt       *int64      `json:"startAt,omitempty" description:"unix ms"`
	EndAt         *int64      `json:"endAt,omitempty" description:"unix ms"`
}
