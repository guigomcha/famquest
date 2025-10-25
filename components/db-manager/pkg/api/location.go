package api

import (
	"encoding/json"
	"net/http"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/db-manager/pkg/utils"

	"github.com/gorilla/mux"
)

type LocationHandler struct {
	*CRUDHandler[models.Location, models.LocationInputAPI, models.LocationInputAPI]
}

func NewLocationHandler(repo connection.CRUD[models.Location]) LocationHandler {
	h := &CRUDHandler[models.Location, models.LocationInputAPI, models.LocationInputAPI]{
		repo: repo,
		name: "location",
	}
	return LocationHandler{h}
}

// CreateLocation godoc
// @Summary     Create location
// @Description Creates a new location
// @Tags        locations
// @Accept      json
// @Produce     json
// @Param       body body models.LocationInputAPI true "payload"
// @Success     201  {object} models.Location
// @Failure     400  {object} models.ErrorResp
// @Failure     500  {object} models.ErrorResp
// @Router      /locations [post]
func (h LocationHandler) CreateLocation(w http.ResponseWriter, r *http.Request) {
	var dto models.LocationInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := models.Location{
		Lat:           dto.Lat,
		Lng:           dto.Lng,
		DescriptionId: dto.DescriptionId,
		Address:       *dto.Address,
		Name:          *dto.Name,
	}
	entity.OwnerID = utils.MustGetUserID(r.Context())
	out, err := h.repo.Create(r.Context(), entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusCreated, out)
}

// GetLocation godoc
// @Summary     Get location by id
// @Description Return a single location
// @Tags        locations
// @Produce     json
// @Param       id  path string true "location id"
// @Success     200 {object} models.Location
// @Failure     404 {object} models.ErrorResp
// @Router      /locations/{id} [get]
func (h LocationHandler) GetLocation(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	out, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// UpdateLocation godoc
// @Summary     Update location
// @Description Update an existing location
// @Tags        locations
// @Accept      json
// @Produce     json
// @Param       id   path string true "location id"
// @Param       body body models.LocationInputAPI true "payload"
// @Success     200 {object} models.Location
// @Failure     400  {object} models.ErrorResp
// @Failure     404 {object} models.ErrorResp
// @Router      /locations/{id} [put]
func (h LocationHandler) UpdateLocation(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var dto models.LocationInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := models.Location{
		Lat:           dto.Lat,
		Lng:           dto.Lng,
		DescriptionId: dto.DescriptionId,
		Address:       *dto.Address,
		Name:          *dto.Name,
	}
	out, err := h.repo.Update(r.Context(), id, entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// DeleteLocation godoc
// @Summary     Delete location
// @Description Remove a location
// @Tags        locations
// @Param       id  path string true "location id"
// @Success     204
// @Failure     404 {object} models.ErrorResp
// @Router      /locations/{id} [delete]
func (h LocationHandler) DeleteLocation(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.repo.Delete(r.Context(), id); err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ListLocations godoc
// @Summary     List locations
// @Description Return paginated location list
// @Tags        locations
// @Produce     json
// @Param       limit  query int false "page size"
// @Param       offset query int false "offset"
// @Success     200 {object} models.ListResp[models.Location]
// @Router      /locations [get]
func (h LocationHandler) ListLocations(w http.ResponseWriter, r *http.Request) {
	limit, offset := utils.GetLimitOffset(r)
	items, total, err := h.repo.List(r.Context(), limit, offset)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, models.ListResp[models.Location]{
		Items: items,
		Total: total,
	})
}
