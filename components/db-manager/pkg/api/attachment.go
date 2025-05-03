package api

import (
	"context"
	"encoding/json"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"reflect"
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
// @Produce json
// @Param  file formData file true "image/* or audio/* or video/ or application/pdf"
// @Param  attachment formData models.APIAttachments true "description of attachment"
// @Success 201 {object} models.Attachments
// @Router /attachment [post]
func AttachmentPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentPost")
	info := handleHeaders(w, r)
	// Parse multipart form data with a maximum file size of 10MB
	err := r.ParseMultipartForm(500 << 20) // 500 MB
	if err != nil {
		msg := "Unable to parse form data: " + err.Error()
		logger.Log.Debug(msg)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}
	logger.Log.Debugf("Available: '%+v'", r.Form)
	data, header, err := r.FormFile("file")
	if err != nil {
		logger.Log.Debugf("error %s for '%+v' and '%+v'", err.Error(), data, header)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer data.Close()
	ts, err := time.Parse(time.RFC3339, r.FormValue("datetime"))
	if err != nil {
		logger.Log.Debugf("datetime not supported '%s': %s", r.FormValue("datetime"), err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	attachment := models.Attachments{
		Name:            r.FormValue("name"),
		Description:     r.FormValue("description"),
		Datetime:        ts,
		ContentType:     r.FormValue("contentType"),
		RefUserUploader: info["user"].(int),
	}
	if !strings.HasPrefix(attachment.ContentType, "image/") && !strings.HasPrefix(attachment.ContentType, "audio/") && !strings.HasPrefix(attachment.ContentType, "video/") && attachment.ContentType != "application/pdf" {
		http.Error(w, fmt.Sprintf("ContentType '%s' not supported", attachment.ContentType), http.StatusBadRequest)
		return
	}
	logger.Log.Infof("Metadata received: %+v", attachment)
	urlId := (uuid.New()).String()
	minioInfo, err := connection.Minio.PutObject(context.Background(), os.Getenv("DB_NAME")+"-"+strings.Split(attachment.ContentType, "/")[0], urlId, data, -1, minio.PutObjectOptions{ContentType: attachment.ContentType})
	if err != nil {
		logger.Log.Errorf("Minio error: %s", err.Error())
		http.Error(w, "Failed to upload to minio: "+err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Log.Infof("Minio feedback: %+v", minioInfo)
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
// @Param refId query int false "Reference ID (optional)"
// @Param refType query string false "Reference Type (optional)" Enums(spot,attachment,note)
// @Success 200 {array} models.Attachments
// @Router /attachment [get]
func AttachmentGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentGetAll")
	handleHeaders(w, r)
	// Create the filter
	filter := ""
	if r.URL.Query().Get("refId") != "" {
		intId, err := parseId(r.URL.Query().Get("refId"))
		if err != nil {
			http.Error(w, fmt.Sprintf("Ref error: %s", err.Error()), http.StatusBadRequest)
			return
		}
		filter = fmt.Sprintf("WHERE ref_id = %d AND ref_type = '%s'", intId, r.URL.Query().Get("refType"))
		logger.Log.Debugf("created filer '%s'", filter)
	}
	dests, httpStatus, err := crudGetAll(&models.Attachments{}, filter)
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
	// pre-authorize urls
	for _, dest := range dests {
		// Type assertion: convert interface back to the concrete type
		if att, ok := dest.(*models.Attachments); ok {
			// Set request parameters
			reqHeaders := make(http.Header)

			presignedURL, err := connection.Minio.PresignHeader(context.Background(), http.MethodGet, os.Getenv("DB_NAME")+"-"+strings.Split(att.ContentType, "/")[0], att.URL, time.Hour, make(url.Values), reqHeaders)
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
	handleHeaders(w, r)
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.Attachments{}, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	if att, ok := dest.(*models.Attachments); ok {
		// Set request parameters
		reqHeaders := make(http.Header)
		presignedURL, err := connection.Minio.PresignHeader(context.Background(), http.MethodGet, os.Getenv("DB_NAME")+"-"+strings.Split(att.ContentType, "/")[0], att.URL, time.Hour, make(url.Values), reqHeaders)
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
	handleHeaders(w, r)
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	attachment := models.Attachments{}
	// Cannot delete if there are things connected to this
	models := []connection.DbInterface{&models.Attachments{}}
	for _, modelType := range models {
		filter := fmt.Sprintf("WHERE ref_id = %d AND ref_type = 'attachment'", intId)
		destsList, httpStatus, err := crudGetAll(modelType, filter)
		logger.Log.Debugf("objects obtained for %s: %d --- '%s'", reflect.TypeOf(modelType).Elem().Name(), len(destsList), filter)
		if err != nil {
			logger.Log.Debugf("Unable to search dependencies %s", err.Error())
			http.Error(w, err.Error(), httpStatus)
			return
		}
		// Check if there are linked items for the current model type
		if len(destsList) > 0 {
			http.Error(w, "Cannot delete if there are things linked to it", http.StatusBadRequest)
			return
		}
	}
	// Delete the attachment first from minio
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
	err = minioClient.RemoveObject(context.Background(), os.Getenv("DB_NAME")+"-"+strings.Split(attachment.ContentType, "/")[0], uuid, minio.RemoveObjectOptions{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
	info := handleHeaders(w, r)
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
	attachment.RefUserUploader = info["user"].(int)

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
// @Param refId query int true "Reference ID (optional)"
// @Param refType query string true "Reference Type" Enums(spot,attachment,note)
// @Success 200 {object} models.Attachments
// @Router /attachment/{id}/ref [put]
func AttachmentPutRef(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentPutRef")
	info := handleHeaders(w, r)
	// first ensure ref is ok
	intId, err := parseId(r.URL.Query().Get("refId"))
	if err != nil || intId == 0 {
		http.Error(w, fmt.Sprintf("Ref error or cero: %+v", err), http.StatusBadRequest)
		return
	}
	var dest connection.DbInterface
	var httpStatus int
	switch r.URL.Query().Get("refType") {
	case "spot":
		_, httpStatus, err = crudGet(&models.Spots{}, map[string]string{"id": fmt.Sprint(intId)})
	case "attachment":
		_, httpStatus, err = crudGet(&models.Attachments{}, map[string]string{"id": fmt.Sprint(intId)})
	case "note":
		_, httpStatus, err = crudGet(&models.Notes{}, map[string]string{"id": fmt.Sprint(intId)})
	default:
		err = fmt.Errorf("reftype '%s' not implemented", r.URL.Query().Get("refType"))
		httpStatus = http.StatusBadRequest
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
	attachment.RefId = intId
	attachment.RefType = r.URL.Query().Get("refType")
	attachment.RefUserUploader = info["user"].(int)
	// Update the attachment which will trigger the GetInsertExtraQueries
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err = crudPut(attachment, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
