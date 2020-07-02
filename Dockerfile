FROM node:14-slim

WORKDIR /goban

COPY pkg pkg
COPY nodepkg nodepkg
COPY www www
COPY server server

EXPOSE 3000

WORKDIR /goban/server
RUN npm install
ENTRYPOINT npm run serve
