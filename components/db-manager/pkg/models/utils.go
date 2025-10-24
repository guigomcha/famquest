package models

import (
	"database/sql/driver"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// ErrorResp is returned on every 4xx/5xx
type ErrorResp struct {
	Error string `json:"error"`
}

type ListResp[T any] struct {
	Items []T `json:"items"`
	Total int `json:"total"`
}

// Support for []s in json <-> db operations

type UUIDArray []uuid.UUID

// driver.Valuer (for INSERT/UPDATE)
func (a UUIDArray) Value() (driver.Value, error) {
	return pq.Array(UUIDArray(a)).Value()
}

// sql.Scanner (for SELECT)
func (a *UUIDArray) Scan(src interface{}) error {
	return pq.Array(a).Scan(src)
}

func (a UUIDArray) Append(ids ...uuid.UUID) UUIDArray {
	return UUIDArray(append([]uuid.UUID(a), ids...))
}

type StringArray []string

func (a StringArray) Value() (driver.Value, error) {
	return pq.Array([]string(a)).Value()
}

func (a *StringArray) Scan(src interface{}) error {
	// use a plain []string as the receiver for pq.Array
	var tmp []string
	if err := pq.Array(&tmp).Scan(src); err != nil {
		return err
	}
	*a = StringArray(tmp)
	return nil
}

func (a StringArray) Append(ids ...string) StringArray {
	return StringArray(append([]string(a), ids...))
}
