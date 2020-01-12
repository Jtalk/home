echo Creating Owner image
cd /docker-entrypoint-initdb.d
mongofiles -d "$MONGO_INITDB_DATABASE" -t image/png put_id avatar.png \"$(uuidgen --time)\"
cd -
echo Created Owner image