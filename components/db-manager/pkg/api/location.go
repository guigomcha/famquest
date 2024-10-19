package api

import (
	"encoding/json"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"
	"net/http"
	"strconv"

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
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var location models.KnownLocations
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("location decoded")
	if lastInsertId, err := connection.Insert(db, &location); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if err := connection.Get(db, models.KnownLocations{}, lastInsertId, &location); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else {
		logger.Log.Debugf("location created: %d", lastInsertId)
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
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var locations []models.KnownLocations
	if err := connection.GetAll(db, models.KnownLocations{}, &locations); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	vars := mux.Vars(r)
	id := vars["id"]
	intId, err := strconv.Atoi(id) //ParseInt(id, 0 , 64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var location models.KnownLocations
	if err := connection.Get(db, models.KnownLocations{}, intId, &location); err != nil {
		logger.Log.Debugf("Unable to Get: %d", intId)
		if err.Error() == connection.ErrorIdDoesNotExits {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	vars := mux.Vars(r)
	id := vars["id"]
	intId, err := strconv.Atoi(id) //ParseInt(id, 0 , 64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	// First delete the location
	if err := connection.Delete(db, models.KnownLocations{}, intId); err != nil {
		logger.Log.Debugf("Unable to delete: %d", intId)
		if err.Error() == connection.ErrorIdDoesNotExits {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Now Nullify location_ref in spots
	_, err = db.Exec("UPDATE spots SET location_ref = NULL WHERE location_ref = $1", id)
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
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	vars := mux.Vars(r)
	id := vars["id"]
	intId, err := strconv.Atoi(id) //ParseInt(id, 0 , 64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var location models.KnownLocations
	err = json.NewDecoder(r.Body).Decode(&location)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if location.ID > 0 && location.ID != intId {
		http.Error(w, fmt.Sprintf("location id in payload '%d' and path '%d' do not match", location.ID, intId), http.StatusBadRequest)
		return
	}
	location.ID = intId
	// Update the location
	logger.Log.Debug("Decoded Location")
	if err := connection.Update(db, &location); err != nil {
		logger.Log.Debugf("Unable to update: %d", location.ID)
		if err.Error() == connection.ErrorIdDoesNotExits {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Return latest location
	if err := connection.Get(db, models.KnownLocations{}, intId, &location); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(location)
}
