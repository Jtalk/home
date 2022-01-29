FROM mongo:4
COPY ./* /docker-entrypoint-initdb.d/
RUN chmod -R 0777 /docker-entrypoint-initdb.d/

RUN apt update && apt install uuid-runtime
