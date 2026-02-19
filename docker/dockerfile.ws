FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY database ./database
COPY ws-server ./ws-server

RUN pnpm install --frozen-lockfile
RUN pnpm --filter database build
RUN pnpm --filter express build

EXPOSE 8080

CMD ["pnpm", "--filter", "express", "dev"]
