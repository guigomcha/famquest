package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// For swagger input
type APIAttachments struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Datetime    time.Time `db:"datetime" json:"datetime"`
	ContentType string    `db:"content_type" json:"contentType"`
}

// `db:"attachments"` and swagger ouput
type Attachments struct {
	// only DB
	UUID uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	// DB + JSON
	RefType         string    `db:"ref_type" json:"refType"`
	RefId           int       `db:"ref_id" json:"refId"`
	ID              int       `db:"id" json:"id"` // Auto-incremented integer ID
	Name            string    `db:"name" json:"name"`
	ContentType     string    `db:"content_type" json:"contentType"`
	Description     string    `db:"description" json:"description"`
	URL             string    `db:"url" json:"url"`
	RefUserUploader int       `db:"ref_user_uploader" json:"refUserUploader"`
	Datetime        time.Time `db:"datetime" json:"datetime"`
	CreatedAt       time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt       time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
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
		INSERT INTO %s (name, description, url, content_type, ref_user_uploader, datetime)
		VALUES (:name, :description, :url, :content_type, :ref_user_uploader, :datetime) RETURNING id`, m.GetTableName())
}

func (m *Attachments) GetQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (name, description, url, content_type, ref_user_uploader, datetime)
		VALUES (:name, :description, :url, :content_type, :ref_user_uploader, :datetime) RETURNING id`, m.GetTableName())
}

func (m *Attachments) GetUpdateQuery() string {
	return fmt.Sprintf(`
			UPDATE %s
			SET name = :name, description = :description, ref_user_uploader = :ref_user_uploader, datetime = :datetime
			WHERE id = :id`, m.GetTableName())
}

func (m *Attachments) GetDeleteExtraQueries() []string {
	return []string{}
}

func (m *Attachments) GetInsertExtraQueries() []string {
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
