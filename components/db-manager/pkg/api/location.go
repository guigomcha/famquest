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
// @Success 201 {object} models.KnownLocations
// @Router /location [post]
func LocationPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationPost")
	info := handleHeaders(w, r)
	var location models.KnownLocations
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	if ref := r.URL.Query().Get("ref"); ref != "" {
		if intId, err := parseId(ref); err != nil {
			location.RefId = intId
			location.RefType = r.URL.Query().Get("refType")
		}
	}
	location.RefUserUploader = info["user"].(int)
	dest, httpStatus, err := crudPost(&location)
	if err != nil {
		logger.Log.Error(err.Error())
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
	handleHeaders(w, r)
	dest, httpStatus, err := crudGetAll(&models.KnownLocations{}, "")
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
	handleHeaders(w, r)
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.KnownLocations{}, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
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
	handleHeaders(w, r)
	// First delete the location
	var location models.KnownLocations
	httpStatus, err := crudDelete(&location, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
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
	info := handleHeaders(w, r)
	var location models.KnownLocations
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&location)
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
	if location.ID > 0 && location.ID != intId {
		msg := fmt.Sprintf("location id in payload '%d' and path '%d' do not match", location.ID, intId)
		logger.Log.Error(msg)
		http.Error(w, fmt.Sprintf("location id in payload '%d' and path '%d' do not match", location.ID, intId), http.StatusBadRequest)
		return
	}
	location.ID = intId
	location.RefUserUploader = info["user"].(int)
	// Update the location
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&location, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
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
// @Param refId query int true "Reference ID (optional)"
// @Param refType query string true "Reference Type" Enums(spot,user)
// @Success 200 {object} models.KnownLocations
// @Router /location/{id}/ref [put]
func LocationPutRef(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func LocationPutRef")
	info := handleHeaders(w, r)
	// first ensure ref is ok
	intId, err := parseId(r.URL.Query().Get("refId"))
	if err != nil || intId == 0 {
		msg := fmt.Sprintf("Ref error or cero: %+v", err)
		logger.Log.Error(msg)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}
	var dest connection.DbInterface
	var httpStatus int
	switch r.URL.Query().Get("refType") {
	case "spot":
		_, httpStatus, err = crudGet(&models.Spots{}, map[string]string{"id": fmt.Sprint(intId)})
	case "user":
		_, httpStatus, err = crudGet(&models.Users{}, map[string]string{"id": fmt.Sprint(intId)})
	default:
		err = fmt.Errorf("reftype '%s' not implemented", r.URL.Query().Get("refType"))
		httpStatus = http.StatusBadRequest
	}
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	logger.Log.Debug("Ref seems ok") // Now bring the original location
	dest, httpStatus, err = crudGet(&models.KnownLocations{}, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	location, ok := dest.(*models.KnownLocations)
	if !ok {
		msg := fmt.Sprintf("Unable to cast the struct correctly from %+v", dest)
		logger.Log.Error(msg)
		http.Error(w, msg, http.StatusInternalServerError)
		return
	}
	location.RefId = intId
	location.RefType = r.URL.Query().Get("refType")
	location.RefUserUploader = info["user"].(int)
	// Update the location which will trigger the GetInsertExtraQueries
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err = crudPut(location, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
