package models

import (
	"time"

	"github.com/google/uuid"
)

// For swagger input
type APISpots struct {
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
}

// `db:"spots"`
type Spots struct {
	// Only DB
	UUID uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	// db + json
	ID          int       `db:"id" json:"id"` // Auto-incremented integer ID
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
	// only json -> Need to create the parse the json  to and from db
	Location    int   `json:"location"`
	Attachments []int `json:"attachments"`
	Tasks       []int `json:"tasks"`
}

func (m *Spots) GetTableName() string {
	return "spots"
}

func (m *Spots) GetInsertQuery() string {
	return `
	INSERT INTO spots (name, description)
	VALUES (:name, :location, :description) RETURNING id`
}

func (m *Spots) GetUpdateQuery() string {
	return `
			UPDATE spots
			SET name = :name, location = :location, description = :description
			WHERE id = :id`
}

func (m *Spots) GetDeleteExtraQueries() []string {
	return []string{
		`UPDATE attachments
		 SET ref = 0 
		 WHERE ref = :id AND ref_type = 'spot'`,
	}
}

func (m *Spots) GetInsertExtraQueries() []string {
	return []string{}
}
