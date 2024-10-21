package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
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
	Location    int           `json:"location"`
	Attachments pq.Int64Array `json:"attachments"`
	Tasks       pq.Int64Array `json:"tasks"`
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
			s.created_at, 
			s.updated_at,
			kl.id AS location,
			COALESCE(array_agg(DISTINCT a.id) FILTER (WHERE a.id IS NOT NULL), '{}'::INT[]) AS attachments,
			COALESCE(array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL), '{}'::INT[]) AS tasks
	FROM 
			spots s
	LEFT JOIN 
			known_locations kl ON kl.ref = s.id AND kl.ref_type = 'spot'
	LEFT JOIN 
			attachments a ON a.ref = s.id AND a.ref_type = 'spot'
	LEFT JOIN 
			tasks t ON t.ref = s.id AND t.ref_type = 'spot'
	WHERE
			s.id = $1
	GROUP BY 
			s.id, kl.id, s.name, s.description, s.created_at, s.updated_at`
}

func (m *Spots) GetSelectAllQuery() string {
	return `
	SELECT 
			s.id, 
			s.name, 
			s.description, 
			s.created_at, 
			s.updated_at,
			kl.id AS location,
			COALESCE(array_agg(DISTINCT a.id) FILTER (WHERE a.id IS NOT NULL), '{}'::INT[]) AS attachments,
			COALESCE(array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL), '{}'::INT[]) AS tasks
	FROM 
			spots s
	LEFT JOIN 
			known_locations kl ON kl.ref = s.id AND kl.ref_type = 'spot'
	LEFT JOIN 
			attachments a ON a.ref = s.id AND a.ref_type = 'spot'
	LEFT JOIN 
			tasks t ON t.ref = s.id AND t.ref_type = 'spot'
	GROUP BY 
			s.id, kl.id, s.name, s.description, s.created_at, s.updated_at`
}

func (m *Spots) GetInsertQuery() string {
	return `
	INSERT INTO spots (name, description)
	VALUES (:name, :description) RETURNING id`
}

func (m *Spots) GetUpdateQuery() string {
	return `
			UPDATE spots
			SET name = :name, description = :description
			WHERE id = :id`
}

func (m *Spots) GetDeleteExtraQueries() []string {
	return []string{
		`UPDATE attachments
		 SET ref = 0 
		 WHERE ref = :id AND ref_type = 'spot'`,
		`UPDATE tasks
		 SET ref = 0 
		 WHERE ref = :id AND ref_type = 'spot'`,
	}
}

func (m *Spots) GetInsertExtraQueries() []string {
	return []string{}
}
