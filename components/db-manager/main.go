package main

import (
	"fmt"
	"log"

	_ "github.com/lib/pq"

	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"

	// API demo https://www.soberkoder.com/swagger-go-api-swaggo/
	// Use https://github.com/swaggo/swag#declarative-comments-format to format REST API
	// pkg/api/docs folder is generated by Swag CLI, check readme.
	"famquest/components/db-manager/pkg/api"
	"famquest/components/db-manager/pkg/api/docs"
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/go-common/logger"
)

func init() {
	// Env variables are used to inject the IP to the Host annotation to connect swagger correctly
	// even in prod
	host := os.Getenv("SWAGGER_URL")
	docs.SwaggerInfo.Host = host
	docs.SwaggerInfo.Schemes = []string{os.Getenv("SWAGGER_SCHEMA")}
	docs.SwaggerInfo.BasePath = os.Getenv("SWAGGER_BASE_PATH")
}

// @title FamQuest DB Manager API
// @version 1.0
// @description Handles the connection to the DBs in DB Manager. PostgreSQL and MINIO
// @termsOfService http://swagger.io/terms/
// @contact.name Guillermo Gomez
// @contact.url https://github.com/guigomcha/famquest/
// @contact.email guillermo.gc1994@gmail.com
// @license.name Guillermo Gomez GPL V3
func main() {
	r := mux.NewRouter()
	r.PathPrefix("/swagger").Handler(httpSwagger.WrapHandler)
	r.HandleFunc("/health", api.Health).Methods("GET", "OPTIONS")
	r.HandleFunc("/configure", api.Configure).Methods("GET", "OPTIONS")

	r.HandleFunc("/attachment", api.AttachmentPost).Methods("POST", "OPTIONS")
	r.HandleFunc("/attachment", api.AttachmentGetAll).Methods("GET", "OPTIONS")
	r.HandleFunc("/attachment/{id}", api.AttachmentGet).Methods("GET", "OPTIONS")
	r.HandleFunc("/attachment/{id}", api.AttachmentPut).Methods("PUT", "OPTIONS")
	r.HandleFunc("/attachment/{id}/ref", api.AttachmentPutRef).Methods("PUT", "OPTIONS")
	r.HandleFunc("/attachment/{id}", api.AttachmentDelete).Methods("DELETE", "OPTIONS")

	r.HandleFunc("/spot", api.SpotPost).Methods("POST", "OPTIONS")
	r.HandleFunc("/spot", api.SpotGetAll).Methods("GET", "OPTIONS")
	r.HandleFunc("/spot/{id}", api.SpotGet).Methods("GET", "OPTIONS")
	r.HandleFunc("/spot/{id}", api.SpotPut).Methods("PUT", "OPTIONS")
	r.HandleFunc("/spot/{id}", api.SpotDelete).Methods("DELETE", "OPTIONS")

	r.HandleFunc("/location", api.LocationPost).Methods("POST", "OPTIONS")
	r.HandleFunc("/location", api.LocationGetAll).Methods("GET", "OPTIONS")
	r.HandleFunc("/location/{id}", api.LocationGet).Methods("GET", "OPTIONS")
	r.HandleFunc("/location/{id}", api.LocationPut).Methods("PUT", "OPTIONS")
	r.HandleFunc("/location/{id}/ref", api.LocationPutRef).Methods("PUT", "OPTIONS")
	r.HandleFunc("/location/{id}", api.LocationDelete).Methods("DELETE", "OPTIONS")

	r.HandleFunc("/task", api.TaskPost).Methods("POST", "OPTIONS")
	r.HandleFunc("/task", api.TaskGetAll).Methods("GET", "OPTIONS")
	r.HandleFunc("/task/{id}", api.TaskGet).Methods("GET", "OPTIONS")
	r.HandleFunc("/task/{id}/ref", api.TaskPutRef).Methods("PUT", "OPTIONS")
	r.HandleFunc("/task/{id}", api.TaskPut).Methods("PUT", "OPTIONS")
	r.HandleFunc("/task/{id}", api.TaskDelete).Methods("DELETE", "OPTIONS")

	// Start the server
	port := os.Getenv("SWAGGER_PORT")
	if port == "" {
		port = "8080" // Default port if not set
	}
	fmt.Printf("Starting server on port %s...\n", port)
	// Use CORS middleware to allow requests from frontend
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:8081",
		"http://localhost:8080",
		"https://portal.famquest.REPLACE_BASE_DOMAIN",
	}
	allowedMethods := []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	allowedHeaders := []string{"Content-Type", "Accept"}
	logger.Log.Debugf("CORS: %+v, %+v, %+v", allowedOrigins, allowedHeaders, allowedMethods)
	// Wrap your router with the CORS middleware

	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), handlers.CORS(handlers.AllowedOrigins(allowedOrigins), handlers.AllowedMethods(allowedMethods), handlers.AllowedHeaders(allowedHeaders))(r)); err != nil {
		connection.DB.Close()
		log.Fatal(err.Error())
	}
}
