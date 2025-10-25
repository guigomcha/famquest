package api

import (
	"encoding/json"
	"net/http"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/db-manager/pkg/utils"

	"github.com/gorilla/mux"
)

// TODO: audio refs and reply ids not checked

type CommentHandler struct {
	*CRUDHandler[models.Comment, models.CommentInputAPI, models.CommentInputAPI]
}

func NewCommentHandler(repo connection.CRUD[models.Comment]) CommentHandler {
	h := &CRUDHandler[models.Comment, models.CommentInputAPI, models.CommentInputAPI]{
		repo: repo,
		name: "comment",
	}
	return CommentHandler{h}
}

// CreateComment godoc
// @Summary     Create comment
// @Description Creates a new comment
// @Tags        comments
// @Accept      json
// @Produce     json
// @Param       body body models.CommentInputAPI true "payload"
// @Success     201  {object} models.Comment
// @Failure     400  {object} models.ErrorResp
// @Failure     500  {object} models.ErrorResp
// @Router      /comments [post]
func (h CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	var dto models.CommentInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	entity := models.Comment{
		Text:    dto.Text,
		Replies: dto.Replies,
		AudioID: dto.AudioID,
	}
	entity.OwnerID = utils.MustGetUserID(r.Context())
	out, err := h.repo.Create(r.Context(), entity)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusCreated, out)
}

// GetComment godoc
// @Summary     Get comment by id
// @Description Return a single comment
// @Tags        comments
// @Produce     json
// @Param       id  path string true "comment id"
// @Success     200 {object} models.Comment
// @Failure     404 {object} models.ErrorResp
// @Router      /comments/{id} [get]
func (h CommentHandler) GetComment(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	out, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// UpdateComment godoc
// @Summary     Update comment
// @Description Update an existing comment
// @Tags        comments
// @Accept      json
// @Produce     json
// @Param       id   path string true "comment id"
// @Param       body body models.CommentInputAPI true "payload"
// @Success     200 {object} models.Comment
// @Failure     400  {object} models.ErrorResp
// @Failure     404 {object} models.ErrorResp
// @Router      /comments/{id} [put]
func (h CommentHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	old, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	var dto models.CommentInputAPI
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "invalid json"})
		return
	}
	old.Text = dto.Text
	old.Replies = dto.Replies
	old.AudioID = dto.AudioID
	out, err := h.repo.Update(r.Context(), id, old)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	utils.WriteJSON(w, http.StatusOK, out)
}

// DeleteComment godoc
// @Summary     Delete comment
// @Description Remove a comment
// @Tags        comments
// @Param       id  path string true "comment id"
// @Success     204
// @Failure     404 {object} models.ErrorResp
// @Router      /comments/{id} [delete]
func (h CommentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.repo.Delete(r.Context(), id); err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ListComments godoc
// @Summary     List comments
// @Description Return paginated comment list
// @Tags        comments
// @Produce     json
// @Param       limit  query int false "page size"
// @Param       offset query int false "offset"
// @Success     200 {object} models.ListResp[models.Comment]
// @Router      /comments [get]
func (h CommentHandler) ListComments(w http.ResponseWriter, r *http.Request) {
	limit, offset := utils.GetLimitOffset(r)
	items, total, err := h.repo.List(r.Context(), limit, offset)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	utils.WriteJSON(w, http.StatusOK, models.ListResp[models.Comment]{
		Items: items,
		Total: total,
	})
}
