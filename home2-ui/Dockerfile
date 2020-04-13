FROM node:13-alpine
RUN npm install -g serve
WORKDIR /app
COPY build ./
ENV PORT=80
ENV NODE_ENV=production
# To be set by the build process
# ENV REACT_APP_API_URL=...
# ENV REACT_APP_TEST_DURATION=0
CMD ["serve", "-s", "."]
