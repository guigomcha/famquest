package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/connection/postgresql"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/db-manager/pkg/utils"
	"famquest/components/go-common/logger"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type UserHandler struct {
	*CRUDHandler[models.User, models.UserInputAPI, models.UserInputAPI]
}

func NewUserHandler(repo connection.CRUD[models.User]) UserHandler {
	h := &CRUDHandler[models.User, models.UserInputAPI, models.UserInputAPI]{
		repo: repo,
		name: "user",
	}
	return UserHandler{h}
}

/* ---------- tiny mappers ---------- */

func (h UserHandler) buildEntityFromCreate(dto models.UserInputAPI) models.User {
	usr := models.User{
		Name:      dto.Name,
		Email:     dto.Email,
		ExtRef:    dto.ExtRef,
		IsVirtual: dto.IsVirtual,
		Memories:  models.UUIDArray{},
		StartAt:   time.UnixMilli(dto.StartAt),
	}
	if dto.Avatar != nil {
		val := uuid.MustParse(*dto.Avatar)
		usr.Avatar = &val
	}
	if dto.Bio != nil {
		val := uuid.MustParse(*dto.Bio)
		usr.Bio = &val
	}
	if dto.EndAt != nil {
		val := time.UnixMilli(*dto.EndAt)
		usr.EndAt = &val
	}
	return usr
}

/* ---------- swagger-visible handlers ---------- */

// CreateUser godoc
// @Summary     Create user
// @Description Creates a new user
// @Tags        users
// @Accept      json
// @Produce     json
// @Param       body body models.UserInputAPI true "payload"
// @Success     201  {object} models.User
// @Failure     400  {object} models.ErrorResp
// @Failure     500  {object} models.ErrorResp
// @Router      /users [post]
func (h UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var dto models.UserInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := h.buildEntityFromCreate(dto)
	out, err := h.repo.Create(r.Context(), entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusCreated, out)
}

// GetUser godoc
// @Summary     Get user by id
// @Description Return a single user
// @Tags        users
// @Produce     json
// @Param       id  path string true "user id"
// @Success     200 {object} models.User
// @Failure     404 {object} models.ErrorResp
// @Router      /users/{id} [get]
func (h UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	out, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// UpdateUser godoc
// @Summary     Update user
// @Description Update an existing user
// @Tags        users
// @Accept      json
// @Produce     json
// @Param       id   path string         true "user id"
// @Param       body body models.UserInputAPI true "payload"
// @Success     200 {object} models.User
// @Failure     400  {object} models.ErrorResp
// @Failure     404 {object} models.ErrorResp
// @Router      /users/{id} [put]
func (h UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	usr, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	var dto models.UserInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	usr.Name = dto.Name
	usr.Email = dto.Email
	usr.ExtRef = dto.ExtRef
	usr.IsVirtual = dto.IsVirtual
	usr.Memories = dto.Memories
	usr.StartAt = time.UnixMilli(dto.StartAt)
	if dto.EndAt != nil {
		val := time.UnixMilli(*dto.EndAt)
		usr.EndAt = &val
	}
	out, err := h.repo.Update(r.Context(), id, usr)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// DeleteUser godoc
// @Summary     Delete user
// @Description Remove a user (blocked if still referenced)
// @Tags        users
// @Param       id  path string true "user id"
// @Success     204
// @Failure     400 {object} models.ErrorResp
// @Failure     404 {object} models.ErrorResp
// @Router      /users/{id} [delete]
func (h UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	err := h.repo.Delete(r.Context(), id)
	switch {
	case errors.Is(err, postgresql.ErrUserStillReferenced):
		utils.WriteJSON(w, http.StatusBadRequest,
			models.ErrorResp{Error: "user still owns media, comments, memories or trips"})
	case err != nil:
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
	default:
		w.WriteHeader(http.StatusNoContent)
	}
}

// ListUsers godoc
// @Summary     List users
// @Description Return paginated user list
// @Tags        users
// @Produce     json
// @Param       limit  query int false "page size"
// @Param       offset query int false "offset"
// @Success     200 {object} models.ListResp[models.User]
// @Router      /users [get]
func (h UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	limit, offset := utils.GetLimitOffset(r)
	logger.Log.Debugf("Requesting users")
	items, total, err := h.repo.List(r.Context(), limit, offset)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, models.ListResp[models.User]{
		Items: items,
		Total: total,
	})
}
