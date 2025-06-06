package connection

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"

	"famquest/components/db-manager/pkg/models"
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

// Insert Function
func Insert(db *sqlx.DB, model DbInterface) (int, error) {
	// Get last index (id)
	logger.Log.Debug("Trying to insert")
	result, err := db.NamedQuery(model.GetInsertQuery(), model)
	lastInsertId := 0
	if err != nil {
		logger.Log.Debug("unable to insert")
		return 0, err
	}
	defer result.Close()
	if ok := result.Next(); !ok {
		return 0, err
	}
	err = result.Scan(&lastInsertId)
	if err != nil {
		return 0, err
	}
	err = performMultipleNamedQueries(db, model, model.GetInsertExtraQueries())
	if err != nil {
		return lastInsertId, err
	}
	logger.Log.Debugf("inserted with id '%d'", lastInsertId)
	return lastInsertId, nil
}

// Get Function
func Get(db *sqlx.DB, id int, model DbInterface) (DbInterface, error) {
	if ok := checkIDExists(db, model.GetTableName(), id); !ok {
		return nil, errors.New(ErrorIdDoesNotExits)
	}
	switch m := model.(type) {
	case *models.KnownLocations:
		received := models.KnownLocations{}
		err := db.Get(&received, model.GetSelectOneQuery(), id)
		return &received, err

	case *models.Attachments:
		received := models.Attachments{}
		err := db.Get(&received, model.GetSelectOneQuery(), id)
		return &received, err

	case *models.Users:
		received := models.Users{}
		err := db.Get(&received, model.GetSelectOneQuery(), id)
		return &received, err

	case *models.Spots:
		received := models.Spots{}
		err := db.Get(&received, model.GetSelectOneQuery(), id)
		return &received, err

	case *models.Notes:
		received := models.Notes{}
		err := db.Get(&received, model.GetSelectOneQuery(), id)
		return &received, err

	case *models.Discovered:
		received := models.Discovered{}
		err := db.Get(&received, model.GetSelectOneQuery(), id)
		return &received, err

	case *models.FamilyTree:
		received := models.FamilyTree{}
		err := db.Get(&received, model.GetSelectOneQuery(), id)
		return &received, err

	case *models.Trips:
		received := models.Trips{}
		err := db.Get(&received, model.GetSelectOneQuery(), id)
		return &received, err

	default:
		return nil, fmt.Errorf("unsupported struct in GetAll %+v", m)
	}
}

