package main

import (
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		log.Fatalln(err)
	}
	defer db.Close()

	if _, err := db.Exec(models.Schema); err != nil {
		log.Fatalln(err)
	}
	// Populate the database with sample data
	connection.PopulateDatabase(db)

	// Print the contents of the database
	connection.PrintDatabaseContents(db)
}
