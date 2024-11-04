package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// For swagger input
type APITasks struct {
	Name        string `json:"name"`
	Description string `json:"description"` // Description
	Url         string `json:"url"`         // Url
}

// `db:"tasks"` and swagger ouput
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

func (m *Tasks) GetTableName() string {
	return "tasks"
}

func (m *Tasks) GetSelectOneQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s  WHERE id = $1`, m.GetTableName())
}

func (m *Tasks) GetSelectAllQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s`, m.GetTableName())
}

func (m *Tasks) GetInsertQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (name, description)
		VALUES (:name, :description) RETURNING id`, m.GetTableName())
}

func (m *Tasks) GetQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (name, description)
		VALUES (:name, :description) RETURNING id`, m.GetTableName())
}

func (m *Tasks) GetUpdateQuery() string {
	return fmt.Sprintf(`
			UPDATE %s
			SET name = :name, description = :description 
			WHERE id = :id`, m.GetTableName())
}

func (m *Tasks) GetDeleteExtraQueries() []string {
	return []string{}
}

func (m *Tasks) GetInsertExtraQueries() []string {
	if m.Ref != 0 {
		return []string{
			fmt.Sprintf(`
			UPDATE %s
			SET ref = :ref, ref_type = :ref_type
			WHERE id = :id`, m.GetTableName()),
		}
	}
	return []string{}
}
