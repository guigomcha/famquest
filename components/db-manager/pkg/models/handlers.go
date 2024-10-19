package models

import (
	"github.com/jmoiron/sqlx"
)

// TODO: Ensure it exists in references in other tables exist

// Fetch references for a Spot
func (s *Spots) LoadReferences(db *sqlx.DB) error {
	// Load Location
	if err := db.Get(&s.Location, "SELECT * FROM known_locations WHERE id = $1", s.LocationRef); err != nil {
		return err
	}

	// Load Attachments
	var attachments []Attachments
	err := db.Select(&attachments, "SELECT * FROM attachments WHERE ref = $1  AND ref_type = 'SpotType'", s.ID)
	if err != nil {
		return err
	}
	s.Attachments = attachments

	// Load Tasks
	var tasks []Tasks
	err = db.Select(&tasks, "SELECT * FROM tasks WHERE ref = $1 AND ref_type = 'SpotType' ", s.ID)
	if err != nil {
		return err
	}
	s.Tasks = tasks

	return nil
}
