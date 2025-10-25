package api

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/db-manager/pkg/utils"
	"famquest/components/go-common/logger"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/minio/minio-go/v7"
)

type MediaHandler struct {
	*CRUDHandler[models.Media, models.Media, models.Media]
}

func NewMediaHandler(repo connection.CRUD[models.Media]) MediaHandler {
	h := &CRUDHandler[models.Media, models.Media, models.Media]{
		repo: repo,
		name: "media",
	}
	return MediaHandler{h}
}

func mediaFromForm(w http.ResponseWriter, r *http.Request) *models.Media {
	// 1. parse form (max 500 MB) Set also at the NGINX level
	if err := r.ParseMultipartForm(5000 << 20); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "multipart too big"})
		return nil
	}
	data, header, err := r.FormFile("file")
	if err != nil || data == nil {
		logger.Log.Debugf("error %s for '%+v' and '%+v'", err.Error(), data, header)
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: "unable to process file"})
		return nil
	}
	defer data.Close()
	contentType := header.Header.Get("Content-Type")
	fmt.Println(header.Header)
	bucket := ""
	if strings.HasPrefix(contentType, "image/") || strings.HasPrefix(contentType, "audio/") || strings.HasPrefix(contentType, "video/") {
		bucket = strings.Split(contentType, "/")[0]
	} else if contentType == "application/pdf" {
		bucket = strings.Split(contentType, "/")[1]
	} else {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: fmt.Sprintf("contentType '%s' not supported", contentType)})
		return nil
	}
	logger.Log.Debugf("bucket selected %s", bucket)

	tags := models.StringArray{}
	if tagsStr := r.FormValue("tags"); tagsStr != "" {
		parts := strings.Split(tagsStr, ",")
		for _, p := range parts {
			tags = append(tags, p)
		}
	}

	participants := models.UUIDArray{}
	if formStrList := r.FormValue("participants"); formStrList != "" {
		parts := strings.Split(formStrList, ",")
		for _, p := range parts {
			participants = append(participants, uuid.MustParse(p))
			// TODO: Ensure they exist
		}
	}
	comments := models.UUIDArray{}
	if formStrList := r.FormValue("comments"); formStrList != "" {
		parts := strings.Split(formStrList, ",")
		for _, p := range parts {
			comments = append(comments, uuid.MustParse(p))
			// TODO: Ensure they exist
		}
	}
	var isAt *time.Time
	if v := r.FormValue("isAt"); v != "" {
		if ms, err := strconv.ParseInt(v, 10, 64); err == nil {
			t := time.UnixMilli(ms)
			isAt = &t
		}
	}
	urlId := (uuid.New()).String()
	minioInfo, err := connection.Minio.PutObject(r.Context(), os.Getenv("DB_NAME")+"-"+bucket, urlId, data, -1, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		logger.Log.Errorf("Minio error: %s", err.Error())
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: "Failed to upload to minio: " + err.Error()})
		return nil
	}
	logger.Log.Infof("Minio feedback: %+v", minioInfo)

	m := models.Media{
		Name:         header.Filename, // TODO: Chech what is received with real-time photos
		OwnerID:      utils.MustGetUserID(r.Context()),
		ContentType:  contentType,
		Tags:         tags,
		Comments:     comments,
		Participants: participants,
		IsAt:         isAt,
		URL:          urlId,
	}
	fmt.Println(m)
	return &m
}

// UploadMedia godoc
// @Summary     Upload media file
// @Description Multipart upload
// @Tags        media
// @Accept      multipart/form-data
// @Produce     json
// @Param       file formData file true "image/* or audio/* or video/ or application/pdf"
// @Param       body formData models.MediaInputAPI true "User info provided on create"
// @Success     201 {object} models.Media
// @Failure     400 {object} models.ErrorResp
// @Failure     500 {object} models.ErrorResp
// @Router      /media [post]
func (h MediaHandler) UploadMedia(w http.ResponseWriter, r *http.Request) {
	m := mediaFromForm(w, r)
	if m == nil {
		return
	}
	out, err := h.repo.Create(r.Context(), *m)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	aUrl := connection.AuthorizedUrl(out)
	if aUrl == "" {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: fmt.Sprintf("Error authorizing %s", out.ID)})
		return
	}
	out.URL = aUrl
	utils.WriteJSON(w, http.StatusCreated, out)
}

