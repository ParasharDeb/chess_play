FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /user/src/app

COPY ./database ./database
COPY package.json package.json
COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY ./ws-server ./ws-server

RUN pnpm install 

RUN cd ws-server && pnpm run build

EXPOSE 8080

CMD [ "pnpm","run","dev" ]