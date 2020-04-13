FROM node:13-alpine
RUN npm install -g serve
WORKDIR /app
COPY build ./
ENV PORT=80
ENV NODE_ENV=production
ENV REACT_APP_TEST_DURATION=0
CMD ["serve", "-s", "."]
