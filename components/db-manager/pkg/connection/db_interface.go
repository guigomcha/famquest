package connection

type DbInterface interface {
	GetTableName() string
	GetSelectOneQuery() string
	GetSelectAllQuery() string
	GetInsertQuery() string
	GetUpdateQuery() string
	GetDeleteExtraQueries() []string
	GetInsertExtraQueries() []string
}
