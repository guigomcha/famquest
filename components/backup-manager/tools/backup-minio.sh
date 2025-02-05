#!/bin/sh

# Input parameters
BACKUP_DIR=$1
NAMESPACE=$2
# Env variables needed
# DB_NAME
# Returns the name of the file generated

TIMESTAMP=$(date +"%m-%d-%Y-%H-%M")
POD_NAME=$(kubectl get pods -n $NAMESPACE --selector=app=minio -o jsonpath="{.items[0].metadata.name}") 
BACKUP_NAME=backup-minio-$DB_NAME-$TIMESTAMP.tar.gz

echo "Creating MINIO backup in pod: $POD_NAME"
kubectl exec -n $NAMESPACE $POD_NAME -- sh -c "mkdir -p /opt/bitnami/minio-client/backups && tar -czf /opt/bitnami/minio-client/backups/$BACKUP_NAME /data/$DB_NAME-*"

echo "Copying backup file from pod to local directory"
BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME"
kubectl cp --retries=-1  -n $NAMESPACE $POD_NAME:/opt/bitnami/minio-client/backups/$BACKUP_NAME $BACKUP_FILE

echo "$BACKUP_FILE"  # Return the backup file name
