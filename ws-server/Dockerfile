# WebSocket Server Dockerfile
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace files
COPY ../pnpm-workspace.yaml .
COPY ../pnpm-lock.yaml .
COPY ../package.json .

# Copy ws-server service
COPY ./ ./ws-server/

# Copy database package
COPY ../database/ ./database/

WORKDIR /app/ws-server

RUN pnpm install --frozen-lockfile

RUN pnpm run build

EXPOSE 8080

CMD ["pnpm", "run", "dev"]
