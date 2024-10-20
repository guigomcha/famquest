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
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return dest, http.StatusInternalServerError, err
	}
	lastInsertId, err := connection.Insert(db, m)
	if err != nil {
		logger.Log.Debug("insert error")
		return dest, http.StatusInternalServerError, err
	}
	dest, err = connection.Get(db, lastInsertId, m)
	if err != nil {
		logger.Log.Debug("Get error")
		return dest, http.StatusInternalServerError, err
	}
	logger.Log.Debugf("object created in db: %d", lastInsertId)
	return dest, http.StatusAccepted, nil
}

// pointer to interface
func crudGetAll(m connection.DbInterface) ([]connection.DbInterface, int, error) {
	var dest []connection.DbInterface
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return dest, http.StatusInternalServerError, err
	}
	dest, err = connection.GetAll(db, m)
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
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return dest, http.StatusInternalServerError, err
	}
	intId, err := parseId(mVars["id"])
	if err != nil {
		return dest, http.StatusBadRequest, err
	}
	dest, err = connection.Get(db, intId, m)
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
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	intId, err := parseId(mVars["id"])
	if err != nil {
		return http.StatusBadRequest, err
	}
	if err := connection.Delete(db, intId, m); err != nil {
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
	var dest connection.DbInterface
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		return dest, http.StatusInternalServerError, err
	}
	intId, err := parseId(mVars["id"])
	if err != nil {
		return dest, http.StatusBadRequest, err
	}
	dest, err = connection.Update(db, intId, m)
	if err != nil {
		if err.Error() == connection.ErrorIdDoesNotExits {
			return dest, http.StatusBadRequest, err
		}
		return dest, http.StatusInternalServerError, err
	}

	return dest, http.StatusAccepted, nil
}
