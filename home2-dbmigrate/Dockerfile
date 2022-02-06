FROM node:17-alpine
COPY ./ ./
RUN npm ci
ENTRYPOINT ["npm", "run"]
CMD ["status"]
