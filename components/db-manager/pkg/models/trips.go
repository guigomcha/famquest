package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// For swagger input
type APITrips struct {
	Geometry     JSONB  `db:"geometry" json:"geometry"`           // JSONB geometry field
	Mode         string `db:"mode" json:"mode"`                   // "car" or "foot"
	RefTypeStart string `db:"ref_type_start" json:"refTypeStart"` // "spot" or "note"
	RefTypeEnd   string `db:"ref_type_end" json:"refTypeEnd"`     // "spot" or "note"
	RefIdStart   int    `db:"ref_id_start" json:"refIdStart"`     // start reference
	RefIdEnd     int    `db:"ref_id_end" json:"refIdEnd"`         // end reference
}

// `db:"trips"`
type Trips struct {
	UUID            uuid.UUID `db:"uuid" json:"uuid"`                   // UUID as primary key
	ID              int       `db:"id" json:"id"`                       // Auto-incremented ID
	Geometry        JSONB     `db:"geometry" json:"geometry"`           // JSONB geometry field
	Mode            string    `db:"mode" json:"mode"`                   // "car" or "foot"
	RefTypeStart    string    `db:"ref_type_start" json:"refTypeStart"` // "spot" or "note"
	RefTypeEnd      string    `db:"ref_type_end" json:"refTypeEnd"`     // "spot" or "note"
	RefIdStart      int       `db:"ref_id_start" json:"refIdStart"`     // start reference
	RefIdEnd        int       `db:"ref_id_end" json:"refIdEnd"`         // end reference
	RefUserUploader int       `db:"ref_user_uploader" json:"refUserUploader"`
	CreatedAt       time.Time `db:"created_at" json:"createdAt,omitempty"`
	UpdatedAt       time.Time `db:"updated_at" json:"updatedAt,omitempty"`
}

func (m *Trips) GetTableName() string {
	return "trips"
}

func (m *Trips) GetSelectOneQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s WHERE id = $1`, m.GetTableName())
}

func (m *Trips) GetSelectAllQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s`, m.GetTableName())
}

func (m *Trips) GetInsertQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (geometry, mode, ref_type_start, ref_type_end, ref_id_start, ref_id_end)
		VALUES (:geometry, :mode, :ref_type_start, :ref_type_end, :ref_id_start, :ref_id_end)
		RETURNING id`, m.GetTableName())
}

func (m *Trips) GetUpdateQuery() string {
	return fmt.Sprintf(`
		UPDATE %s
		SET geometry = :geometry,
		    mode = :mode,
		    ref_type_start = :ref_type_start,
		    ref_type_end = :ref_type_end,
		    ref_id_start = :ref_id_start,
		    ref_id_end = :ref_id_end,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = :id`, m.GetTableName())
}

func (m *Trips) GetDeleteExtraQueries() []string {
	return []string{}
}

func (m *Trips) GetInsertExtraQueries() []string {
	return []string{}
}
