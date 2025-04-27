package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

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
