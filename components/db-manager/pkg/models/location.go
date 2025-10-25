package models

import (
	"time"

	"github.com/google/uuid"
)

//easyjson:json
type Location struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	OwnerID       uuid.UUID  `json:"ownerId" db:"owner_id"`
	Name          string     `json:"name" db:"name"`
	DescriptionId *uuid.UUID `json:"descriptionId" db:"description_id"` // -> comment id
	Address       string     `json:"address" db:"address"`
	Lat           float64    `json:"lat" db:"lat"`
	Lng           float64    `json:"lng" db:"lng"`
	UpdatedAt     time.Time  `json:"updatedAt" db:"updated_at"`
	CreatedAt     time.Time  `json:"createdAt" db:"created_at"`
}

// LocationInputAPI is what the client POSTs / PUTs
type LocationInputAPI struct {
	Name          *string    `json:"name,omitempty" example:"Grandma’s house"`
	DescriptionId *uuid.UUID `json:"descriptionId,omitempty" format:"uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
	Address       *string    `json:"address,omitempty" example:"221B Baker St, London"`
	Lat           float64    `json:"lat" example:"51.523767"`
	Lng           float64    `json:"lng" example:"-0.158555"`
}
