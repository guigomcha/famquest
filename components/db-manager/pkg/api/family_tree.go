package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	
	"github.com/gorilla/mux"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
)

// FamilyTreePost creates a new familyTree
// @Summary Create a familyTree
// @Description Create a new familyTree
// @Tags familyTree
// @Accept json
// @Produce json
// @Param familyTree body models.APIFamilyTree true "FamilyTree data"
// @Success 201 {object} models.FamilyTree
// @Router /familyTree [post]
func FamilyTreePost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func FamilyTreePost")
	// TODO: There should only be 1 POST allowed
	var familyTree models.FamilyTree
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&familyTree); err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	dest, httpStatus, err := crudPost(&familyTree)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
}

// FamilyTreeGetAll retrieves all familyTrees
// @Summary Retrieve all familyTrees
// @Description Get a list of all familyTrees
// @Tags familyTree
// @Produce json
// @Success 200 {array} models.FamilyTree
// @Router /familyTree [get]
func FamilyTreeGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func FamilyTreeGetAll")
	handleHeaders(w, r)
	dest, httpStatus, err := crudGetAll(&models.FamilyTree{}, "")
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

// FamilyTreeGet retrieves a specific familyTree by ID
// @Summary Retrieve a familyTree by ID
// @Description Get familyTree details by ID
// @Tags familyTree
// @Produce json
// @Param id path int true "FamilyTree ID"
// @Success 200 {object} models.FamilyTree
// @Router /familyTree/{id} [get]
func FamilyTreeGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func FamilyTreeGet")
	handleHeaders(w, r)
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.FamilyTree{}, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(dest)
}

// There is no delete required

// FamilyTreePut updates a familyTree by ID
// @Summary Update a familyTree by ID
// @Description Update familyTree details by ID
// @Tags familyTree
// @Accept json
// @Produce json
// @Param id path int true "FamilyTree ID"
// @Param familyTree body models.APIFamilyTree true "FamilyTree data"
// @Success 200 {object} models.FamilyTree
// @Router /familyTree/{id} [put]
func FamilyTreePut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func FamilyTreePut")
	var familyTree models.FamilyTree
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&familyTree)
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
	if familyTree.ID > 0 && familyTree.ID != intId {
		msg := fmt.Sprintf("familyTree id in payload '%d' and path '%d' do not match", familyTree.ID, intId)
		logger.Log.Error(msg)
		http.Error(w, fmt.Sprintf("familyTree id in payload '%d' and path '%d' do not match", familyTree.ID, intId), http.StatusBadRequest)
		return
	}
	familyTree.ID = intId

	// Update the familyTree
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&familyTree, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
