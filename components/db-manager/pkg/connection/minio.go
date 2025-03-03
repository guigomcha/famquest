package connection

import (
	"context"
	"os"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"famquest/components/go-common/logger"
)

var Minio *minio.Client

func ConnectToMinio() (*minio.Client, error) {
	logger.Log.Infof("Connecting to Minio '%s'", os.Getenv("MINIO_URL"))
	minioClient, err := minio.New(os.Getenv("MINIO_URL"), &minio.Options{
		Creds:  credentials.NewStaticV4(os.Getenv("MINIO_USER"), os.Getenv("MINIO_PASSWORD"), ""),
		Secure: false,
	})
	if err != nil {
		return nil, err
	}
	// Create buckets if needed
	// Check if the bucket exists, and create it if not
	bucketNames := []string{os.Getenv("DB_NAME") + "-image", os.Getenv("DB_NAME") + "-audio"} // match with contentType
	logger.Log.Infof("Checking buckets %+v", bucketNames)
	for _, bucketName := range bucketNames {
		bucketExists, err := minioClient.BucketExists(context.Background(), bucketName)
		if err != nil {
			logger.Log.Debugf("unable to connect to minio: %s", err.Error())
			return nil, err
		}
		if !bucketExists {
			logger.Log.Infof("Creating buckets")
			err = minioClient.MakeBucket(context.Background(), bucketName, minio.MakeBucketOptions{})
			if err != nil {
				logger.Log.Debugf("unable to connect to minio: %s", err.Error())
				return nil, err
			}
		}

	}
	return minioClient, nil
}
