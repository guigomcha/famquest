#!/bin/sh

# Input parameters
BACKUP_FILE=$1
HASH_FILE=$2
# Env variables needed
#OAUTH_APP_KEY
#OAUTH_APP_SECRET
#OAUTH_REFRESH_TOKEN
# Returns the new hash in the file if it has changed

# Prepare the Dropbox config file
DROPBOX_CONFIG_FILE=".dropbox_uploader"
touch $DROPBOX_CONFIG_FILE
echo "CONFIGFILE_VERSION=2.0" > $DROPBOX_CONFIG_FILE
echo "OAUTH_APP_KEY=$OAUTH_APP_KEY" >> $DROPBOX_CONFIG_FILE
echo "OAUTH_APP_SECRET=$OAUTH_APP_SECRET" >> $DROPBOX_CONFIG_FILE
echo "OAUTH_REFRESH_TOKEN=$OAUTH_REFRESH_TOKEN" >> $DROPBOX_CONFIG_FILE


# Uploading is based on the hash of the backup file
NEW_HASH=$(sha256sum $BACKUP_FILE | awk '{print $1}')
echo "Generated hash for $BACKUP_FILE: $NEW_HASH"

if [ -f "$HASH_FILE" ]; then
    PREVIOUS_HASH=$(cat $HASH_FILE)
    echo "Previous backup hash: $PREVIOUS_HASH"

    if [ "$NEW_HASH" = "$PREVIOUS_HASH" ]; then
        echo "Backup file has not changed. No updates detected."
        rm -f $BACKUP_FILE
    else
        echo "Backup file has changed. Updates detected. Pushing to Dropbox."
        ./dropbox_uploader.sh -f $DROPBOX_CONFIG_FILE upload $BACKUP_FILE $BACKUP_FILE
    fi
else
    echo "No previous backup hash found. Assuming this is the first backup. Pushing to Dropbox."
    ./dropbox_uploader.sh -f $DROPBOX_CONFIG_FILE upload $BACKUP_FILE $BACKUP_FILE 
fi

echo "$NEW_HASH" > $HASH_FILE
rm $DROPBOX_CONFIG_FILE