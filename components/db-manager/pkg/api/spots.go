package api

import (
	"encoding/json"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

// SpotPost creates a new spot
// @Summary Create a spot
// @Description Create a new spot
// @Tags spot
// @Accept json
// @Produce json
// @Param spot body models.Spots true "Spot data"
// @Success 201 {object} models.Spots
// @Router /spot [post]
func SpotPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func SpotPost")

	var spot models.Spots
	if err := json.NewDecoder(r.Body).Decode(&spot); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	httpStatus, err := crudPost(&spot)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(spot)
}

// SpotGetAll retrieves all spots
// @Summary Retrieve all spots
// @Description Get a list of all spots
// @Tags spot
// @Produce json
// @Success 200 {array} models.Spots
// @Router /spot [get]
func SpotGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func SpotGetAll")
	var spots []models.Spots
	httpStatus, err := crudGetAll(&spots)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(spots)
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
	var spot models.Spots
	httpStatus, err := crudGet(&spot, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(spot)
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
	// First delete the spot
	var spot models.Spots
	httpStatus, err := crudDelete(&spot, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	// Now Nullify spot_ref in attachments and tasks. Custom to the endpoint
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	tNames := []string{"attachments", "tasks"}
	errMessages := []string{}
	for _, tName := range tNames {
		_, err = db.Exec("UPDATE $1 SET ref = NULL AND ref_type =NULL WHERE ref = $2 AND ref_type = 'SpotType'", tName, mux.Vars(r)["id"])
		if err != nil {
			errMessages = append(errMessages, err.Error())
		}
	}
	if len(errMessages) > 0 {
		http.Error(w, strings.Join(errMessages, "\n"), http.StatusInternalServerError)
		return
	}
	_, err = db.Exec("UPDATE attachments SET ref = NULL AND ref_type =NULL WHERE ref = $1 AND ref_type = 'SpotType'", mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
// @Param spot body models.Spots true "Spot data"
// @Success 200 {object} models.Spots
// @Router /spot/{id} [put]
func SpotPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func SpotPut")
	var spot models.Spots
	err := json.NewDecoder(r.Body).Decode(&spot)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
	// Update the spot
	logger.Log.Debug("Decoded object")
	httpStatus, err := crudPut(&spot, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(spot)
}
