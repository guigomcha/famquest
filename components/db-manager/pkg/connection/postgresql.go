package connection

import (
	"errors"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"

	// "log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

const (
	DB_USER             = "myuser"
	DB_PASSWORD         = "mypassword"
	DB_NAME             = "famquest"
	DB_HOST             = "localhost"
	DB_PORT             = "5432"
	ErrorIdDoesNotExits = "id does not exist"
)

func ConnectToPostgreSQL() (*sqlx.DB, error) {
	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT)
	return sqlx.Connect("postgres", connStr)
}

// Insert Function
func Insert(db *sqlx.DB, model interface{}) (int, error) {
	var query string

	switch m := model.(type) {
	case *models.Attachments:
		query = `
			INSERT INTO attachments (name, description, url, ref_type, ref)
			VALUES (:name, :description, :url, :ref_type, :ref) RETURNING id`
	case *models.Spots:
		query = `
			INSERT INTO spots (name, locationºº, description, attachment_refs, task_refs)
			VALUES (:name, :locationºº, :description, :attachment_refs, :task_refs) RETURNING id`
	case *models.KnownLocations:
		query = `
			INSERT INTO known_locations (name, longitude, latitude)
			VALUES (:name, :longitude, :latitude) RETURNING id`
	case *models.Tasks:
		query = `
			INSERT INTO tasks (name, description, ref_type, ref)
			VALUES (:name, :description, :ref_type, :ref) RETURNING id`
	default:
		return 0, fmt.Errorf("unsupported model type: %T", m)
	}
	// Get last index (id)
	result, err := db.NamedQuery(query, model) //QueryRow // (query, model).Scan(&lastInsertId), nil
	lastInsertId := 0
	if ok := result.Next(); !ok {
		return 0, err
	}
	return lastInsertId, result.Scan(&lastInsertId)
}

// Get Function
func Get(db *sqlx.DB, id int, dest interface{}) error {
	var query string
	var tableName string
	switch m := dest.(type) {
	case *models.Attachments:
		tableName = "attachments"
	case *models.Spots:
		tableName = "spots"
	case *models.KnownLocations:
		tableName = "known_locations"
	case *models.Tasks:
		tableName = "tasks"
	default:
		return fmt.Errorf("unsupported model type: %T", m)
	}
	if ok := checkIDExists(db, tableName, id); !ok {
		return errors.New(ErrorIdDoesNotExits)
	}
	query = fmt.Sprintf(`SELECT * FROM %s WHERE id = $1`, tableName)
	err := db.Get(dest, query, id)
	return err
}

// GetAll Function
func GetAll(db *sqlx.DB, dest interface{}) error {
	var query string

	switch m := dest.(type) {
	case *[]models.Attachments:
		query = `SELECT * FROM attachments`
	case *[]models.Spots:
		query = `SELECT * FROM spots`
	case *[]models.KnownLocations:
		query = `SELECT * FROM known_locations`
	case *[]models.Tasks:
		query = `SELECT * FROM tasks`
	default:
		return fmt.Errorf("unsupported model type: %T", m)
	}
	err := db.Select(dest, query)
	return err
}

// Delete Function
func Delete(db *sqlx.DB, model interface{}, id int) error {
	var query string
	var tableName string
	switch m := model.(type) {
	case *models.Attachments:
		tableName = "attachments"
	case *models.Spots:
		tableName = "spots"
	case *models.KnownLocations:
		tableName = "known_locations"
	case *models.Tasks:
		tableName = "tasks"
	default:
		return fmt.Errorf("unsupported model type: %T", m)
	}
	if ok := checkIDExists(db, tableName, id); !ok {
		return errors.New(ErrorIdDoesNotExits)
	}
	query = fmt.Sprintf(`DELETE FROM %s WHERE id = $1`, tableName)
	_, err := db.Exec(query, id)
	return err
}

// Update Function
func Update(db *sqlx.DB, model interface{}) error {
	// difficult to know if the json was only partially added ....
	var query string

	switch m := model.(type) {
	case *models.Attachments:
		query = `
			UPDATE attachments
			SET name = :name, description = :description, url = :url, ref_type = :ref_type, ref = :ref
			WHERE id = :id`
		_, err := db.NamedExec(query, m)
		return err

	case *models.Spots:
		query = `
			UPDATE spots
			SET name = :name, locationºº = :locationºº, description = :description, 
			    attachment_refs = :attachment_refs, task_refs = :task_refs
			WHERE id = :id`
		_, err := db.NamedExec(query, m)
		return err

	case *models.KnownLocations:
		if ok := checkIDExists(db, "known_locations", m.ID); !ok {
			return errors.New(ErrorIdDoesNotExits)
		}
		query = `
			UPDATE known_locations
			SET name = :name, longitude = :longitude, latitude = :latitude
			WHERE id = :id`
		_, err := db.NamedExec(query, m)
		return err

	case *models.Tasks:
		query = `
			UPDATE tasks
			SET name = :name, description = :description, ref_type = :ref_type, ref = :ref
			WHERE id = :id`
		_, err := db.NamedExec(query, m)
		return err

	default:
		return fmt.Errorf("unsupported model type: %T", model)
	}
}

func checkIDExists(db *sqlx.DB, tableName string, intId int) bool {
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
