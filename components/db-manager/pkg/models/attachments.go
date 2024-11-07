package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// For swagger input
type APIAttachments struct {
	Name        string `json:"name"`
	Description string `json:"description"` // Description
}

// `db:"attachments"` and swagger ouput
type Attachments struct {
	// only DB
	UUID    uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	RefType string    `db:"ref_type" json:"-"`
	Ref     int       `db:"ref" json:"-"`
	// DB + JSON
	ID          int       `db:"id" json:"id"` // Auto-incremented integer ID
	Name        string    `db:"name" json:"name"`
	ContentType string    `db:"content_type" json:"contentType"`
	Description string    `db:"description" json:"description"`
	URL         string    `db:"url" json:"url"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}

func (m *Attachments) GetTableName() string {
	return "attachments"
}

func (m *Attachments) GetSelectOneQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s  WHERE id = $1`, m.GetTableName())
}

func (m *Attachments) GetSelectAllQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s `, m.GetTableName())
}

func (m *Attachments) GetInsertQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (name, description, url, content_type)
		VALUES (:name, :description, :url, :content_type) RETURNING id`, m.GetTableName())
}

func (m *Attachments) GetQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (name, description, url, content_type)
		VALUES (:name, :description, :url, :content_type) RETURNING id`, m.GetTableName())
}

func (m *Attachments) GetUpdateQuery() string {
	return fmt.Sprintf(`
			UPDATE %s
			SET name = :name, description = :description
			WHERE id = :id`, m.GetTableName())
}

func (m *Attachments) GetDeleteExtraQueries() []string {
	return []string{}
}

func (m *Attachments) GetInsertExtraQueries() []string {
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
