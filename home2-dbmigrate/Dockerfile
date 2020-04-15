FROM node:13-alpine
COPY ./ ./
RUN npm ci
ENTRYPOINT ["npm", "run"]
CMD ["status"]
