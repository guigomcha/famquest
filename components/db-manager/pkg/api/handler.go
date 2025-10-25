package api

import (
	"famquest/components/db-manager/pkg/connection"
)

/*
CRUDHandler is the generic handler factory for postgresql and memory repos.
T  – the domain struct (e.g. domain.User)
C  – create DTO
U  – update DTO
*/
type CRUDHandler[T any, C any, U any] struct {
	repo connection.CRUD[T]
	name string
}
