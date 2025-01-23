package api

import (
	"encoding/json"
	"net/http"
)

// Health godoc
// @Summary Health check
// @Description Check the health of the service
// @Tags health
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /health [get]
func Health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "up"})
}
