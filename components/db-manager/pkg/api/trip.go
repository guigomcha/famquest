package api

import (
	"encoding/json"
	"net/http"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/db-manager/pkg/utils"

	"github.com/gorilla/mux"
)

type TripHandler struct {
	*CRUDHandler[models.Trip, models.TripInputAPI, models.TripInputAPI]
}

func NewTripHandler(repo connection.CRUD[models.Trip]) TripHandler {
	h := &CRUDHandler[models.Trip, models.TripInputAPI, models.TripInputAPI]{
		repo: repo,
		name: "trip",
	}
	return TripHandler{h}
}

func (h TripHandler) buildEntityFromInput(dto models.TripInputAPI) models.Trip {
	t := models.Trip{
		Name:           dto.Name,
		Transportation: dto.Transportation,
		Stops:          dto.Stops,
		DescriptionId:  dto.DescriptionId,
	}
	if dto.StartAt != nil {
		t.StartAt = utils.UnixPtrToTime(dto.StartAt)
	}
	if dto.EndAt != nil {
		t.EndAt = utils.UnixPtrToTime(dto.EndAt)
	}
	return t
}

// CreateTrip godoc
// @Summary     Create trip
// @Description Creates a new trip
// @Tags        trips
// @Accept      json
// @Produce     json
// @Param       body body models.TripInputAPI true "payload"
// @Success     201  {object} models.Trip
// @Failure     400  {object} models.ErrorResp
// @Failure     500  {object} models.ErrorResp
// @Router      /trips [post]
func (h TripHandler) CreateTrip(w http.ResponseWriter, r *http.Request) {
	var dto models.TripInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := h.buildEntityFromInput(dto)
	entity.OwnerID = utils.MustGetUserID(r.Context())
	out, err := h.repo.Create(r.Context(), entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusCreated, out)
}

// GetTrip godoc
// @Summary     Get trip by id
// @Description Return a single trip
// @Tags        trips
// @Produce     json
// @Param       id  path string true "trip id"
// @Success     200 {object} models.Trip
// @Failure     404 {object} models.ErrorResp
// @Router      /trips/{id} [get]
func (h TripHandler) GetTrip(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	out, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// UpdateTrip godoc
// @Summary     Update trip
// @Description Update an existing trip
// @Tags        trips
// @Accept      json
// @Produce     json
// @Param       id   path string true "trip id"
// @Param       body body models.TripInputAPI true "payload"
// @Success     200 {object} models.Trip
// @Failure     400  {object} models.ErrorResp
// @Failure     404 {object} models.ErrorResp
// @Router      /trips/{id} [put]
func (h TripHandler) UpdateTrip(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var dto models.TripInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := h.buildEntityFromInput(dto)
	out, err := h.repo.Update(r.Context(), id, entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// DeleteTrip godoc
// @Summary     Delete trip
// @Description Remove a trip
// @Tags        trips
// @Param       id  path string true "trip id"
// @Success     204
// @Failure     404 {object} models.ErrorResp
// @Router      /trips/{id} [delete]
func (h TripHandler) DeleteTrip(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.repo.Delete(r.Context(), id); err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ListTrips godoc
// @Summary     List trips
// @Description Return paginated trip list
// @Tags        trips
// @Produce     json
// @Param       limit  query int false "page size"
// @Param       offset query int false "offset"
// @Success     200 {object} models.ListResp[models.Trip]
// @Router      /trips [get]
func (h TripHandler) ListTrips(w http.ResponseWriter, r *http.Request) {
	limit, offset := utils.GetLimitOffset(r)
	items, total, err := h.repo.List(r.Context(), limit, offset)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, models.ListResp[models.Trip]{
		Items: items,
		Total: total,
	})
}
