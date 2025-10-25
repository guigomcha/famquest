package models

import (
	"time"

	"github.com/google/uuid"
)

// *Type ↔ NULL allowed
// Type   ↔ NOT NULL (or empty slice for arrays)

type User struct {
	ID        uuid.UUID  `json:"id" db:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name      string     `json:"name" db:"name" example:"Sarah Chen"`
	Email     *string    `json:"email" db:"email" example:"sarah@example.com"`
	AvatarId  *uuid.UUID `json:"avatarId" db:"avatar_id" format:"uuid"`
	BioId     *uuid.UUID `json:"bioId" db:"bio_id" format:"uuid"`
	ExtRef    *string    `json:"extRef" db:"ext_ref"`
	IsVirtual bool       `json:"isVirtual" db:"is_virtual" example:"false"`
	Posts     UUIDArray  `json:"posts" db:"posts"`
	StartAt   time.Time  `json:"startAt" db:"start_at" example:"2025-09-01T15:04:05Z"`
	EndAt     *time.Time `json:"endAt" db:"end_at" example:"2025-09-07T15:04:05Z"`
	UpdatedAt time.Time  `json:"updatedAt" db:"updated_at" example:"2025-10-05T08:30:00Z"`
	CreatedAt time.Time  `json:"createdAt" db:"created_at" example:"2025-10-04T08:30:00Z"`
}

// UserInputAPI is what the client POSTs and PUTs
type UserInputAPI struct {
	Name      string     `json:"name" example:"Sarah Chen"`
	Email     *string    `json:"email" example:"sarah@example.com"`
	AvatarId  *uuid.UUID `json:"avatarId,omitempty" format:"uuid"`
	BioId     *uuid.UUID `json:"bioId,omitempty" format:"uuid"`
	ExtRef    *string    `json:"extRef,omitempty"`
	IsVirtual bool       `json:"isVirtual" example:"false"`
	Posts     UUIDArray  `json:"posts"`
	StartAt   int64      `json:"startAt" description:"unix ms"`
	EndAt     *int64     `json:"endAt,omitempty" description:"unix ms"`
}
