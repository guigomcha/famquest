package connection

import (
	"encoding/json"
	"fmt"
	"github.com/jmoiron/sqlx"
	"log"

	"famquest/components/db-manager/pkg/models"
)

func PopulateDatabase(db *sqlx.DB) {
	// Insert known locations
	locations := []models.KnownLocations{
		{
			Name:      "Location 1",
			Longitude: -122.4194, // Example longitude
			Latitude:  37.7749,   // Example latitude
		},
		{
			Name:      "Location 2",
			Longitude: -73.9352, // Example longitude
			Latitude:  40.7306,  // Example latitude
		},
	}

	for _, location := range locations {
		_, err := db.NamedExec("INSERT INTO known_locations (name, longitude, latitude) VALUES (:name, :longitude, :latitude)", &location)
		if err != nil {
			log.Fatalln(err)
		}
	}

	// Insert spots
	for i := 1; i <= 2; i++ {
		spot := models.Spots{
			LocationRef: i, // Assuming valid location ids (1 and 2)
			Name:        fmt.Sprintf("Spot %d", i),
			Description: fmt.Sprintf("Description for Spot %d", i),
		}
		_, err := db.NamedExec("INSERT INTO spots (location_ref, name, description) VALUES (:location_ref, :name, :description)", &spot)
		if err != nil {
			log.Fatalln(err)
		}
	}

	// Insert tasks
	for i := 1; i <= 2; i++ {
		task := models.Tasks{
			RefType:     "SpotType",
			Ref:         i, // Reference to other entities
			Name:        fmt.Sprintf("Task %d", i),
			Description: fmt.Sprintf("Description for Task %d", i),
		}
		_, err := db.NamedExec("INSERT INTO tasks (ref_type, ref, name, description) VALUES (:ref_type, :ref, :name, :description)", &task)
		if err != nil {
			log.Fatalln(err)
		}
	}

	// Insert attachments
	for i := 1; i <= 2; i++ {
		attachment := models.Attachments{
			RefType:     "SpotType",
			Ref:         i, // Reference to other entities
			Name:        fmt.Sprintf("Attachment %d", i),
			Description: fmt.Sprintf("Description for Attachment %d", i),
			URL:         fmt.Sprintf("http://example.com/attachment%d", i),
		}
		_, err := db.NamedExec("INSERT INTO attachments (ref_type, ref, name, description, url) VALUES (:ref_type, :ref, :name, :description, :url)", &attachment)
		if err != nil {
			log.Fatalln(err)
		}
	}

	fmt.Println("Database populated with sample data!")
}

// PrintDatabaseContents retrieves and prints all the data from the database
func PrintDatabaseContents(db *sqlx.DB) {
	// Print Known Locations
	var locations []models.KnownLocations
	err := db.Select(&locations, "SELECT * FROM known_locations")
	if err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Known Locations:")
	fmt.Printf("%-5s %-15s %-10s %-10s\n", "ID", "Name", "Longitude", "Latitude")
	for _, loc := range locations {
		fmt.Printf("%-5d %-15s %-10.6f %-10.6f\n", loc.ID, loc.Name, loc.Longitude, loc.Latitude)
	}
	fmt.Println()

	// Print Spots with References
	var spots []models.Spots
	err = db.Select(&spots, "SELECT * FROM spots")
	if err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Spots:")
	for _, spot := range spots {
		// Load references
		if err := spot.LoadReferences(db); err != nil {
			log.Println("Error loading references:", err)
			continue
		}

		// Print each spot
		fmt.Printf("ID: %d, Name: %s, Description: %s\n", spot.ID, spot.Name, spot.Description)
		fmt.Printf("Location: %s\n", spot.Location.Name)
		fmt.Printf("Attachments: %v\n", spot.Attachments)
		fmt.Printf("Tasks: %v\n", spot.Tasks)

		// Print JSON representation
		spotJSON, _ := json.Marshal(spot)
		fmt.Println("JSON Representation:", string(spotJSON))
		fmt.Println()
	}

	// Print Tasks
	var tasks []models.Tasks
	err = db.Select(&tasks, "SELECT * FROM tasks")
	if err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Tasks:")
	fmt.Printf("%-5s %-15s %-30s\n", "ID", "Name", "Description")
	for _, task := range tasks {
		fmt.Printf("%-5d %-15s %-30s\n", task.ID, task.Name, task.Description)
	}
	fmt.Println()

	// Print Attachments
	var attachments []models.Attachments
	err = db.Select(&attachments, "SELECT * FROM attachments")
	if err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Attachments:")
	fmt.Printf("%-5s %-15s %-30s %-30s\n", "ID", "Name", "Description", "URL")
	for _, attachment := range attachments {
		fmt.Printf("%-5d %-15s %-30s %-30s\n", attachment.ID, attachment.Name, attachment.Description, attachment.URL)
	}
	fmt.Println()
}