// GetMedia godoc
// @Summary     Get media by id
// @Description Return a single media
// @Tags        media
// @Produce     json
// @Param       id  path string true "media id"
// @Success     200 {object} models.Media
// @Failure     404 {object} models.ErrorResp
// @Router      /media/{id} [get]
func (h MediaHandler) GetMedia(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	out, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	aUrl := connection.AuthorizedUrl(out)
	if aUrl == "" {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: fmt.Sprintf("Error authorizing %s", out.ID)})
		return
	}
	out.URL = aUrl
	utils.WriteJSON(w, http.StatusOK, out)
}

// UpdateMedia godoc
// @Summary     Update media file
// @Description Multipart update
// @Tags        media
// @Accept      multipart/form-data
// @Produce     json
// @Param       id   path string         true "user id"
// @Param       file formData file true "image/* or audio/* or video/ or application/pdf"
// @Param       body formData models.MediaPutAPI true "User info provided on update"
// @Success     201 {object} models.Media
// @Failure     400 {object} models.ErrorResp
// @Failure     500 {object} models.ErrorResp
// @Router      /media/{id} [put]
func (h MediaHandler) UpdateMedia(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	old, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	// Delete previous file in minio
	bucket := ""
	if strings.HasPrefix(old.ContentType, "image/") || strings.HasPrefix(old.ContentType, "audio/") || strings.HasPrefix(old.ContentType, "video/") {
		bucket = strings.Split(old.ContentType, "/")[0]
	} else if old.ContentType == "application/pdf" {
		bucket = strings.Split(old.ContentType, "/")[1]
	}
	err = connection.Minio.RemoveObject(r.Context(), os.Getenv("DB_NAME")+"-"+bucket, old.URL, minio.RemoveObjectOptions{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	m := mediaFromForm(w, r)
	if m == nil {
		return
	}
	out, err := h.repo.Update(r.Context(), id, *m)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	aUrl := connection.AuthorizedUrl(out)
	if aUrl == "" {
		utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: fmt.Sprintf("Error authorizing %s", out.ID)})
		return
	}
	out.URL = aUrl
	utils.WriteJSON(w, http.StatusCreated, out)
}

// DeleteMedia godoc
// @Summary     Delete media by id
// @Description Return a single media
// @Tags        media
// @Produce     json
// @Param       id  path string true "media id"
// @Success     204
// @Failure     400 {object} models.ErrorResp
// @Failure     404 {object} models.ErrorResp
// @Router      /media/{id} [delete]
func (h MediaHandler) DeleteMedia(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	out, err := h.repo.Get(r.Context(), id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, models.ErrorResp{Error: "not found"})
		return
	}
	bucket := ""
	if strings.HasPrefix(out.ContentType, "image/") || strings.HasPrefix(out.ContentType, "audio/") || strings.HasPrefix(out.ContentType, "video/") {
		bucket = strings.Split(out.ContentType, "/")[0]
	} else if out.ContentType == "application/pdf" {
		bucket = strings.Split(out.ContentType, "/")[1]
	}
	err = connection.Minio.RemoveObject(r.Context(), os.Getenv("DB_NAME")+"-"+bucket, out.URL, minio.RemoveObjectOptions{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Log.Info("Deleted from minio")

	if err := h.repo.Delete(r.Context(), id); err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ListMedia godoc
// @Summary     List media
// @Description Return paginated media list
// @Tags        media
// @Produce     json
// @Param       limit  query int false "page size"
// @Param       offset query int false "offset"
// @Success     200 {object} models.ListResp[models.Media]
// @Router      /media [get]
func (h MediaHandler) ListMedia(w http.ResponseWriter, r *http.Request) {
	limit, offset := utils.GetLimitOffset(r)
	items, total, err := h.repo.List(r.Context(), limit, offset)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, models.ErrorResp{Error: err.Error()})
		return
	}
	// Minio pre-authorized URLs
	var outMedia []models.Media
	for _, item := range items {
		// Set request parameters
		aUrl := connection.AuthorizedUrl(item)
		if aUrl == "" {
			utils.WriteJSON(w, http.StatusBadRequest, models.ErrorResp{Error: fmt.Sprintf("Error authorizing %s", item.ID)})
			return
		}
		item.URL = aUrl
		outMedia = append(outMedia, item)
	}
	utils.WriteJSON(w, http.StatusOK, models.ListResp[models.Media]{
		Items: outMedia,
		Total: total,
	})
}
