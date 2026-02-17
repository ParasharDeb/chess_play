# Frontend Next.js Dockerfile
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace files
COPY ../pnpm-workspace.yaml .
COPY ../pnpm-lock.yaml .
COPY ../package.json .

# Copy frontend service
COPY ./ ./frontend/

# Copy database package
COPY ../database/ ./database/

WORKDIR /app/frontend

RUN pnpm install --frozen-lockfile

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start"]
