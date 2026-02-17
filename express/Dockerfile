# Express API Server Dockerfile
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace files
COPY ../pnpm-workspace.yaml .
COPY ../pnpm-lock.yaml .
COPY ../package.json .

# Copy express service
COPY ./ ./express/

# Copy database package
COPY ../database/ ./database/

WORKDIR /app/express

RUN pnpm install --frozen-lockfile

RUN pnpm run build

EXPOSE 3001

CMD ["pnpm", "run", "dev"]
