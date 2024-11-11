package api

import (
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/go-common/logger"
	"net/http"
	"strconv"
)

// Generic operations used by all endpoints

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
func crudGetAll(m connection.DbInterface) ([]connection.DbInterface, int, error) {
	var dest []connection.DbInterface
	dest, err := connection.GetAll(connection.DB, m)
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
