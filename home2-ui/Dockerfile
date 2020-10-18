FROM node:13-alpine
WORKDIR /app
COPY node_modules ./node_modules
COPY .next ./.next
COPY package*.json ./
ENV PORT=80
ENV NODE_ENV=production
RUN npm rebuild
# To be set by the build process
# ENV REACT_APP_API_URL=...
# ENV REACT_APP_TEST_DURATION=0
CMD ["npm", "start"]
