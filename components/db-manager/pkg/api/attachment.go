package api

import (
	"encoding/json"
	"errors"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

// AttachmentPost creates a new attachment
// @Summary Create a attachment
// @Description Create a new attachment
// @Tags attachment
// @Accept json
// @Produce json
// @Param attachment body models.APIAttachments true "Attachment data"
// @Success 201 {object} models.Attachments
// @Router /attachment [post]
func AttachmentPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func AttachmentPost")
	var attachment models.Attachments
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&attachment); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	logger.Log.Debug("object decoded")
	if ref := r.URL.Query().Get("ref"); ref != "" {
		if intId, err := parseId(ref); err != nil {
			attachment.Ref = intId
			attachment.RefType = r.URL.Query().Get("refType")
		}
	}
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
	dest, httpStatus, err := crudGetAll(&models.Attachments{})
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
	json.NewEncoder(w).Encode(dest)
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
	// First delete the attachment
	var attachment models.Attachments
	httpStatus, err := crudDelete(&attachment, mux.Vars(r))
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
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
