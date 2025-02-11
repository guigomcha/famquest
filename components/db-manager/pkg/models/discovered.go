package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// For swagger input
type APIDiscovered struct {
	Condition map[string]string `db:"condition" json:"condition"` // this will hold a JSONB in postgresql with the condition
	Show      bool              `db:"show" json:"show"`           // condition was met
}

/* Examples

// Discoverable when the location is found. Which happens when a nearby location is found
{
	"condition": {
		"conformanceComparator": "eq",
		"parameterType": "location",
		"thresholdTarget": ""
		"relatedEntity": []
	},
	"show": true
}

// Discoverable when the user with id 4 reaches an age of 16
{
	"condition": {
		"conformanceComparator": "gt",
		"parameterType": "age",
		"thresholdTarget": "16"
		"relatedEntity": [
			{
				"refId": "4",
				"refType": "user"
			}
		]
	},
	"show": true
}

// Discoverable when the date is greater or equal to 2025
{
	"condition": {
		"conformanceComparator": "ge",
		"parameterType": "date",
		"thresholdTarget": "2025"
		"relatedEntity": []
	},
	"show": true
}

*/

// `db:"discovered"`
type Discovered struct {
	// Only DB
	UUID uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	// db + json
	Condition map[string]string `db:"condition" json:"condition"` // this will hold a JSONB in postgresql with the condition
	Show      bool              `db:"show" json:"show"`           // condition was met
	RefType   string            `db:"ref_type" json:"-"`
	RefId     int               `db:"ref_id" json:"-"`
	ID        int               `db:"id" json:"id"`                          // Auto-incremented integer ID
	CreatedAt time.Time         `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt time.Time         `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}

func (m *Discovered) GetTableName() string {
	return "discovered"
}

func (m *Discovered) GetSelectOneQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s WHERE id = $1`, m.GetTableName())
}

func (m *Discovered) GetSelectAllQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s`, m.GetTableName())
}

func (m *Discovered) GetInsertQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (uuid, condition, show, ref_type, ref_id, created_at, updated_at)
		VALUES (:uuid, :condition, :show, :ref_type, :ref_id, :created_at, :updated_at) RETURNING id`, m.GetTableName())
}

func (m *Discovered) GetUpdateQuery() string {
	return fmt.Sprintf(`
		UPDATE %s
		SET condition = :condition, show = :show, ref_type = :ref_type, ref_id = :ref_id, updated_at = :updated_at
		WHERE id = :id`, m.GetTableName())
}

func (m *Discovered) GetDeleteExtraQueries() []string {
	return []string{}
}

func (m *Discovered) GetInsertExtraQueries() []string {
	return []string{}
}
