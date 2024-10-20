package models

import (
	"time"

	"github.com/google/uuid"
)

// `db:"spots"`
type Spots struct {
	// Only DB
	UUID        uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	LocationRef int       `db:"location_ref" json:"-"`
	// db + json
	ID          int       `db:"id" json:"id"` // Auto-incremented integer ID
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
	// only json -> Need to create the parse the json  to and from db
	Location    KnownLocations `json:"location"`
	Attachments []Attachments  `json:"attachments"`
	Tasks       []Tasks        `json:"tasks"`
}

// `db:"known_locations"`
type KnownLocations struct {
	// Only db
	UUID uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	// Db + json
	ID        int       `db:"id" json:"id,omitempty"` // Auto-incremented integer ID
	Name      string    `db:"name" json:"name"`
	Longitude float64   `db:"longitude" json:"longitude"`            // Longitude as signed float
	Latitude  float64   `db:"latitude" json:"latitude"`              // Latitude as signed float
	CreatedAt time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}

// `db:"tasks"`
type Tasks struct {
	// Only DB
	UUID    uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	RefType string    `db:"ref_type" json:"-"`
	Ref     int       `db:"ref" json:"-"`
	// Db + Json
	ID          int       `db:"id" json:"id"` // Auto-incremented integer ID
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}

// `db:"attachments"`
type Attachments struct {
	// only DB
	UUID    uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	RefType string    `db:"ref_type" json:"-"`
	Ref     int       `db:"ref" json:"-"`
	// DB + JSON
	ID          int       `db:"id" json:"id"` // Auto-incremented integer ID
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	URL         string    `db:"url" json:"url"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}

// Baseline for a Many to Many relationship. Right now everything is 1toMany.
// - The referenced table has the key
// - The "owner" table does not know
// `db:"known_location_refs"`
// type KnownLocationRefs struct {
// 	ID                 int       `db:"id" json:"id"`                // Auto-incremented integer ID
// 	UUID               uuid.UUID `db:"uuid" json:"-"`            // UUID as primary key
// 	KnownLocationRef   int       `db:"known_location_ref" json:"known_location_ref"` // Reference to Known Location
// 	RefType            string    `db:"ref_type" json:"ref_type"`
// 	Ref                int       `db:"ref" json:"ref"`
// 	CreatedAt          time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
// 	UpdatedAt          time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
// }
