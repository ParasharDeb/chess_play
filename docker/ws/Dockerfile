# WebSocket Server - Development Dockerfile
# Optimized for development with hot reload support

FROM node:20-alpine

# Install pnpm package manager
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration files (these rarely change)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy database package (shared dependency)
COPY database ./database

# Copy WebSocket server
COPY ws-server ./ws-server

# Install dependencies
# Use frozen-lockfile to ensure reproducible builds
RUN pnpm install --frozen-lockfile

# Build TypeScript
RUN cd ws-server && pnpm run build

# Expose the WebSocket port
EXPOSE 8080

# Health check (for WebSocket server)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('net').createConnection({port:8080})" || exit 1

# Run in development mode with auto-reload
WORKDIR /app/ws-server
CMD ["pnpm", "run", "dev"]
