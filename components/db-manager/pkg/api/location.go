package api

import (
	"encoding/json"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

// LocationPost creates a new location
// @Summary Create a location
// @Description Create a new location
// @Tags location
// @Accept json
// @Produce json
// @Param location body models.KnownLocations true "Location data"
// @Success 201 {object} models.KnownLocations
// @Router /location [post]
func LocationPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationPost")

	var location models.KnownLocations
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	httpStatus, err := crudPost(&location)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(location)
}

// LocationGetAll retrieves all locations
// @Summary Retrieve all locations
// @Description Get a list of all locations
// @Tags location
// @Produce json
// @Success 200 {array} models.KnownLocations
// @Router /location [get]
func LocationGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationGetAll")
	var locations []models.KnownLocations
	httpStatus, err := crudGetAll(&locations)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(locations)
}

// LocationGet retrieves a specific location by ID
// @Summary Retrieve a location by ID
// @Description Get location details by ID
// @Tags location
// @Produce json
// @Param id path int true "Location ID"
// @Success 200 {object} models.KnownLocations
// @Router /location/{id} [get]
func LocationGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationGet")
	var location models.KnownLocations
	httpStatus, err := crudGet(&location, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(location)
}

// LocationDelete deletes a location by ID
// @Summary Delete a location by ID
// @Description Delete a location and nullify its references in spots
// @Tags location
// @Produce json
// @Param id path int true "Location ID"
// @Success 204 {string} string "No Content"
// @Router /location/{id} [delete]
func LocationDelete(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationDelete")
	// First delete the location
	var location models.KnownLocations
	httpStatus, err := crudDelete(&location, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	// Now Nullify location_ref in spots. Custom to the endpoint
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	_, err = db.Exec("UPDATE spots SET location_ref = NULL WHERE location_ref = $1", mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// LocationPut updates a location by ID
// @Summary Update a location by ID
// @Description Update location details by ID
// @Tags location
// @Accept json
// @Produce json
// @Param id path int true "Location ID"
// @Param location body models.KnownLocations true "Location data"
// @Success 200 {object} models.KnownLocations
// @Router /location/{id} [put]
func LocationPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationPut")
	var location models.KnownLocations
	err := json.NewDecoder(r.Body).Decode(&location)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if location.ID > 0 && location.ID != intId {
		http.Error(w, fmt.Sprintf("location id in payload '%d' and path '%d' do not match", location.ID, intId), http.StatusBadRequest)
		return
	}
	location.ID = intId
	// Update the location
	logger.Log.Debug("Decoded object")
	httpStatus, err := crudPut(&location, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(location)
}
