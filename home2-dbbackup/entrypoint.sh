#!/bin/sh

BACKUP_NAME=backup-$(date +"%Y-%m-%d")
mongodump --uri="$MONGO_URL" -o "$BACKUP_NAME"

aws configure set aws_access_key_id $AWS_KEY_ID
aws configure set aws_secret_access_key $AWS_KEY
BACKUP_TIMESTAMP=$(date +%s)
find "$BACKUP_NAME" -type f -exec aws s3 cp {} "s3://$BUCKET_PATH/$BACKUP_NAME/$BACKUP_TIMESTAMP/" --storage-class=DEEP_ARCHIVE \;

echo Success