echo Creating Owner image
cd /docker-entrypoint-initdb.d
mongofiles -d "$MONGO_INITDB_DATABASE" --type=image/png put avatar.png
mongofiles -d "$MONGO_INITDB_DATABASE" --type=image/png put project.png
cd -
echo Created Owner image