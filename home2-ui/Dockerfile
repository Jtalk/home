FROM node:17

ARG REACT_APP_VERSION
WORKDIR /app

COPY node_modules ./node_modules
COPY .next ./.next
COPY public ./public
COPY package*.json ./
COPY next.config.js ./

ENV PORT=80
ENV NODE_ENV=production
ENV REACT_APP_VERSION=$REACT_APP_VERSION

RUN npm rebuild
CMD ["npm", "start"]
