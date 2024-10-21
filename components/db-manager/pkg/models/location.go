package models

import (
	"time"

	"github.com/google/uuid"
)

// For swagger input
type APIKnownLocations struct {
	Name      string  `json:"name"`
	Longitude float64 `json:"longitude"` // Longitude as signed float
	Latitude  float64 `json:"latitude"`  // Latitude as signed float
}

// `db:"known_locations"` and swagger ouput
type KnownLocations struct {
	// Only db
	UUID    uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	RefType string    `db:"ref_type" json:"-"`
	Ref     int       `db:"ref" json:"-"`
	// Db + json
	ID        int       `db:"id" json:"id,omitempty"` // Auto-incremented integer ID
	Name      string    `db:"name" json:"name"`
	Longitude float64   `db:"longitude" json:"longitude"`            // Longitude as signed float
	Latitude  float64   `db:"latitude" json:"latitude"`              // Latitude as signed float
	CreatedAt time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}

func (m *KnownLocations) GetTableName() string {
	return "known_locations"
}

func (m *KnownLocations) GetInsertQuery() string {
	return `
		INSERT INTO known_locations (name, longitude, latitude)
		VALUES (:name, :longitude, :latitude) RETURNING id`
}

func (m *KnownLocations) GetQuery() string {
	return `
		INSERT INTO known_locations (name, longitude, latitude)
		VALUES (:name, :longitude, :latitude) RETURNING id`
}

func (m *KnownLocations) GetUpdateQuery() string {
	return `
			UPDATE known_locations
			SET name = :name, longitude = :longitude, latitude = :latitude
			WHERE id = :id`
}

func (m *KnownLocations) GetDeleteExtraQueries() []string {
	return []string{}
}

func (m *KnownLocations) GetInsertExtraQueries() []string {
	if m.Ref != 0 {
		return []string{
			`
			UPDATE known_locations
			SET ref = :ref, ref_type = :ref_type
			WHERE id = :id`,
		}
	}
	return []string{}
}
