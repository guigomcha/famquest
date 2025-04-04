package api

import (
	"encoding/json"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"
	"net/http"
	"reflect"

	"github.com/gorilla/mux"
)

// SpotPost creates a new spot
// @Summary Create a spot
// @Description Create a new spot
// @Tags spot
// @Accept json
// @Produce json
// @Param spot body models.APISpots true "Spot data"
// @Success 201 {object} models.Spots
// @Router /spot [post]
func SpotPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func SpotPost")
	info := handleHeaders(w, r)
	var spot models.Spots
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&spot); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	spot.RefUserUploader = info["user"].(int)
	dest, httpStatus, err := crudPost(&spot)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
}

// SpotGetAll retrieves all spots
// @Summary Retrieve all spots
// @Description Get a list of all spots
// @Tags spot
// @Produce json
// @Success 200 {array} models.Spots
// @Router /spot [get]
func SpotGetAll(w http.ResponseWriter, r *http.Request) {
	//Allow CORS here By * or specific origin
	// w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	handleHeaders(w, r)
	logger.Log.Info("Called to func SpotGetAll")
	dest, httpStatus, err := crudGetAll(&models.Spots{}, "")
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

// SpotGet retrieves a specific spot by ID
// @Summary Retrieve a spot by ID
// @Description Get spot details by ID
// @Tags spot
// @Produce json
// @Param id path int true "Spot ID"
// @Success 200 {object} models.Spots
// @Router /spot/{id} [get]
func SpotGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func SpotGet")
	handleHeaders(w, r)
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.Spots{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(dest)
}

// SpotDelete deletes a spot by ID
// @Summary Delete a spot by ID
// @Description Delete a spot and nullify its references in spots
// @Tags spot
// @Produce json
// @Param id path int true "Spot ID"
// @Success 204 {string} string "No Content"
// @Router /spot/{id} [delete]
func SpotDelete(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func SpotDelete")
	handleHeaders(w, r)
	var spot models.Spots
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	// Cannot delete if there are things connected to this
	models := []connection.DbInterface{&models.Attachments{}, &models.Notes{}}
	for _, modelType := range models {
		filter := fmt.Sprintf("WHERE ref_id = %d AND ref_type = 'spot'", intId)
		destsList, httpStatus, err := crudGetAll(modelType, filter)
		logger.Log.Debugf("objects obtained for %s: %d --- '%s'", reflect.TypeOf(modelType).Elem().Name(), len(destsList), filter)
		if err != nil {
			logger.Log.Debugf("Unable to search dependencies %s", err.Error())
			http.Error(w, err.Error(), httpStatus)
			return
		}
		// Check if there are linked items for the current model type
		if len(destsList) > 0 {
			http.Error(w, "Cannot delete if there are things linked to it", http.StatusBadRequest)
			return
		}
	}

	// linked location and discovered handled directly via sql GetDeleteExtraQueries
	httpStatus, err := crudDelete(&spot, mux.Vars(r))
	if err != nil {
		logger.Log.Debugf("Unable to delete %s", err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// SpotPut updates a spot by ID
// @Summary Update a spot by ID
// @Description Update spot details by ID
// @Tags spot
// @Accept json
// @Produce json
// @Param id path int true "Spot ID"
// @Param spot body models.APISpots true "Spot data"
// @Success 200 {object} models.Spots
// @Router /spot/{id} [put]
func SpotPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func SpotPut")
	info := handleHeaders(w, r)
	var spot models.Spots
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&spot)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if spot.ID > 0 && spot.ID != intId {
		http.Error(w, fmt.Sprintf("spot id in payload '%d' and path '%d' do not match", spot.ID, intId), http.StatusBadRequest)
		return
	}
	spot.ID = intId
	spot.RefUserUploader = info["user"].(int)
	// Update the spot
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&spot, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
