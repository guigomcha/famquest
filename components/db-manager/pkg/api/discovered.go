package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/mux"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
)

// DiscoveredPost creates a new discovered
// @Summary Create a discovered
// @Description Create a new discovered
// @Tags discovered
// @Accept json
// @Produce json
// @Param discovered body models.APIDiscovered true "Discovered data"
// @Success 201 {object} models.Discovered
// @Router /discovered [post]
func DiscoveredPost(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredPost")
	info := handleHeaders(w, r)
	var discovered models.Discovered
	var dest connection.DbInterface
	if err := json.NewDecoder(r.Body).Decode(&discovered); err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	discovered.RefUserUploader = info["user"].(int)
	logger.Log.Debug("object decoded")
	dest, httpStatus, err := crudPost(&discovered)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dest)
}

// DiscoveredGetAll retrieves all discovereds
// @Summary Retrieve all discovereds
// @Description Get a list of all discovereds
// @Tags discovered
// @Produce json
// @Param refId query int false "Reference ID (optional)"
// @Param refType query string false "Reference Type (optional)" Enums(spot,attachment,note)
// @Param refUserUploader query int false "filter for the specific user (optional)"
// @Success 200 {array} models.Discovered
// @Router /discovered [get]
func DiscoveredGetAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredGetAll")
	handleHeaders(w, r)
	filter := ""
	if r.URL.Query().Get("refId") != "" {
		intId, err := parseId(r.URL.Query().Get("refId"))
		if err != nil {
			http.Error(w, fmt.Sprintf("Ref error: %s", err.Error()), http.StatusBadRequest)
			return
		}
		filter = fmt.Sprintf("WHERE ref_id = %d AND ref_type = '%s'", intId, r.URL.Query().Get("refType"))
	}
	if r.URL.Query().Get("refUserUploader") != "" {
		intId, err := parseId(r.URL.Query().Get("refUserUploader"))
		if err != nil {
			http.Error(w, fmt.Sprintf("Ref error: %s", err.Error()), http.StatusBadRequest)
			return
		}
		if filter != "" {
			filter = fmt.Sprintf("%s AND ref_user_uploader = %d", filter, intId)
		} else {
			filter = fmt.Sprintf("WHERE ref_user_uploader = %d", intId)
		}
	}
	logger.Log.Debugf("created filter '%s'", filter)
	dest, httpStatus, err := crudGetAll(&models.Discovered{}, filter)
	logger.Log.Debugf("objects obtained '%d'", len(dest))
	if err != nil {
		logger.Log.Error(err.Error())
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

// DiscoveredUpdateAll Updates discovered based on the user
// @Summary Updates all discovered entries for a user
// @Description Updates discovered based on the user locations, age, etc.
// @Tags discovered
// @Produce json
// @Success 200 {array} int "The Ids of the discovered that were updated"
// @Router /discovered/updateConditions [post]
func DiscoveredUpdateAll(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredUpdateAll")
	info := handleHeaders(w, r)
	userConnected := fmt.Sprintf("%d", info["user"].(int))
	// make sure user exists
	userDbInterface, httpStatus, err := crudGet(&models.Users{}, map[string]string{"id": userConnected})
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	if userDbInterface == nil {
		logger.Log.Error(fmt.Sprintf("User with id '%s' not found", userConnected))
		http.Error(w, "userConnected not valid", http.StatusBadRequest)
		return
	}
	// First make sure that the discovered table has the relevant entries for this user
	createMissingDiscoveredQuery := fmt.Sprintf(`
	BEGIN;

	INSERT INTO discovered (condition, ref_id, ref_type, show, ref_user_uploader)
	SELECT d.condition, d.ref_id, d.ref_type, d.show, %s
	FROM discovered d
	WHERE NOT EXISTS (
		SELECT 1
		FROM discovered d2
		WHERE d2.ref_type = d.ref_type
			AND d2.ref_id = d.ref_id
			AND d2.ref_user_uploader = %s
	)
	AND (
		SELECT MIN(id)
		FROM discovered d3
		WHERE d3.ref_type = d.ref_type
			AND d3.ref_id = d.ref_id
	) = d.id;

	COMMIT;
	`, userConnected, userConnected)
	var newDiscResult interface{}
	err = connection.ExecuteCustom(connection.DB, createMissingDiscoveredQuery, &newDiscResult)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	// TODO: Expand to something else other than spots
	locationBasedDiscoveredsQuery := fmt.Sprintf(`
	WITH spot_locations AS (
			SELECT 
					kl.latitude AS spot_latitude,
					kl.longitude AS spot_longitude,
					d.id AS discovered_id,
					s.id AS spot_id
			FROM 
					discovered d
			JOIN 
					spots s ON d.ref_id = s.id
			JOIN 
					known_locations kl ON s.id = kl.ref_id AND kl.ref_type = 'spot'
			WHERE 
					d.ref_user_uploader = %s AND d.ref_type = 'spot' AND d.show = false AND condition->>'parameterType' = 'location'
	)
	SELECT 
		sl.spot_id,
		sl.discovered_id,
		kl.*
	FROM 
			known_locations kl
	CROSS JOIN 
			spot_locations sl
	WHERE 
			kl.ref_id = 0
			AND 6371000 * 2 * ASIN(
					SQRT(
							POW(SIN(RADIANS(kl.latitude - sl.spot_latitude) / 2), 2) +
							COS(RADIANS(sl.spot_latitude)) * COS(RADIANS(kl.latitude)) *
							POW(SIN(RADIANS(kl.longitude - sl.spot_longitude) / 2), 2)
					)
			) <= 200;
	`, userConnected)
	var locCondResults []models.LocationBasedCondition
	err = connection.ExecuteCustom(connection.DB, locationBasedDiscoveredsQuery, &locCondResults)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}

	// Find discovered to update based on date
	dateBasedDiscoveredsQuery := fmt.Sprintf(`
	SELECT 
		s.id AS spot_id,
		d.id AS discovered_id
	FROM 
		discovered d
	JOIN 
		spots s ON d.ref_id = s.id
	WHERE d.ref_user_uploader = %s AND d.ref_type = 'spot' AND condition->>'parameterType' = 'date' AND d.show = false AND (condition->>'thresholdTarget')::timestamp < CURRENT_TIMESTAMP;
	`, userConnected)
	var dateCondResults []models.DateBasedCondition
	err = connection.ExecuteCustom(connection.DB, dateBasedDiscoveredsQuery, &dateCondResults)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	if len(locCondResults)+len(dateCondResults) == 0 {
		logger.Log.Info("No discovered to update")
		empty := make([]string, 0)
		json.NewEncoder(w).Encode(empty)
		return
	}

	// Extract discovered IDs
	discoveredIDs := make([]int, len(locCondResults)+len(dateCondResults))
	for i, entry := range locCondResults {
		discoveredIDs[i] = entry.DiscoveredId
	}
	for i, entry := range dateCondResults {
		discoveredIDs[i] = entry.DiscoveredId
	}

	// Update the discovered
	inClause := strings.Trim(strings.Join(strings.Fields(fmt.Sprint(discoveredIDs)), ","), "[]")
	updateDiscoveredQuery := fmt.Sprintf(`
		UPDATE discovered
		SET show = true
		WHERE id IN (%s);`, inClause)
	var updateResult []interface{}

	err = connection.ExecuteCustom(connection.DB, updateDiscoveredQuery, &updateResult)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	logger.Log.Debugf("Result from update: %+v", updateResult)
	json.NewEncoder(w).Encode(discoveredIDs)
}

