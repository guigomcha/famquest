package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// TODO: bday should be a date

// For swagger input
type APIUsers struct {
	ExtRef   string `db:"ext_ref" json:"extRef"`
	Email    string `db:"email" json:"email"`
	Role     string `db:"role" json:"role"`
	Name     string `db:"name" json:"name"`
	Bio      string `db:"bio" json:"bio"`
	Birthday string `db:"birthday" json:"birthday"`
}

// `db:"users"`
type Users struct {
	// Only DB
	UUID uuid.UUID `db:"uuid" json:"-"` // UUID as primary key
	// db + json
	ID        int       `db:"id" json:"id"` // Auto-incremented integer ID
	ExtRef    string    `db:"ext_ref" json:"extRef"`
	Name      string    `db:"name" json:"name"`
	Email     string    `db:"email" json:"email"`
	Role      string    `db:"role" json:"role"`
	Bio       string    `db:"bio" json:"bio"`
	Birthday  string    `db:"birthday" json:"birthday"`
	CreatedAt time.Time `db:"created_at" json:"createdAt,omitempty"` // Automatically generated
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt,omitempty"` // Automatically managed by trigger
}

func (m *Users) GetTableName() string {
	return "users"
}

func (m *Users) GetSelectOneQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s  WHERE id = $1`, m.GetTableName())
}

func (m *Users) GetSelectAllQuery() string {
	return fmt.Sprintf(`SELECT * FROM %s`, m.GetTableName())
}

func (m *Users) GetInsertQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (name, ext_ref, email, role, bio, birthday)
		VALUES (:name, :ext_ref, :email, :role, :bio, :birthday) RETURNING id`, m.GetTableName())
}

func (m *Users) GetQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (name, ext_ref, email, role, bio, birthday)
		VALUES (:name, :ext_ref, :email, :role, :bio, :birthday) RETURNING id`, m.GetTableName())
}

func (m *Users) GetUpdateQuery() string {
	return fmt.Sprintf(`
			UPDATE %s
			SET name = :name, email = :email, ext_ref = :ext_ref, role = :role, bio = :bio, birthday = :birthday
			WHERE id = :id`, m.GetTableName())
}

func (m *Users) GetDeleteExtraQueries() []string {
	return []string{
		`UPDATE attachments
		 SET ref_user_uploader = 0 
		 WHERE ref_user_uploader = :id`,
		`UPDATE known_locations
		 SET ref_user_uploader = 0 
		 WHERE ref_user_uploader = :id`,
		`UPDATE spots
		 SET ref_user_uploader = 0 
		 WHERE ref_user_uploader = :id`,
	}
}

func (m *Users) GetInsertExtraQueries() []string {
	return []string{}
}
