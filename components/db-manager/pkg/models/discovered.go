package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// For swagger input
type APIDiscovered struct {
	Condition JSONBMap `db:"condition" json:"condition"` // this will hold a JSONB in postgresql with the condition
	Show      bool     `db:"show" json:"show"`           // condition was met
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
	Condition JSONBMap  `db:"condition" json:"condition"` // this will hold a JSONB in postgresql with the condition
	Show      bool      `db:"show" json:"show"`           // condition was met
	RefType   string    `db:"ref_type" json:"-"`
	RefId     int       `db:"ref_id" json:"-"`
	ID        int       `db:"id" json:"id"`                          // Auto-incremented integer ID
	CreatedAt time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}

// Used to evaluate the condition based on locations
type LocationBasedCondition struct {
	KnownLocations
	DiscoveredId int `db:"discovered_id" json:"-"`
	SpotId       int `db:"spot_id" json:"-"`
}

// JSONBMap is a custom type to handle map[string]string for JSONB in PostgreSQL
type JSONBMap map[string]string

// Value implements the driver.Valuer interface for JSONBMap
func (j JSONBMap) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface for JSONBMap
func (j *JSONBMap) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	b, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("expected []byte, got %T", value)
	}
	return json.Unmarshal(b, j)
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
		INSERT INTO %s (condition, show)
		VALUES (:condition, :show) RETURNING id`, m.GetTableName())
}

func (m *Discovered) GetUpdateQuery() string {
	return fmt.Sprintf(`
		UPDATE %s
		SET condition = :condition, show = :show
		WHERE id = :id`, m.GetTableName())
}

func (m *Discovered) GetDeleteExtraQueries() []string {
	return []string{}
}

func (m *Discovered) GetInsertExtraQueries() []string {
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