// DiscoveredGet retrieves a specific discovered by ID
// @Summary Retrieve a discovered by ID
// @Description Get discovered details by ID
// @Tags discovered
// @Produce json
// @Param id path int true "Discovered ID"
// @Success 200 {object} models.Discovered
// @Router /discovered/{id} [get]
func DiscoveredGet(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredGet")
	handleHeaders(w, r)
	var dest connection.DbInterface
	dest, httpStatus, err := crudGet(&models.Discovered{}, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	json.NewEncoder(w).Encode(dest)
}

// DiscoveredDelete deletes a discovered by ID
// @Summary Delete a discovered by ID
// @Description Delete a discovered entry
// @Tags discovered
// @Produce json
// @Param id path int true "Discovered ID"
// @Success 204 {string} string "No Content"
// @Router /discovered/{id} [delete]
func DiscoveredDelete(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredDelete")
	handleHeaders(w, r)
	// First delete the discovered
	var discovered models.Discovered
	httpStatus, err := crudDelete(&discovered, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// DiscoveredPut updates a discovered by ID
// @Summary Update a discovered by ID
// @Description Update discovered details by ID
// @Tags discovered
// @Accept json
// @Produce json
// @Param id path int true "Discovered ID"
// @Param discovered body models.APIDiscovered true "Discovered data"
// @Success 200 {object} models.Discovered
// @Router /discovered/{id} [put]
func DiscoveredPut(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredPut")
	info := handleHeaders(w, r)
	var discovered models.Discovered
	var dest connection.DbInterface
	err := json.NewDecoder(r.Body).Decode(&discovered)
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	intId, err := parseId(mux.Vars(r)["id"])
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if discovered.ID > 0 && discovered.ID != intId {
		msg := fmt.Sprintf("discovered id in payload '%d' and path '%d' do not match", discovered.ID, intId)
		logger.Log.Error(msg)
		http.Error(w, fmt.Sprintf("discovered id in payload '%d' and path '%d' do not match", discovered.ID, intId), http.StatusBadRequest)
		return
	}
	discovered.ID = intId
	discovered.RefUserUploader = info["user"].(int)
	// Update the discovered
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err := crudPut(&discovered, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}

// DiscoveredPut
// @Summary Update the ref
// @Description Update the ref in a discovered details by ID
// @Tags discovered
// @Produce json
// @Param id path int true "Discovered ID"
// @Param refId query int true "Reference ID (optional)"
// @Param refType query string true "Reference Type" Enums(spot,note,attachment)
// @Success 200 {object} models.Discovered
// @Router /discovered/{id}/ref [put]
func DiscoveredPutRef(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Called to func DiscoveredPutRef")
	info := handleHeaders(w, r)
	// first ensure ref is ok
	intId, err := parseId(r.URL.Query().Get("refId"))
	if err != nil || intId == 0 {
		msg := fmt.Sprintf("Ref error or cero: %+v", err)
		logger.Log.Error(msg)
		http.Error(w, msg, http.StatusBadRequest)
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
	case "location":
		_, httpStatus, err = crudGet(&models.KnownLocations{}, map[string]string{"id": fmt.Sprint(intId)})
	default:
		err = fmt.Errorf("reftype '%s' not implemented", r.URL.Query().Get("refType"))
		httpStatus = http.StatusBadRequest
	}
	if err != nil {
		http.Error(w, err.Error(), httpStatus)
		return
	}
	logger.Log.Debug("Ref seems ok")
	// Now bring the original discovered
	dest, httpStatus, err = crudGet(&models.Discovered{}, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	discovered, ok := dest.(*models.Discovered)
	if !ok {
		msg := fmt.Sprintf("Unable to cast the struct correctly from %+v", dest)
		logger.Log.Error(msg)
		http.Error(w, msg, http.StatusInternalServerError)
		return
	}
	discovered.RefId = intId
	discovered.RefType = r.URL.Query().Get("refType")
	discovered.RefUserUploader = info["user"].(int)
	// Update the discovered which will trigger the GetInsertExtraQueries
	logger.Log.Debug("Decoded object")
	dest, httpStatus, err = crudPut(discovered, mux.Vars(r))
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), httpStatus)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dest)
}
