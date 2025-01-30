#!/bin/sh

# Set variables
NAMESPACE=$1
BACKUP_DIR=$2
DB_TARGET=$3
HASH_FILE="$BACKUP_DIR/latest_backup_hash.txt"
# ENV Variables needed
# DB_USER
# DB_NAME

if [ "$DB_TARGET" = "postgresql" ]; then
    BACKUP_EXTENSION=".sql"
elif [ "$DB_TARGET" = "minio" ]; then
    BACKUP_EXTENSION=".tar.gz"
else
    echo "ERROR: Invalid DB_TARGET value '$DB_TARGET'. Exiting."
    exit 1
fi

# Create local backup directory
mkdir -p $BACKUP_DIR

BACKUP_FILE=$(./backup-$DB_TARGET.sh $BACKUP_DIR $NAMESPACE 2>/dev/null | tail -n 1)
echo "FINAL $BACKUP_FILE"

if [ $? -ne 0 ]; then
  # If the backup script failed (non-zero exit code), alert the user
  echo "ERROR: The backup script failed. No backup was created."
  exit 1
fi

./push-backup.sh $BACKUP_FILE $HASH_FILE

if [ $? -ne 0 ]; then
  echo "ERROR: The push script failed."
  exit 1
fi

./cleanup-local-backups.sh $BACKUP_DIR $BACKUP_EXTENSION