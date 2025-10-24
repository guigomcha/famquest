package models

import (
	"time"

	"github.com/google/uuid"
)

//easyjson:json
type Trip struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	OwnerID        uuid.UUID  `json:"ownerId" db:"owner_id"`
	Name           string     `json:"name" db:"name"`
	Description    *uuid.UUID `json:"description,omitempty" db:"description"` // -> comment id
	Transportation string     `json:"transportation" db:"transportation"`     // enum string
	Participants   UUIDArray  `json:"participants" db:"participants"`         // user ids
	Stops          []TripStop `json:"stops" db:"stops"`                       // jsonb
	StartAt        *time.Time `json:"startAt,omitempty" db:"start_at"`
	EndAt          *time.Time `json:"endAt,omitempty" db:"end_at"`
	UpdatedAt      time.Time  `json:"updatedAt" db:"updated_at"`
	CreatedAt      time.Time  `json:"createdAt" db:"created_at"`
}

// TripStop is a single element inside the JSONB stops array
type TripStop struct {
	MemoryID uuid.UUID `json:"memoryId"`
	Order    int       `json:"order"`
}

// TripInputAPI is what the client POSTs / PUTs
type TripInputAPI struct {
	Name           string     `json:"name" example:"Euro trip"`
	Description    *string    `json:"description,omitempty" format:"uuid"`
	Transportation string     `json:"transportation" example:"car" enums:"car,plane,train,bus,foot"`
	Participants   []string   `json:"participants"` // UUID strings
	Stops          []TripStop `json:"stops"`
	StartAt        *int64     `json:"startAt,omitempty" description:"unix ms"`
	EndAt          *int64     `json:"endAt,omitempty" description:"unix ms"`
}
