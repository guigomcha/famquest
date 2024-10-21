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
// @Param location body models.APIKnownLocations true "Location data"
// @Param ref query int false "Reference ID (optional)"
// @Param refType query string false "Reference Type" Enums(spot)
// @Success 201 {object} models.KnownLocations
// @Router /location [post]
func LocationPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationPost")
	var location models.KnownLocations
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	if ref := r.URL.Query().Get("ref"); ref != "" {
		if intId, err := parseId(ref); err != nil {
			location.Ref = intId
			location.RefType = r.URL.Query().Get("refType")
		}
	}
	dest, httpStatus, err := crudPost(&location)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
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
	dest, httpStatus, err := crudGetAll(&models.KnownLocations{})
	logger.Log.Debugf("objects obtained '%d'", len(dest))
	if err != nil {
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
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.KnownLocations{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(dest)
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
	w.WriteHeader(http.StatusNoContent)
}

// LocationPut updates a location by ID
// @Summary Update a location by ID
// @Description Update location details by ID
// @Tags location
// @Accept json
// @Produce json
// @Param id path int true "Location ID"
// @Param location body models.APIKnownLocations true "Location data"
// @Success 200 {object} models.KnownLocations
// @Router /location/{id} [put]
func LocationPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationPut")
	var location models.KnownLocations
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&location)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
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
	dest, httpStatus, err := crudPut(&location, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}

// LocationPut
// @Summary Update the ref
// @Description Update the ref in a location details by ID
// @Tags location
// @Produce json
// @Param id path int true "Location ID"
// @Param ref query int true "Reference ID (optional)"
// @Param refType query string true "Reference Type" Enums(spot)
// @Success 200 {object} models.KnownLocations
// @Router /location/{id}/ref [put]
func LocationPutRef(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationPutRef")
	// first ensure ref is ok
	intId, err := parseId(r.URL.Query().Get("ref"))
	if err != nil || intId == 0 {
		http.Error(w, fmt.Sprintf("Ref error or cero: %+v", err), http.StatusBadRequest)
		return
	}
	var dest connection.DbInterface
	_, httpStatus, err := crudGet(&models.Spots{}, map[string]string{"id": fmt.Sprint(intId)})
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	logger.Log.Debug("Ref to Spot seems ok")
	// Now bring the original location
	dest, httpStatus, err = crudGet(&models.KnownLocations{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	location, ok := dest.(*models.KnownLocations)
	if !ok {
		http.Error(w, fmt.Sprintf("Unable to cast the struct correctly from %+v", dest), http.StatusInternalServerError)
		return
	}
	location.Ref = intId
	location.RefType = r.URL.Query().Get("refType")
	// Update the location which will trigger the GetInsertExtraQueries
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err = crudPut(dest, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
