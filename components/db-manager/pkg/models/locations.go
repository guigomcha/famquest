package models

import (
	"fmt"
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
	UUID uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	// Db + json
	RefType         string    `db:"ref_type" json:"refType"`
	RefId           int       `db:"ref_id" json:"refId"`
	ID              int       `db:"id" json:"id,omitempty"` // Auto-incremented integer ID
	Name            string    `db:"name" json:"name"`
	Longitude       float64   `db:"longitude" json:"longitude"` // Longitude as signed float
	Latitude        float64   `db:"latitude" json:"latitude"`   // Latitude as signed float
	RefUserUploader int       `db:"ref_user_uploader" json:"refUserUploader"`
	CreatedAt       time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt       time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}

func (m *KnownLocations) GetTableName() string {
	return "known_locations"
}

func (m *KnownLocations) GetSelectOneQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s  WHERE id = $1`, m.GetTableName())
}

func (m *KnownLocations) GetSelectAllQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s`, m.GetTableName())
}

func (m *KnownLocations) GetInsertQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (name, longitude, latitude, ref_user_uploader)
		VALUES (:name, :longitude, :latitude, :ref_user_uploader) RETURNING id`, m.GetTableName())
}

func (m *KnownLocations) GetQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (name, longitude, latitude, ref_user_uploader)
		VALUES (:name, :longitude, :latitude, :ref_user_uploader) RETURNING id`, m.GetTableName())
}

func (m *KnownLocations) GetUpdateQuery() string {
	return fmt.Sprintf(`
			UPDATE %s
			SET name = :name, longitude = :longitude, latitude = :latitude, ref_user_uploader = :ref_user_uploader
			WHERE id = :id`, m.GetTableName())
}

func (m *KnownLocations) GetDeleteExtraQueries() []string {
	return []string{}
}

func (m *KnownLocations) GetInsertExtraQueries() []string {
	if m.RefId != 0 {
		return []string{
			fmt.Sprintf(`
			UPDATE %s
			SET ref_id = :ref_id, ref_type = :ref_type
			WHERE id = :id`, m.GetTableName()),
		}
	}
	return []string{}
}