// GetAll Function
func GetAll(db *sqlx.DB, model DbInterface, filter string) ([]DbInterface, error) {
	var dest []DbInterface
	switch m := model.(type) {
	case *models.KnownLocations:
		received := []models.KnownLocations{}
		err := db.Select(&received, m.GetSelectAllQuery()+" "+filter)
		// logger.Log.Debugf("objects obtained '%+v'", received)
		if err != nil {
			return dest, err
		}
		// Slices need to be reconverted element by element
		for _, s := range received {
			dest = append(dest, &s) // Add the struct to the interface slice
		}
		logger.Log.Debug("objects casted to dbinterface")

	case *models.Attachments:
		received := []models.Attachments{}
		err := db.Select(&received, m.GetSelectAllQuery()+" "+filter)
		// logger.Log.Debugf("objects obtained '%+v'", received)
		if err != nil {
			return dest, err
		}
		// Slices need to be reconverted element by element
		for _, s := range received {
			dest = append(dest, &s) // Add the struct to the interface slice
		}
		logger.Log.Debug("objects casted to dbinterface")

	case *models.Users:
		received := []models.Users{}
		logger.Log.Debugf("initial filter '%s'", m.GetSelectAllQuery())
		err := db.Select(&received, m.GetSelectAllQuery()+" "+filter)
		// logger.Log.Debugf("objects obtained '%+v'", received)
		if err != nil {
			return dest, err
		}
		// Slices need to be reconverted element by element
		for _, s := range received {
			dest = append(dest, &s) // Add the struct to the interface slice
		}
		logger.Log.Debug("objects casted to dbinterface")

	case *models.Spots:
		// todo call the get function instead if there is too much duplicated code in the end
		received := []models.Spots{}
		err := db.Select(&received, m.GetSelectAllQuery()+" "+filter)
		if err != nil {
			return dest, err
		}
		// Slices need to be reconverted element by element
		for _, s := range received {
			dest = append(dest, &s) // Add the struct to the interface slice
		}

	case *models.FamilyTree:
		// todo call the get function instead if there is too much duplicated code in the end
		received := []models.FamilyTree{}
		err := db.Select(&received, m.GetSelectAllQuery()+" "+filter)
		if err != nil {
			return dest, err
		}
		// Slices need to be reconverted element by element
		for _, s := range received {
			dest = append(dest, &s) // Add the struct to the interface slice
		}

	case *models.Notes:
		// todo call the get function instead if there is too much duplicated code in the end
		received := []models.Notes{}
		err := db.Select(&received, m.GetSelectAllQuery()+" "+filter)
		if err != nil {
			return dest, err
		}
		// Slices need to be reconverted element by element
		for _, s := range received {
			dest = append(dest, &s) // Add the struct to the interface slice
		}
	case *models.Discovered:
		// todo call the get function instead if there is too much duplicated code in the end
		received := []models.Discovered{}
		err := db.Select(&received, m.GetSelectAllQuery()+" "+filter)
		if err != nil {
			return dest, err
		}
		// Slices need to be reconverted element by element
		for _, s := range received {
			dest = append(dest, &s) // Add the struct to the interface slice
		}
	case *models.Trips:
		// todo call the get function instead if there is too much duplicated code in the end
		received := []models.Trips{}
		err := db.Select(&received, m.GetSelectAllQuery()+" "+filter)
		if err != nil {
			return dest, err
		}
		// Slices need to be reconverted element by element
		for _, s := range received {
			dest = append(dest, &s) // Add the struct to the interface slice
		}
	default:
		return dest, fmt.Errorf("unsupported struct in GetAll %+v", m)
	}
	return dest, nil
}

// Delete Function
func Delete(db *sqlx.DB, id int, model DbInterface) error {
	if ok := checkIDExists(db, model.GetTableName(), id); !ok {
		return errors.New(ErrorIdDoesNotExits)
	}
	err := performMultipleNamedQueries(db, model, model.GetDeleteExtraQueries())
	if err != nil {
		return err
	}
	query := fmt.Sprintf(`DELETE FROM %s WHERE id = $1`, model.GetTableName())
	_, err = db.Exec(query, id)
	return err
}

// Update Function
func Update(db *sqlx.DB, id int, model DbInterface) (DbInterface, error) {
	if ok := checkIDExists(db, model.GetTableName(), id); !ok {
		return nil, errors.New(ErrorIdDoesNotExits)
	}
	res, err := db.NamedQuery(model.GetUpdateQuery(), model)
	if err != nil {
		return nil, err
	}
	defer res.Close()
	err = performMultipleNamedQueries(db, model, model.GetInsertExtraQueries())
	if err != nil {
		return nil, err
	}
	return Get(db, id, model)
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

func performMultipleNamedQueries(db *sqlx.DB, m DbInterface, queries []string) error {
	if len(queries) == 0 {
		return nil
	}
	// Begin the transaction
	tx, err := db.Beginx()
	if err != nil {
		return err
	}

	// Defer rollback in case of failure
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	errorMessages := []string{}
	for _, query := range queries {
		_, err = tx.NamedExec(query, m)
		if err != nil {
			logger.Log.Debugf("unable to do transaction: `%s`", err.Error())
			tx.Rollback()
			errorMessages = append(errorMessages, err.Error())
		}
	}
	// Commit the transaction if everything succeeded
	err = tx.Commit()
	if err != nil {
		logger.Log.Debugf("unable to commit: `%s`", err.Error())
		return err
	}
	if len(errorMessages) > 0 {
		return fmt.Errorf("some query did not execute right: '%s'", strings.Join(errorMessages, "\n"))
	}

	return nil
}

func ExecuteCustom(db *sqlx.DB, query string, dest interface{}) error {
	logger.Log.Debugf("Executing query '%s'", query)
	err := db.Select(dest, query)
	// logger.Log.Debugf("objects obtained '%+v'", dest)
	if err != nil {
		logger.Log.Debugf("unable to execute query: `%s`", err.Error())
	}
	return err
}
