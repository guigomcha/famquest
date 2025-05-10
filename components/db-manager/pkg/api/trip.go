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

// TripPost creates a new trip
// @Summary Create a trip
// @Description Create a new trip
// @Tags trip
// @Accept json
// @Produce json
// @Param trip body models.APITrips true "Trip data"
// @Success 201 {object} models.Trips
// @Router /trip [post]
func TripPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TripPost")
	info := handleHeaders(w, r)
	var trip models.Trips
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&trip); err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")

	trip.RefUserUploader = info["user"].(int)
	dest, httpStatus, err := crudPost(&trip)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
}

// TripGetAll retrieves all trips
// @Summary Retrieve all trips
// @Description Get a list of all trips
// @Tags trip
// @Produce json
// @Success 200 {array} models.Trips
// @Router /trip [get]
func TripGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TripGetAll")
	handleHeaders(w, r)
	dest, httpStatus, err := crudGetAll(&models.Trips{}, "")
	logger.Log.Debugf("objects obtained '%d'", len(dest))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	if len(dest) == 0 {
		empty := make([]string, 0)
		json.NewEncoder(w).Encode(empty)
	} else {
		json.NewEncoder(w).Encode(dest)
	}
}

// TripGet retrieves a specific trip by ID
// @Summary Retrieve a trip by ID
// @Description Get trip details by ID
// @Tags trip
// @Produce json
// @Param id path int true "Trip ID"
// @Success 200 {object} models.Trips
// @Router /trip/{id} [get]
func TripGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TripGet")
	handleHeaders(w, r)
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.Trips{}, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(dest)
}

// TripDelete deletes a trip by ID
// @Summary Delete a trip by ID
// @Description Delete a trip and nullify its references in spots
// @Tags trip
// @Produce json
// @Param id path int true "Trip ID"
// @Success 204 {string} string "No Content"
// @Router /trip/{id} [delete]
func TripDelete(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TripDelete")
	handleHeaders(w, r)
	// First delete the trip
	var trip models.Trips
	httpStatus, err := crudDelete(&trip, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// TripPut updates a trip by ID
// @Summary Update a trip by ID
// @Description Update trip details by ID
// @Tags trip
// @Accept json
// @Produce json
// @Param id path int true "Trip ID"
// @Param trip body models.APITrips true "Trip data"
// @Success 200 {object} models.Trips
// @Router /trip/{id} [put]
func TripPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TripPut")
	info := handleHeaders(w, r)
	var trip models.Trips
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&trip)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if trip.ID > 0 && trip.ID != intId {
		msg := fmt.Sprintf("trip id in payload '%d' and path '%d' do not match", trip.ID, intId)
		logger.Log.Error(msg)
		http.Error(w, fmt.Sprintf("trip id in payload '%d' and path '%d' do not match", trip.ID, intId), http.StatusBadRequest)
		return
	}
	trip.ID = intId
	trip.RefUserUploader = info["user"].(int)
	// Update the trip
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&trip, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
