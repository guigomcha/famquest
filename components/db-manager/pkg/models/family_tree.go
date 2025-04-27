package models

import (
	"fmt"
)

// For swagger input
type APIFamilyTree struct {
	FamilyTree JSONBMap `db:"family_tree" json:"familyTree"` // this will hold a JSONB in postgresql with the family_tree
}

// `db:"global"`
type FamilyTree struct {
	// db + json
	FamilyTree JSONBMap `db:"family_tree" json:"familyTree"` // this will hold a JSONB in postgresql with the family_tree
	Global
}

func (m *FamilyTree) GetTableName() string {
	return "global"
}

func (m *FamilyTree) GetSelectOneQuery() string {
	return fmt.Sprintf(`SELECT family_tree, uuid, id, created_at, updated_at FROM %s WHERE id = $1`, m.GetTableName())
}

func (m *FamilyTree) GetSelectAllQuery() string {
	return fmt.Sprintf(`SELECT family_tree, uuid, id, created_at, updated_at FROM %s`, m.GetTableName())
}

func (m *FamilyTree) GetInsertQuery() string {
	return fmt.Sprintf(`
		INSERT INTO %s (family_tree)
		VALUES (:family_tree) RETURNING id`, m.GetTableName())
}

func (m *FamilyTree) GetUpdateQuery() string {
	return fmt.Sprintf(`
		UPDATE %s
		SET family_tree = :family_tree
		WHERE id = :id`, m.GetTableName())
}

func (m *FamilyTree) GetDeleteExtraQueries() []string {
	return []string{}
}

func (m *FamilyTree) GetInsertExtraQueries() []string {
	return []string{}
}
