package connection

import (
	"context"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"famquest/components/db-manager/pkg/models"
	"famquest/components/go-common/logger"
)

var Minio *minio.Client

func ConnectToMinio() (*minio.Client, error) {
	logger.Log.Infof("Connecting to Minio '%s'", os.Getenv("MINIO_URL"))
	minioClient, err := minio.New(os.Getenv("MINIO_URL"), &minio.Options{
		Creds:  credentials.NewStaticV4(os.Getenv("MINIO_USER"), os.Getenv("MINIO_PASSWORD"), ""),
		Secure: os.Getenv("SWAGGER_SCHEMA") == "https",
	})
	if err != nil {
		return nil, err
	}
	// Create buckets if needed
	// Check if the bucket exists, and create it if not
	bucketNames := []string{os.Getenv("DB_NAME") + "-image", os.Getenv("DB_NAME") + "-audio", os.Getenv("DB_NAME") + "-video", os.Getenv("DB_NAME") + "-pdf"} // match with contentType
	logger.Log.Infof("Checking buckets %+v", bucketNames)
	for _, bucketName := range bucketNames {
		bucketExists, err := minioClient.BucketExists(context.Background(), bucketName)
		if err != nil {
			logger.Log.Debugf("unable to connect to minio: %s", err.Error())
			return nil, err
		}
		if !bucketExists {
			logger.Log.Infof("Creating bucket %s", bucketName)
			err = minioClient.MakeBucket(context.Background(), bucketName, minio.MakeBucketOptions{})
			if err != nil {
				logger.Log.Debugf("unable to connect to minio: %s", err.Error())
				return nil, err
			}
		}

	}
	return minioClient, nil
}

func AuthorizedUrl(item models.Media) string {
	reqHeaders := make(http.Header)
	bucket := ""
	if strings.HasPrefix(item.ContentType, "image/") || strings.HasPrefix(item.ContentType, "audio/") || strings.HasPrefix(item.ContentType, "video/") {
		bucket = strings.Split(item.ContentType, "/")[0]
	} else if item.ContentType == "application/pdf" {
		bucket = strings.Split(item.ContentType, "/")[1]
	} else {
		logger.Log.Errorf("Unknown contentType %s for %s", item.ContentType, item.ID)
		return ""
	}

	presignedURL, err := Minio.PresignHeader(context.Background(), http.MethodGet, os.Getenv("DB_NAME")+"-"+bucket, item.URL, time.Hour, make(url.Values), reqHeaders)
	if err != nil {
		logger.Log.Error(err.Error())
		return ""
	}
	return presignedURL.String()
}
