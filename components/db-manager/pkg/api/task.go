package api

import (
	"encoding/json"
	"errors"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

// TaskPost creates a new task
// @Summary Create a task
// @Description Create a new task
// @Tags task
// @Accept json
// @Produce json
// @Param task body models.APITasks true "Task data"
// @Success 201 {object} models.Tasks
// @Router /task [post]
func TaskPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TaskPost")
	var task models.Tasks
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	if ref := r.URL.Query().Get("ref"); ref != "" {
		if intId, err := parseId(ref); err != nil {
			task.RefId = intId
			task.RefType = r.URL.Query().Get("refType")
		}
	}
	dest, httpStatus, err := crudPost(&task)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
}

// TaskGetAll retrieves all tasks
// @Summary Retrieve all tasks
// @Description Get a list of all tasks
// @Tags task
// @Produce json
// @Success 200 {array} models.Tasks
// @Router /task [get]
func TaskGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TaskGetAll")
	dest, httpStatus, err := crudGetAll(&models.Tasks{}, "")
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

// TaskGet retrieves a specific task by ID
// @Summary Retrieve a task by ID
// @Description Get task details by ID
// @Tags task
// @Produce json
// @Param id path int true "Task ID"
// @Success 200 {object} models.Tasks
// @Router /task/{id} [get]
func TaskGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TaskGet")
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.Tasks{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(dest)
}

// TaskDelete deletes a task by ID
// @Summary Delete a task by ID
// @Description Delete a task and nullify its references in spots
// @Tags task
// @Produce json
// @Param id path int true "Task ID"
// @Success 204 {string} string "No Content"
// @Router /task/{id} [delete]
func TaskDelete(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TaskDelete")
	// First delete the task
	var task models.Tasks
	httpStatus, err := crudDelete(&task, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// TaskPut updates a task by ID
// @Summary Update a task by ID
// @Description Update task details by ID
// @Tags task
// @Accept json
// @Produce json
// @Param id path int true "Task ID"
// @Param task body models.APITasks true "Task data"
// @Success 200 {object} models.Tasks
// @Router /task/{id} [put]
func TaskPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TaskPut")
	var task models.Tasks
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if task.ID > 0 && task.ID != intId {
		http.Error(w, fmt.Sprintf("task id in payload '%d' and path '%d' do not match", task.ID, intId), http.StatusBadRequest)
		return
	}
	task.ID = intId
	// Update the task
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&task, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}

// TaskPut
// @Summary Update the ref
// @Description Update the ref in a task details by ID
// @Tags task
// @Produce json
// @Param id path int true "Task ID"
// @Param ref query int true "Reference ID (optional)"
// @Param refType query string true "Reference Type" Enums(spot)
// @Success 200 {object} models.Tasks
// @Router /task/{id}/ref [put]
func TaskPutRef(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func TaskPutRef")
	// first ensure ref is ok
	intId, err := parseId(r.URL.Query().Get("ref"))
	if err != nil || intId == 0 {
		http.Error(w, fmt.Sprintf("Ref error or cero: %+v", err), http.StatusBadRequest)
		return
	}
	var dest connection.DbInterface
	var httpStatus int
	if r.URL.Query().Get("refType") == "spot" {
		_, httpStatus, err = crudGet(&models.Spots{}, map[string]string{"id": fmt.Sprint(intId)})
	} else {
		httpStatus = http.StatusBadRequest
		err = errors.New("not yet implemented")
	}
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	logger.Log.Debug("Ref seems ok")
	// Now bring the original task
	dest, httpStatus, err = crudGet(&models.Tasks{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	task, ok := dest.(*models.Tasks)
	if !ok {
		http.Error(w, fmt.Sprintf("Unable to cast the struct correctly from %+v", dest), http.StatusInternalServerError)
		return
	}
	task.RefId = intId
	task.RefType = r.URL.Query().Get("refType")
	// Update the task which will trigger the GetInsertExtraQueries
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err = crudPut(dest, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
