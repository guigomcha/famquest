package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"
)

const (
	baseURL      = "http://localhost:8080"
	initialLat   = 37.31942002016036
	initialLng   = -6.0678988062297465
	numLocations = 10
	numSpots     = 4
)

type APIKnownLocations struct {
	Name      string  `json:"name"`
	Longitude float64 `json:"longitude"`
	Latitude  float64 `json:"latitude"`
}

type APISpots struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func main() {
	populateDB()
	spotIDs := []int{1, 2, 3, 4}
	locationIDs := []int{1, 3, 5, 6}
	// Link spots to locations
	for i, spotID := range spotIDs {
		locationID := locationIDs[i%numLocations] // Distribute spots across locations
		linkSpotToLocation(locationID, spotID)
	}
}

func populateDB() {
	rand.Seed(time.Now().UnixNano())

	// Create locations
	var locationIDs []int
	for i := 0; i < numLocations; i++ {
		lat := initialLat + (rand.Float64()-0.5)*0.1 // Offset by up to 0.05 degrees
		lng := initialLng + (rand.Float64()-0.5)*0.1 // Offset by up to 0.05 degrees

		location := APIKnownLocations{
			Name:      fmt.Sprintf("Location %d", i+1),
			Longitude: lng,
			Latitude:  lat,
		}

		// POST request to create the location
		resp, err := postRequest(fmt.Sprintf("%s/location", baseURL), location)
		if err != nil {
			fmt.Printf("Error creating location: %v\n", err)
			continue
		}

		// Store the location ID for later use
		locationIDs = append(locationIDs, resp.ID)
	}

	// Create spots
	var spotIDs []int
	for i := 0; i < numSpots; i++ {
		spot := APISpots{
			Name:        fmt.Sprintf("Spot %d", i+1),
			Description: fmt.Sprintf("Description for Spot %d", i+1),
		}

		// POST request to create the spot
		resp, err := postRequest(fmt.Sprintf("%s/spot", baseURL), spot)
		if err != nil {
			fmt.Printf("Error creating spot: %v\n", err)
			continue
		}

		// Store the spot ID for linking
		spotIDs = append(spotIDs, resp.ID)
	}
}

func postRequest(url string, data interface{}) (*ResponseID, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusAccepted {
		return nil, fmt.Errorf("failed to create resource: %s", resp.Status)
	}

	var responseID ResponseID
	if err := json.NewDecoder(resp.Body).Decode(&responseID); err != nil {
		return nil, err
	}

	return &responseID, nil
}

func linkSpotToLocation(locationID, spotID int) {
	url := fmt.Sprintf("%s/location/%d/ref?ref=%d&refType=spot", baseURL, locationID, spotID)

	// Create a new PUT request
	req, err := http.NewRequest("PUT", url, nil)
	if err != nil {
		fmt.Printf("Error creating request to link spot %d to location %d\n", spotID, locationID)
		return
	}

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error linking spot %d to location %d\n", spotID, locationID)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("Failed to link spot %d to location %d: %s\n", spotID, locationID, resp.Status)
	} else {
		fmt.Printf("Successfully linked spot %d to location %d\n", spotID, locationID)
	}
}

// ResponseID is a placeholder for the response containing the ID of the created resource
type ResponseID struct {
	ID int `json:"id"`
}
