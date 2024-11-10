package api

import (
	"context"
	"encoding/json"
	"errors"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/minio/minio-go/v7"
)

// AttachmentPost creates a new attachment
// @Summary Create a attachment
// @Description Create a new attachment
// @Tags attachment
// @Accept multipart/form-data
// mpfd
// @Produce json
// @Param  data formData file true "Image/audio file"
// @Param  name formData string true "name of the attachment"
// @Param  description formData string true "description of the attachment"
// @Param  contentType formData string true "image/jpeg or media/mpeg"
// @Success 201 {object} models.Attachments
// @Router /attachment [post]
func AttachmentPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentPost")
	data, _, err := r.FormFile("data")
	if err != nil {
		logger.Log.Debug(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer data.Close()
	attachment := models.Attachments{
		Name:        r.FormValue("name"),
		Description: r.FormValue("description"),
		ContentType: r.FormValue("contentType"),
	}
	if attachment.ContentType != "image/jpeg" && attachment.ContentType != "audio/mpeg" {
		http.Error(w, "ContentType not supported", http.StatusBadRequest)
		return
	}
	logger.Log.Infof("Metadata received: %+v", attachment)
	urlId := (uuid.New()).String()
	_, err = connection.Minio.PutObject(context.Background(), strings.Split(attachment.ContentType, "/")[0], urlId, data, -1, minio.PutObjectOptions{ContentType: attachment.ContentType})
	if err != nil {
		http.Error(w, "Failed to upload to minio: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var dest connection.DbInterface
	// db stores the uuid but the get and getall returns the actual url pre-authorized
	attachment.URL = urlId
	dest, httpStatus, err := crudPost(&attachment)
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
}

// AttachmentGetAll retrieves all attachments
// @Summary Retrieve all attachments
// @Description Get a list of all attachments
// @Tags attachment
// @Produce json
// @Success 200 {array} models.Attachments
// @Router /attachment [get]
func AttachmentGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentGetAll")
	dests, httpStatus, err := crudGetAll(&models.Attachments{})
	logger.Log.Debugf("objects obtained '%d'", len(dests))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	if len(dests) == 0 {
		empty := make([]string, 0)
		json.NewEncoder(w).Encode(empty)
		return
	}
	var attachments []*models.Attachments
	// preauthorize urls
	for _, dest := range dests {
		// Type assertion: convert interface back to the concrete type
		if att, ok := dest.(*models.Attachments); ok {
			// Set request parameters
			reqHeaders := make(http.Header)
			// reqHeaders.Set("Host", "host.docker.internal")
			presignedURL, err := connection.Minio.PresignHeader(context.Background(), http.MethodGet, strings.Split(att.ContentType, "/")[0], att.URL, time.Hour, make(url.Values), reqHeaders)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			att.URL = presignedURL.String()
			attachments = append(attachments, att)
		} else {
			http.Error(w, "unable to cast attachment", http.StatusInternalServerError)
			return
		}
	}
	json.NewEncoder(w).Encode(attachments)
}

// AttachmentGet retrieves a specific attachment by ID
// @Summary Retrieve a attachment by ID
// @Description Get attachment details by ID
// @Tags attachment
// @Produce json
// @Param id path int true "Attachment ID"
// @Success 200 {object} models.Attachments
// @Router /attachment/{id} [get]
func AttachmentGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentGet")
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.Attachments{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	if att, ok := dest.(*models.Attachments); ok {
		// Set request parameters
		reqHeaders := make(http.Header)
		// reqHeaders.Set("Host", "host.docker.internal")
		presignedURL, err := connection.Minio.PresignHeader(context.Background(), http.MethodGet, strings.Split(att.ContentType, "/")[0], att.URL, time.Hour, make(url.Values), reqHeaders)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		att.URL = presignedURL.String()
		json.NewEncoder(w).Encode(dest)
		return
	}
	http.Error(w, "unable to cast attachment", httpStatus)
}

// AttachmentDelete deletes a attachment by ID
// @Summary Delete a attachment by ID
// @Description Delete a attachment and nullify its references in spots
// @Tags attachment
// @Produce json
// @Param id path int true "Attachment ID"
// @Success 204 {string} string "No Content"
// @Router /attachment/{id} [delete]
func AttachmentDelete(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentDelete")
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	attachment := models.Attachments{}
	err = connection.DB.Get(&attachment, attachment.GetSelectOneQuery(), intId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Info("Obtained first from DB")
	minioClient, err := connection.ConnectToMinio()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	uuid := strings.Split(attachment.URL, "/")[len(strings.Split(attachment.URL, "/"))-1]
	err = minioClient.RemoveObject(context.Background(), strings.Split(attachment.ContentType, "/")[0], uuid, minio.RemoveObjectOptions{})
	if err != nil {
		fmt.Println(err)
		return
	}
	logger.Log.Info("Deleted from minio")
	httpStatus, err := crudDelete(&attachment, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	logger.Log.Info("Deleted from db")
	w.WriteHeader(http.StatusNoContent)
}

// AttachmentPut updates a attachment by ID
// @Summary Update a attachment by ID
// @Description Update attachment details by ID
// @Tags attachment
// @Accept json
// @Produce json
// @Param id path int true "Attachment ID"
// @Param attachment body models.APIAttachments true "Attachment data"
// @Success 200 {object} models.Attachments
// @Router /attachment/{id} [put]
func AttachmentPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentPut")
	var attachment models.Attachments
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&attachment)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if attachment.ID > 0 && attachment.ID != intId {
		http.Error(w, fmt.Sprintf("attachment id in payload '%d' and path '%d' do not match", attachment.ID, intId), http.StatusBadRequest)
		return
	}
	attachment.ID = intId
	// Update the attachment
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&attachment, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}

// AttachmentPut
// @Summary Update the ref
// @Description Update the ref in a attachment details by ID
// @Tags attachment
// @Produce json
// @Param id path int true "Attachment ID"
// @Param ref query int true "Reference ID (optional)"
// @Param refType query string true "Reference Type" Enums(spot,task)
// @Success 200 {object} models.Attachments
// @Router /attachment/{id}/ref [put]
func AttachmentPutRef(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentPutRef")
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
	// Now bring the original attachment
	dest, httpStatus, err = crudGet(&models.Attachments{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	attachment, ok := dest.(*models.Attachments)
	if !ok {
		http.Error(w, fmt.Sprintf("Unable to cast the struct correctly from %+v", dest), http.StatusInternalServerError)
		return
	}
	attachment.Ref = intId
	attachment.RefType = r.URL.Query().Get("refType")
	// Update the attachment which will trigger the GetInsertExtraQueries
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err = crudPut(dest, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
