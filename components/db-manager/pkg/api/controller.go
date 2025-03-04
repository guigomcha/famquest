package api

import (
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"fmt"
	"net/http"
	"strconv"
)

// Generic operations used by all endpoints
func handleHeaders(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	logger.Log.Debug("CORS managed by NGINX")
	logger.Log.Debug("headers: %+v", r.Header)
	logger.Log.Debug("connection stats: %+v", connection.DB.Stats())
	// r.Header["X-User"] = []string{"dc6ad4ad-52cd-4dbf-bc26-759472d063a6"}
	// Checking if the user and roles are available in the headers
	info := make(map[string]interface{})
	info["user"] = 0

	if values, ok := r.Header["X-User"]; ok && len(values) > 0 {
		logger.Log.Debugf("User info in header: %+v\n", values)
		userRef := values[0] // The value of the X-User header
		dest, _, _ := crudGetAll(&models.Users{}, fmt.Sprintf("WHERE ext_ref = '%s'", userRef))
		// Check if a user was found
		if len(dest) == 0 {
			logger.Log.Debugf("Should have found the user: %+v\n", dest)
		} else {
			if usr, ok := dest[0].(*models.Users); ok {
				logger.Log.Debugf("User found: %+v\n", usr)
				info["user"] = usr.ID
			} else {
				logger.Log.Debug("User not casted correctly")
			}
		}
	}
	return info
}

func parseId(stringId string) (int, error) {
	intId, err := strconv.Atoi(stringId) //ParseInt(id, 0 , 64)
	if err != nil {
		return 0, err
	}
	return intId, nil
}

// pointer to interface
func crudPost(m connection.DbInterface) (connection.DbInterface, int, error) {
	var dest connection.DbInterface
	lastInsertId, err := connection.Insert(connection.DB, m)
	if err != nil {
		logger.Log.Debugf("insert error: %s", err.Error())
		return dest, http.StatusInternalServerError, err
	}
	logger.Log.Debugf("Inserted with %d", lastInsertId)
	dest, err = connection.Get(connection.DB, lastInsertId, m)
	if err != nil {
		logger.Log.Debugf("Get error: %s", err.Error())
		return dest, http.StatusInternalServerError, err
	}
	logger.Log.Debugf("object created in db: %d", lastInsertId)
	return dest, http.StatusAccepted, nil
}

// pointer to interface
func crudGetAll(m connection.DbInterface, filter string) ([]connection.DbInterface, int, error) {
	var dest []connection.DbInterface
	dest, err := connection.GetAll(connection.DB, m, filter)
	if err != nil {
		logger.Log.Debugf("%+v: %s", dest, err.Error())
		return dest, http.StatusInternalServerError, err
	}
	logger.Log.Debugf("objects obtained in db: %d", len(dest))
	return dest, http.StatusAccepted, nil
}

// pointer to interface
func crudGet(m connection.DbInterface, mVars map[string]string) (connection.DbInterface, int, error) {
	var dest connection.DbInterface
	intId, err := parseId(mVars["id"])
	if err != nil {
		return dest, http.StatusBadRequest, err
	}
	dest, err = connection.Get(connection.DB, intId, m)
	if err != nil {
		if err.Error() == connection.ErrorIdDoesNotExits {
			return dest, http.StatusBadRequest, err
		}
		return dest, http.StatusInternalServerError, err
	}

	return dest, http.StatusAccepted, nil
}

// pointer to interface
func crudDelete(m connection.DbInterface, mVars map[string]string) (int, error) {
	intId, err := parseId(mVars["id"])
	if err != nil {
		return http.StatusBadRequest, err
	}
	if err := connection.Delete(connection.DB, intId, m); err != nil {
		logger.Log.Debugf("Unable to delete: %d", intId)
		if err.Error() == connection.ErrorIdDoesNotExits {
			return http.StatusBadRequest, err
		}
		return http.StatusInternalServerError, err
	}
	return http.StatusAccepted, nil
}

// pointer to interface
func crudPut(m connection.DbInterface, mVars map[string]string) (connection.DbInterface, int, error) {
	// TODO: Only update what is not ""...
	var dest connection.DbInterface
	intId, err := parseId(mVars["id"])
	if err != nil {
		return dest, http.StatusBadRequest, err
	}
	dest, err = connection.Update(connection.DB, intId, m)
	if err != nil {
		if err.Error() == connection.ErrorIdDoesNotExits {
			return dest, http.StatusBadRequest, err
		}
		return dest, http.StatusInternalServerError, err
	}

	return dest, http.StatusAccepted, nil
}
