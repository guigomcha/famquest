package connection

import (
	"fmt"
	"os"
	"time"

	"github.com/jmoiron/sqlx"

	"famquest/components/go-common/logger"
)

const (
	ErrorIdDoesNotExits = "id does not exist"
)

var DB *sqlx.DB

func ConnectToPostgreSQL() error {
	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"), os.Getenv("DB_NAME"), os.Getenv("POSTGRES_DB_HOST"), os.Getenv("POSTGRES_DB_PORT"))
	logger.Log.Infof("Connecting to Postgresql '%s'", connStr)
	var err error
	DB, err = sqlx.Connect("postgres", connStr)
	if err != nil {
		return err
	}
	DB.SetConnMaxLifetime(10 * time.Minute)
	DB.SetConnMaxIdleTime(5 * time.Minute)
	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(10)
	return err
}

func CheckIDExists(db *sqlx.DB, tableName string, intId int) bool {
	// Define the SQL query
	query := fmt.Sprintf(`SELECT EXISTS(SELECT 1 FROM %s WHERE id = $1)`, tableName)
	// Declare a variable to hold the result
	var exists bool
	// Execute the query
	err := db.QueryRow(query, intId).Scan(&exists)
	if err != nil {
		logger.Log.Debugf("Failed with '%s'", err.Error())
	}
	return err == nil && exists
}
