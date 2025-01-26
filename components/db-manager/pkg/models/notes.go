package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// For swagger input
type APINotes struct {
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
	Category    string `db:"category" json:"category"`
}

// `db:"notes"`
type Notes struct {
	// Only DB
	UUID uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	// db + json
	ID              int       `db:"id" json:"id"` // Auto-incremented integer ID
	Name            string    `db:"name" json:"name"`
	Description     string    `db:"description" json:"description"`
	Category        string    `db:"category" json:"category"`
	CreatedAt       time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt       time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
	RefUserUploader int       `db:"ref_user_uploader" json:"refUserUploader"`
	// only json -> Need to create the parse the json  to and from db
	Location    int           `json:"location"`
	Attachments pq.Int64Array `json:"attachments"`
}

func (m *Notes) GetTableName() string {
	return "note"
}

func (m *Notes) GetSelectOneQuery() string {
	return `
	SELECT 
			s.id, 
			s.name, 
			s.description, 
			s.category, 
			s.ref_user_uploader, 
			s.created_at, 
			s.updated_at,
			COALESCE(kl.id, 0) AS location,
			COALESCE(array_agg(DISTINCT a.id) FILTER (WHERE a.id IS NOT NULL), '{}'::INT[]) AS attachments
	FROM 
			note s
	LEFT JOIN 
			known_locations kl ON kl.ref_id = s.id AND kl.ref_type = 'note'
	LEFT JOIN 
			attachments a ON a.ref_id = s.id AND a.ref_type = 'note'
	WHERE
			s.id = $1
	GROUP BY 
			s.id, kl.id, s.name, s.description, s.category, s.created_at, s.updated_at, s.ref_user_uploader`
}

func (m *Notes) GetSelectAllQuery() string {
	return `
	SELECT 
			s.id, 
			s.name, 
			s.description, 
			s.category, 
			s.ref_user_uploader, 
			s.created_at, 
			s.updated_at,
			COALESCE(kl.id, 0) AS location,
			COALESCE(array_agg(DISTINCT a.id) FILTER (WHERE a.id IS NOT NULL), '{}'::INT[]) AS attachments
	FROM 
			note s
	LEFT JOIN 
			known_locations kl ON kl.ref_id = s.id AND kl.ref_type = 'note'
	LEFT JOIN 
			attachments a ON a.ref_id = s.id AND a.ref_type = 'note'
	GROUP BY 
			s.id, kl.id, s.name, s.description, s.category, s.created_at, s.updated_at, s.ref_user_uploader`
}

func (m *Notes) GetInsertQuery() string {
	return `
	INSERT INTO note (name, description, category, ref_user_uploader)
	VALUES (:name, :description, :category, :ref_user_uploader) RETURNING id`
}

func (m *Notes) GetUpdateQuery() string {
	return `
			UPDATE note
			SET name = :name, description = :description, category = :category, ref_user_uploader = :ref_user_uploader
			WHERE id = :id`
}

func (m *Notes) GetDeleteExtraQueries() []string {
	return []string{
		`UPDATE attachments
		 SET ref_id = 0 
		 WHERE ref_id = :id AND ref_type = 'note'`,
	}
}

func (m *Notes) GetInsertExtraQueries() []string {
	return []string{}
}
