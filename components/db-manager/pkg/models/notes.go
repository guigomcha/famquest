package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// For swagger input
type APINotes struct {
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	Category    string    `db:"category" json:"category"`
	Datetime    time.Time `db:"datetime" json:"datetime"`
}

// `db:"notes"`
type Notes struct {
	// Only DB
	UUID    uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	RefType string    `db:"ref_type" json:"-"`
	RefId   int       `db:"ref_id" json:"-"`
	// db + json
	ID              int       `db:"id" json:"id"` // Auto-incremented integer ID
	Name            string    `db:"name" json:"name"`
	Description     string    `db:"description" json:"description"`
	Category        string    `db:"category" json:"category"`
	Datetime        time.Time `db:"datetime" json:"datetime"`
	CreatedAt       time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt       time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
	RefUserUploader int       `db:"ref_user_uploader" json:"refUserUploader"`
}

func (m *Notes) GetTableName() string {
	return "notes"
}

func (m *Notes) GetSelectOneQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s  WHERE id = $1`, m.GetTableName())
}

func (m *Notes) GetSelectAllQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s `, m.GetTableName())
}

func (m *Notes) GetInsertQuery() string {
	return `
	INSERT INTO notes (name, description, category, ref_user_uploader, datetime)
	VALUES (:name, :description, :category, :ref_user_uploader, :datetime) RETURNING id`
}

func (m *Notes) GetUpdateQuery() string {
	return `
			UPDATE notes
			SET name = :name, description = :description, category = :category, datetime = :datetime, ref_user_uploader = :ref_user_uploader
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
