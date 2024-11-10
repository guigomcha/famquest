package connection

import (
	"context"
	// "fmt"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var Minio *minio.Client

func ConnectToMinio() (*minio.Client, error) {
	minioClient, err := minio.New("localhost:5430", &minio.Options{
		Creds:  credentials.NewStaticV4("demo", "mypassword", ""),
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

// // Function to set the bucket policy to allow public read access (GET)
// func setBucketPolicy(client *minio.Client, bucketName string) error {
// 	// Define the policy JSON for public read access (GET)
// 	bucketPolicy := `{
// 		"Version": "2012-10-17",
// 		"Statement": [
// 			{
// 				"Effect": "Allow",
// 				"Action": "s3:GetObject",
// 				"Resource": "arn:aws:s3:::` + bucketName + `/*"
// 			}
// 		]
// 	}`

// 	// Set the bucket policy
// 	err := client.SetBucketPolicy(context.Background(), bucketName, bucketPolicy)
// 	if err != nil {
// 		return fmt.Errorf("error setting bucket policy: %w", err)
// 	}

// 	fmt.Printf("Public read policy set for bucket '%s'.\n", bucketName)
// 	return nil
// }
