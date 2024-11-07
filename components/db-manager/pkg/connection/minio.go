package connection

import (
	"context"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func ConnectToMinio() (*minio.Client, error) {
	minioClient, err := minio.New("localhost:5430", &minio.Options{
		Creds:  credentials.NewStaticV4("REPLACE", "REPLACE", ""),
		Secure: false,
	})
	if err != nil {
		return nil, err
	}
	// Create buckets if needed
	// Check if the bucket exists, and create it if not
	bucketNames := []string{"image", "audio"} // match with contentType
	for _, bucketName := range bucketNames {
		bucketExists, err := minioClient.BucketExists(context.Background(), bucketName)
		if err != nil {
			return nil, err
		}
		if !bucketExists {
			err = minioClient.MakeBucket(context.Background(), bucketName, minio.MakeBucketOptions{})
			if err != nil {
				return nil, err
			}
		}
	}

	return minioClient, nil
}
