#!/bin/sh

# Input parameters
BACKUP_FILE=$1
HASH_FILE=$2
# Env variables needed

# Returns the new hash in the file if it has changed

NEW_HASH=$(sha256sum $BACKUP_FILE | awk '{print $1}')
echo "Generated hash for backup: $NEW_HASH"

if [ -f "$HASH_FILE" ]; then
    PREVIOUS_HASH=$(cat $HASH_FILE)
    echo "Previous backup hash: $PREVIOUS_HASH"

    if [ "$NEW_HASH" = "$PREVIOUS_HASH" ]; then
        echo "Backup file has not changed. No updates detected."
        rm -f $BACKUP_FILE
    else
        echo "Backup file has changed. Updates detected."
    fi
else
    echo "No previous backup hash found. Assuming this is the first backup."
fi

echo "$NEW_HASH" > $HASH_FILE