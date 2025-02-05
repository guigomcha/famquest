#!/bin/sh

# Input parameters
BACKUP_DIR=$1
BACKUP_EXTENSION=$2
# Env variables needed

# Returns a cleaner local filesystem

BACKUP_FILES=$(find "$BACKUP_DIR" -type f -name "*$BACKUP_EXTENSION" -exec ls -t {} + 2>/dev/null)
set -- $BACKUP_FILES

if [ "$#" -le 2 ]; then
    echo "Not enough backups to delete. Keeping existing files."
    exit 0
fi

i=0
for file in "$@"; do
    i=$((i + 1))
    if [ "$i" -gt 2 ]; then
        echo "Deleting old backup: $file"
        rm -f "$file"
    fi
done

echo "Cleanup completed. Only the two most recent backups are kept."
