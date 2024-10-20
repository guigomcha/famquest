package api

import (
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/go-common/logger"
	"net/http"
	"strconv"
)

func parseId(stringId string) (int, error) {
	intId, err := strconv.Atoi(stringId) //ParseInt(id, 0 , 64)
	if err != nil {
		return 0, err
	}
	return intId, nil
}

// pointer to interface
func crudPost(m interface{}) (int, error) {
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if lastInsertId, err := connection.Insert(db, m); err != nil {
		return http.StatusInternalServerError, err
	} else if err := connection.Get(db, lastInsertId, m); err != nil {
		return http.StatusInternalServerError, err
	} else {
		logger.Log.Debugf("object created in db: %d", lastInsertId)
	}
	return http.StatusAccepted, nil
}

// pointer to interface
func crudGetAll(m interface{}) (int, error) {
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if err := connection.GetAll(db, m); err != nil {
		return http.StatusInternalServerError, err
	}
	return http.StatusAccepted, nil
}

// pointer to interface
func crudGet(m interface{}, mVars map[string]string) (int, error) {
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	intId, err := parseId(mVars["id"])
	if err != nil {
		return http.StatusBadRequest, err
	}
	if err := connection.Get(db, intId, m); err != nil {
		logger.Log.Debugf("Unable to Get: %d", intId)
		if err.Error() == connection.ErrorIdDoesNotExits {
			return http.StatusBadRequest, err
		}
		return http.StatusInternalServerError, err
	}
	return http.StatusAccepted, nil
}

// pointer to interface
func crudDelete(m interface{}, mVars map[string]string) (int, error) {
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	intId, err := parseId(mVars["id"])
	if err != nil {
		return http.StatusBadRequest, err
	}
	if err := connection.Delete(db, m, intId); err != nil {
		logger.Log.Debugf("Unable to delete: %d", intId)
		if err.Error() == connection.ErrorIdDoesNotExits {
			return http.StatusBadRequest, err
		}
		return http.StatusInternalServerError, err
	}
	return http.StatusAccepted, nil
}

// pointer to interface
func crudPut(m interface{}, mVars map[string]string) (int, error) {
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	intId, err := parseId(mVars["id"])
	if err != nil {
		return http.StatusBadRequest, err
	}
	if err := connection.Update(db, m); err != nil {
		logger.Log.Debugf("Unable to update: %+v", m)
		if err.Error() == connection.ErrorIdDoesNotExits {
			return http.StatusBadRequest, err
		}
		return http.StatusInternalServerError, err
	}
	// Return latest location
	if err := connection.Get(db, intId, m); err != nil {
		return http.StatusInternalServerError, err
	}
	return http.StatusAccepted, nil
}
