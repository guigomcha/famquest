package api

import (
	"encoding/json"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
	"net/http"
)

// Configure godoc
// @Summary Configure
// @Description Connect and check dependencies
// @Tags Configure
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /configure [get]
func Configure(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("initiating db manager backend")
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Log.Info("Postgress connected")
	connection.DB = db
	if _, err := db.Exec(models.Schema); err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Log.Info("Postgress configured")
	minioClient, err := connection.ConnectToMinio()
	if err != nil {
		logger.Log.Error(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Log.Info("Minio configured")
	connection.Minio = minioClient
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "all connected"})
}
