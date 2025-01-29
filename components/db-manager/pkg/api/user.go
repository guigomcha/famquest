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

// UserPost creates a new user
// @Summary Create a user
// @Description Create a new user
// @Tags user
// @Accept json
// @Produce json
// @Param user body models.APIUsers true "User data"
// @Success 201 {object} models.Users
// @Router /user [post]
func UserPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func UserPost")
	var user models.Users
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	dest, httpStatus, err := crudPost(&user)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
}

// UserGetAll retrieves all users
// @Summary Retrieve all users
// @Description Get a list of all users
// @Tags user
// @Produce json
// @Success 200 {array} models.Users
// @Router /user [get]
func UserGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func UserGetAll")
	dest, httpStatus, err := crudGetAll(&models.Users{}, "")
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

// UserGet retrieves a specific user by ID
// @Summary Retrieve a user by ID
// @Description Get user details by ID
// @Tags user
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.Users
// @Router /user/{id} [get]
func UserGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func UserGet")
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.Users{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(dest)
}

// UserDelete deletes a user by ID
// @Summary Delete a user by ID
// @Description Delete a user and nullify its references in users
// @Tags user
// @Produce json
// @Param id path int true "User ID"
// @Success 204 {string} string "No Content"
// @Router /user/{id} [delete]
func UserDelete(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func UserDelete")
	// First delete the user
	var user models.Users
	httpStatus, err := crudDelete(&user, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// UserPut updates a user by ID
// @Summary Update a user by ID
// @Description Update user details by ID
// @Tags user
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param user body models.APIUsers true "User data"
// @Success 200 {object} models.Users
// @Router /user/{id} [put]
func UserPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func UserPut")
	var user models.Users
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Info("received payload %+v", user)
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if user.ID > 0 && user.ID != intId {
		http.Error(w, fmt.Sprintf("user id in payload '%d' and path '%d' do not match", user.ID, intId), http.StatusBadRequest)
		return
	}
	user.ID = intId
	// Update the user
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&user, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
