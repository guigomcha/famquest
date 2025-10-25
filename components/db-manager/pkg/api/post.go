package api

import (
	"encoding/json"
	"net/http"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/db-manager/pkg/utils"

	"github.com/gorilla/mux"
)

type PostHandler struct {
	*CRUDHandler[models.Post, models.PostInputAPI, models.PostInputAPI]
}

func NewPostHandler(repo connection.CRUD[models.Post]) PostHandler {
	h := &CRUDHandler[models.Post, models.PostInputAPI, models.PostInputAPI]{
		repo: repo,
		name: "post",
	}
	return PostHandler{h}
}

/* ---------- mappers ---------- */

func (h PostHandler) buildEntityFromCreate(dto models.PostInputAPI) models.Post {
	return models.Post{
		Name:          dto.Name,
		DescriptionId: dto.DescriptionId,
		LocationID:    dto.LocationID,
		Medias:        dto.Medias,
		Tags:          dto.Tags,
		Comments:      dto.Comments,
		StartAt:       utils.UnixPtrToTime(dto.StartAt),
		EndAt:         utils.UnixPtrToTime(dto.EndAt),
	}
}

func (h PostHandler) buildEntityFromUpdate(dto models.PostInputAPI) models.Post {
	return models.Post{
		Name:          dto.Name,
		DescriptionId: dto.DescriptionId,
		LocationID:    dto.LocationID,
		Medias:        dto.Medias,
		Tags:          dto.Tags,
		Comments:      dto.Comments,
		StartAt:       utils.UnixPtrToTime(dto.StartAt),
		EndAt:         utils.UnixPtrToTime(dto.EndAt),
	}
}

/* ---------- swagger-visible handlers ---------- */

// CreatePost godoc
// @Summary     Create post
// @Description Creates a new post
// @Tags        posts
// @Accept      json
// @Produce     json
// @Param       body body models.PostInputAPI true "payload"
// @Success     201  {object} models.Post
// @Failure     400  {object} models.ErrorResp
// @Failure     500  {object} models.ErrorResp
// @Router      /posts [post]
func (h PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	var dto models.PostInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := h.buildEntityFromCreate(dto)
	entity.OwnerID = utils.MustGetUserID(r.Context())
	out, err := h.repo.Create(r.Context(), entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusCreated, out)
}

// GetPost godoc
// @Summary     Get post by id
// @Description Return a single post
// @Tags        posts
// @Produce     json
// @Param       id  path string true "post id"
// @Success     200 {object} models.Post
// @Failure     404 {object} models.ErrorResp
// @Router      /posts/{id} [get]
func (h PostHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	out, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// UpdatePost godoc
// @Summary     Update post
// @Description Update an existing post
// @Tags        posts
// @Accept      json
// @Produce     json
// @Param       id   path string true "post id"
// @Param       body body models.PostInputAPI true "payload"
// @Success     200 {object} models.Post
// @Failure     400  {object} models.ErrorResp
// @Failure     404 {object} models.ErrorResp
// @Router      /posts/{id} [put]
func (h PostHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var dto models.PostInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := h.buildEntityFromUpdate(dto)
	out, err := h.repo.Update(r.Context(), id, entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// DeletePost godoc
// @Summary     Delete post
// @Description Remove a post
// @Tags        posts
// @Param       id  path string true "post id"
// @Success     204
// @Failure     404 {object} models.ErrorResp
// @Router      /posts/{id} [delete]
func (h PostHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.repo.Delete(r.Context(), id); err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ListPosts godoc
// @Summary     List posts
// @Description Return paginated post list
// @Tags        posts
// @Produce     json
// @Param       limit  query int false "page size"
// @Param       offset query int false "offset"
// @Success     200 {object} models.ListResp[models.Post]
// @Router      /posts [get]
func (h PostHandler) ListPosts(w http.ResponseWriter, r *http.Request) {
	limit, offset := utils.GetLimitOffset(r)
	items, total, err := h.repo.List(r.Context(), limit, offset)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, models.ListResp[models.Post]{
		Items: items,
		Total: total,
	})
}
