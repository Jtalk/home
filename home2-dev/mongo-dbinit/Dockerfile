FROM mongo:5
COPY ./* /docker-entrypoint-initdb.d/
RUN chmod -R 0777 /docker-entrypoint-initdb.d/

RUN apt update && apt install uuid-runtime
