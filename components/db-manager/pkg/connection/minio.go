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
	logger.Log.Infof("Connecting to Minio '%s'", os.Getenv("MINIO"))
	minioClient, err := minio.New(os.Getenv("MINIO"), &minio.Options{
		Creds:  credentials.NewStaticV4("demo", "mypassword", ""),
		Secure: false,
	})
	if err != nil {
		return nil, err
	}
	// Create buckets if needed
	// Check if the bucket exists, and create it if not
	logger.Log.Infof("Creating buckets")
	bucketNames := []string{"image", "audio"} // match with contentType
	for _, bucketName := range bucketNames {
		bucketExists, err := minioClient.BucketExists(context.Background(), bucketName)
		if err != nil {
			logger.Log.Debugf("unable to connect to minio: %s", err.Error())
			return nil, err
		}
		if !bucketExists {
			err = minioClient.MakeBucket(context.Background(), bucketName, minio.MakeBucketOptions{})
			if err != nil {
				logger.Log.Debugf("unable to connect to minio: %s", err.Error())
				return nil, err
			}
		}

	}
	return minioClient, nil
}
