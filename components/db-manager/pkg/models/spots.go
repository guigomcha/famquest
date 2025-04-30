package models

import (
	"time"

	"github.com/google/uuid"
	//"github.com/lib/pq"
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
	ID              int       `db:"id" json:"id"` // Auto-incremented integer ID
	Name            string    `db:"name" json:"name"`
	Description     string    `db:"description" json:"description"`
	CreatedAt       time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt       time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
	RefUserUploader int       `db:"ref_user_uploader" json:"refUserUploader"`
}

func (m *Spots) GetTableName() string {
	return "spots"
}

func (m *Spots) GetSelectOneQuery() string {
	return `
	SELECT 
			s.id, 
			s.name, 
			s.description, 
			s.ref_user_uploader, 
			s.created_at, 
			s.updated_at
	FROM
			spots s
	WHERE
			s.id = $1
	GROUP BY 
			s.id, s.name, s.description, s.created_at, s.updated_at, s.ref_user_uploader`
}

func (m *Spots) GetSelectAllQuery() string {
	return `
	SELECT 
			s.id, 
			s.name, 
			s.description, 
			s.ref_user_uploader, 
			s.created_at, 
			s.updated_at
	FROM 
			spots s
	GROUP BY 
			s.id, s.name, s.description, s.created_at, s.updated_at, s.ref_user_uploader`
}

func (m *Spots) GetInsertQuery() string {
	return `
	INSERT INTO spots (name, description, ref_user_uploader)
	VALUES (:name, :description, :ref_user_uploader) RETURNING id`
}

func (m *Spots) GetUpdateQuery() string {
	return `
			UPDATE spots
			SET name = :name, description = :description, ref_user_uploader = :ref_user_uploader
			WHERE id = :id`
}

func (m *Spots) GetDeleteExtraQueries() []string {
	return []string{
		`DELETE FROM known_locations WHERE ref_id = :id AND ref_type = 'spot'`,
		`DELETE FROM discovered WHERE ref_id = :id AND ref_type = 'spot'`,
	}
}

func (m *Spots) GetInsertExtraQueries() []string {
	return []string{}
}
