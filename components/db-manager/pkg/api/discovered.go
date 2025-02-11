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

// DiscoveredPost creates a new discovered
// @Summary Create a discovered
// @Description Create a new discovered
// @Tags discovered
// @Accept json
// @Produce json
// @Param discovered body models.APIDiscovered true "Discovered data"
// @Success 201 {object} models.Discovered
// @Router /discovered [post]
func DiscoveredPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredPost")
	//info := handleHeaders(w, r)
	var discovered models.Discovered
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&discovered); err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	dest, httpStatus, err := crudPost(&discovered)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
}

// DiscoveredGetAll retrieves all discovereds
// @Summary Retrieve all discovereds
// @Description Get a list of all discovereds
// @Tags discovered
// @Produce json
// @Success 200 {array} models.Discovered
// @Router /discovered [get]
func DiscoveredGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredGetAll")
	handleHeaders(w, r)
	dest, httpStatus, err := crudGetAll(&models.Discovered{}, "")
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

// DiscoveredGet retrieves a specific discovered by ID
// @Summary Retrieve a discovered by ID
// @Description Get discovered details by ID
// @Tags discovered
// @Produce json
// @Param id path int true "Discovered ID"
// @Success 200 {object} models.Discovered
// @Router /discovered/{id} [get]
func DiscoveredGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredGet")
	handleHeaders(w, r)
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.Discovered{}, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(dest)
}

// DiscoveredDelete deletes a discovered by ID
// @Summary Delete a discovered by ID
// @Description Delete a discovered entry
// @Tags discovered
// @Produce json
// @Param id path int true "Discovered ID"
// @Success 204 {string} string "No Content"
// @Router /discovered/{id} [delete]
func DiscoveredDelete(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredDelete")
	handleHeaders(w, r)
	// First delete the discovered
	var discovered models.Discovered
	httpStatus, err := crudDelete(&discovered, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// DiscoveredPut updates a discovered by ID
// @Summary Update a discovered by ID
// @Description Update discovered details by ID
// @Tags discovered
// @Accept json
// @Produce json
// @Param id path int true "Discovered ID"
// @Param discovered body models.APIDiscovered true "Discovered data"
// @Success 200 {object} models.Discovered
// @Router /discovered/{id} [put]
func DiscoveredPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredPut")
	//info := handleHeaders(w, r)
	var discovered models.Discovered
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&discovered)
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
	if discovered.ID > 0 && discovered.ID != intId {
		msg := fmt.Sprintf("discovered id in payload '%d' and path '%d' do not match", discovered.ID, intId)
		logger.Log.Error(msg)
		http.Error(w, fmt.Sprintf("discovered id in payload '%d' and path '%d' do not match", discovered.ID, intId), http.StatusBadRequest)
		return
	}
	discovered.ID = intId
	// Update the discovered
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&discovered, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}

// DiscoveredPut
// @Summary Update the ref
// @Description Update the ref in a discovered details by ID
// @Tags discovered
// @Produce json
// @Param id path int true "Discovered ID"
// @Param refId query int true "Reference ID (optional)"
// @Param refType query string true "Reference Type" Enums(spot,location,note,attachment)
// @Success 200 {object} models.Discovered
// @Router /discovered/{id}/ref [put]
func DiscoveredPutRef(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredPutRef")
	//info := handleHeaders(w, r)
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
	case "attachment":
		_, httpStatus, err = crudGet(&models.Attachments{}, map[string]string{"id": fmt.Sprint(intId)})
	case "note":
		_, httpStatus, err = crudGet(&models.Notes{}, map[string]string{"id": fmt.Sprint(intId)})
	case "location":
		_, httpStatus, err = crudGet(&models.KnownLocations{}, map[string]string{"id": fmt.Sprint(intId)})
	default:
		err = fmt.Errorf("reftype '%s' not implemented", r.URL.Query().Get("refType"))
		httpStatus = http.StatusBadRequest
	}
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	logger.Log.Debug("Ref seems ok")
	// Now bring the original discovered
	dest, httpStatus, err = crudGet(&models.Discovered{}, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	discovered, ok := dest.(*models.Discovered)
	if !ok {
		msg := fmt.Sprintf("Unable to cast the struct correctly from %+v", dest)
		logger.Log.Error(msg)
		http.Error(w, msg, http.StatusInternalServerError)
		return
	}
	discovered.RefId = intId
	discovered.RefType = r.URL.Query().Get("refType")
	// Update the discovered which will trigger the GetInsertExtraQueries
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err = crudPut(dest, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
