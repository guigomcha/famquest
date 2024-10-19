package connection

import (
	"fmt"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

const (
	DB_USER     = "myuser"
	DB_PASSWORD = "mypassword"
	DB_NAME     = "famquest"
	DB_HOST     = "localhost"
	DB_PORT     = "5432"
)

func ConnectToPostgreSQL() (*sqlx.DB, error) {
	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT)
	return sqlx.Connect("postgres", connStr)
}
