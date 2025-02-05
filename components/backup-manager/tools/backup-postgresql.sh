#!/bin/sh

# Input parameters
BACKUP_DIR=$1
NAMESPACE=$2
# Env variables needed
# DB_USER
# DB_NAME

# Returns the backup file generated

TIMESTAMP=$(date +"%m-%d-%Y-%H-%M")
POD_NAME=$(kubectl get pods -n $NAMESPACE --selector=app=postgresql -o jsonpath="{.items[0].metadata.name}") 
BACKUP_NAME=backup-postgresql-$DB_NAME-$TIMESTAMP.sql

echo "Creating PostgreSQL backup in pod: $POD_NAME"
kubectl exec -n $NAMESPACE $POD_NAME -- sh -c "mkdir -p /backups && pg_dump -U $DB_USER -h localhost $DB_NAME > /backups/$BACKUP_NAME"

echo "Copying backup file from pod to local directory"
kubectl cp -n $NAMESPACE $POD_NAME:/backups/$BACKUP_NAME $BACKUP_DIR/$BACKUP_NAME

BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME"
echo "$BACKUP_FILE"  # Return the backup file name
