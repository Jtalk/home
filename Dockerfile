FROM node:17-alpine as node
RUN corepack enable

FROM node as base
WORKDIR /builder
COPY . .
RUN yarn install --immutable

FROM base as dbmigrate-builder
WORKDIR /builder/home2-dbmigrate
RUN mkdir -p /app
RUN yarn bundle --output-directory /app --no-compress

FROM node as dbmigrate 
COPY --from=dbmigrate-builder /app/ /app
WORKDIR /app/home2-dbmigrate
ENTRYPOINT ["yarn", "run"]
CMD ["migrate:status"]