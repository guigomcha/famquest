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

// NotePost creates a new note
// @Summary Create a note
// @Description Create a new note
// @Tags note
// @Accept json
// @Produce json
// @Param note body models.APINotes true "Note data"
// @Success 201 {object} models.Notes
// @Router /note [post]
func NotePost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func NotePost")
	info := handleHeaders(w, r)
	var note models.Notes
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	note.RefUserUploader = info["user"].(int)
	dest, httpStatus, err := crudPost(&note)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
}

// NoteGetAll retrieves all notes
// @Summary Retrieve all notes
// @Description Get a list of all notes
// @Tags note
// @Produce json
// @Success 200 {array} models.Notes
// @Router /note [get]
func NoteGetAll(w http.ResponseWriter, r *http.Request) {
	//Allow CORS here By * or specific origin
	// w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	handleHeaders(w, r)
	logger.Log.Info("Called to func NoteGetAll")
	dest, httpStatus, err := crudGetAll(&models.Notes{}, "")
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

// NoteGet retrieves a specific note by ID
// @Summary Retrieve a note by ID
// @Description Get note details by ID
// @Tags note
// @Produce json
// @Param id path int true "Note ID"
// @Success 200 {object} models.Notes
// @Router /note/{id} [get]
func NoteGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func NoteGet")
	handleHeaders(w, r)
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.Notes{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(dest)
}

// NoteDelete deletes a note by ID
// @Summary Delete a note by ID
// @Description Delete a note and nullify its references in notes
// @Tags note
// @Produce json
// @Param id path int true "Note ID"
// @Success 204 {string} string "No Content"
// @Router /note/{id} [delete]
func NoteDelete(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func NoteDelete")
	handleHeaders(w, r)
	// Cannot delete if there are things connected to this
	var note models.Notes
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	models := []connection.DbInterface{&models.Notes{}}
	for _, modelType := range models {
		filter := fmt.Sprintf("WHERE ref_id = %d AND ref_type = 'note'", intId)
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
	// First delete the note
	httpStatus, err := crudDelete(&note, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// NotePut updates a note by ID
// @Summary Update a note by ID
// @Description Update note details by ID
// @Tags note
// @Accept json
// @Produce json
// @Param id path int true "Note ID"
// @Param note body models.APINotes true "Note data"
// @Success 200 {object} models.Notes
// @Router /note/{id} [put]
func NotePut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func NotePut")
	info := handleHeaders(w, r)
	var note models.Notes
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&note)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if note.ID > 0 && note.ID != intId {
		http.Error(w, fmt.Sprintf("note id in payload '%d' and path '%d' do not match", note.ID, intId), http.StatusBadRequest)
		return
	}
	note.ID = intId
	note.RefUserUploader = info["user"].(int)
	// Update the note
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&note, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}

// NotePut
// @Summary Update the ref
// @Description Update the ref in a note details by ID
// @Tags note
// @Produce json
// @Param id path int true "Note ID"
// @Param refId query int true "Reference ID (optional)"
// @Param refType query string true "Reference Type" Enums(spot,user)
// @Success 200 {object} models.Notes
// @Router /note/{id}/ref [put]
func NotePutRef(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func NotePutRef")
	info := handleHeaders(w, r)
	// first ensure ref is ok
	intId, err := parseId(r.URL.Query().Get("refId"))
	if err != nil || intId == 0 {
		http.Error(w, fmt.Sprintf("Ref error or cero: %+v", err), http.StatusBadRequest)
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
	logger.Log.Debug("Ref seems ok")
	// Now bring the original Note
	dest, httpStatus, err = crudGet(&models.Notes{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	note, ok := dest.(*models.Notes)
	if !ok {
		http.Error(w, fmt.Sprintf("Unable to cast the struct correctly from %+v", dest), http.StatusInternalServerError)
		return
	}
	note.RefId = intId
	note.RefType = r.URL.Query().Get("refType")
	note.RefUserUploader = info["user"].(int)
	// Update the note which will trigger the GetInsertExtraQueries
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err = crudPut(dest, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
