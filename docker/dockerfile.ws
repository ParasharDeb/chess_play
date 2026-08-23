FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace packages
COPY database ./database
COPY express ./express
COPY ws-server ./ws-server

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build dependencies first
RUN pnpm --filter database build
RUN pnpm --filter express build
RUN pnpm --filter ws-server build

EXPOSE 8080

# Start WebSocket server
CMD ["pnpm", "--filter", "ws-server", "start"]