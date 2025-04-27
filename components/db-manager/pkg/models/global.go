package models

import (
	"time"

	"github.com/google/uuid"
)

// This table is indirectly consumed by a model per each column
// - familyTree
// `db:"global"`
type Global struct {
	// Only DB
	UUID uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	// db + json
	ID        int       `db:"id" json:"id"`                          // Auto-incremented integer ID
	CreatedAt time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}
