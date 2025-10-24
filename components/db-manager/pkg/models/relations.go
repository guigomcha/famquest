package models

import (
	"time"

	"github.com/google/uuid"
)

//easyjson:json
type Relation struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Source    uuid.UUID `json:"source" db:"source"` // user id
	Target    uuid.UUID `json:"target" db:"target"` // user id
	Label     string    `json:"label" db:"label"`   // enum
	IsEx      bool      `json:"isEx" db:"is_ex"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

// RelationInputAPI is what the client POSTs / PUTs
type RelationInputAPI struct {
	Source uuid.UUID `json:"source" format:"uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
	Target uuid.UUID `json:"target" format:"uuid" example:"660e8400-e29b-41d4-a716-446655440000"`
	Label  string    `json:"label" example:"friend" enums:"spouse,friend,parent,pet"`
	IsEx   bool      `json:"isEx" example:"false"`
}
