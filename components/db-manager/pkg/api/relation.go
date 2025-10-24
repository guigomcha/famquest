package api

import (
	"encoding/json"
	"net/http"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/db-manager/pkg/utils"

	"github.com/gorilla/mux"
)

type RelationHandler struct {
	*CRUDHandler[models.Relation, models.RelationInputAPI, models.RelationInputAPI]
}

func NewRelationHandler(repo connection.CRUD[models.Relation]) RelationHandler {
	h := &CRUDHandler[models.Relation, models.RelationInputAPI, models.RelationInputAPI]{
		repo: repo,
		name: "relation",
	}
	return RelationHandler{h}
}

/* ---------- mappers ---------- */

func (h RelationHandler) buildEntityFromApi(dto models.RelationInputAPI) models.Relation {
	return models.Relation{
		Source: dto.Source,
		Target: dto.Target,
		Label:  dto.Label,
		IsEx:   dto.IsEx,
	}
}

// CreateRelation godoc
// @Summary     Create relation
// @Description Creates a new relation between two users
// @Tags        relations
// @Accept      json
// @Produce     json
// @Param       body body models.RelationInputAPI true "payload"
// @Success     201  {object} models.Relation
// @Failure     400  {object} models.ErrorResp
// @Failure     500  {object} models.ErrorResp
// @Router      /relations [post]
func (h RelationHandler) CreateRelation(w http.ResponseWriter, r *http.Request) {
	var dto models.RelationInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := h.buildEntityFromApi(dto)
	out, err := h.repo.Create(r.Context(), entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusCreated, out)
}

// GetRelation godoc
// @Summary     Get relation by id
// @Description Return a single relation
// @Tags        relations
// @Produce     json
// @Param       id  path string true "relation id"
// @Success     200 {object} models.Relation
// @Failure     404 {object} models.ErrorResp
// @Router      /relations/{id} [get]
func (h RelationHandler) GetRelation(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	out, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// UpdateRelation godoc
// @Summary     Update relation
// @Description Update an existing relation
// @Tags        relations
// @Accept      json
// @Produce     json
// @Param       id   path string true "relation id"
// @Param       body body models.RelationInputAPI true "payload"
// @Success     200 {object} models.Relation
// @Failure     400  {object} models.ErrorResp
// @Failure     404 {object} models.ErrorResp
// @Router      /relations/{id} [put]
func (h RelationHandler) UpdateRelation(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var dto models.RelationInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := h.buildEntityFromApi(dto)
	out, err := h.repo.Update(r.Context(), id, entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// DeleteRelation godoc
// @Summary     Delete relation
// @Description Remove a relation
// @Tags        relations
// @Param       id  path string true "relation id"
// @Success     204
// @Failure     404 {object} models.ErrorResp
// @Router      /relations/{id} [delete]
func (h RelationHandler) DeleteRelation(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.repo.Delete(r.Context(), id); err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ListRelations godoc
// @Summary     List relations
// @Description Return paginated relation list
// @Tags        relations
// @Produce     json
// @Param       limit  query int false "page size"
// @Param       offset query int false "offset"
// @Success     200 {object} models.ListResp[models.Relation]
// @Router      /relations [get]
func (h RelationHandler) ListRelations(w http.ResponseWriter, r *http.Request) {
	limit, offset := utils.GetLimitOffset(r)
	items, total, err := h.repo.List(r.Context(), limit, offset)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, models.ListResp[models.Relation]{
		Items: items,
		Total: total,
	})
}
