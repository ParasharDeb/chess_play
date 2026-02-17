# Express Backend - Development Dockerfile
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

# Copy express backend
COPY express ./express

# Install dependencies
# Use frozen-lockfile to ensure reproducible builds
RUN pnpm install --frozen-lockfile

# Build TypeScript
RUN cd express && pnpm run build

# Expose the Express port
EXPOSE 3030

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3030', (r) => {if (r.statusCode !== 404) throw new Error(r.statusCode)})" || exit 1

# Run in development mode with auto-reload
# Use pnpm run dev for nodemon support if configured
WORKDIR /app/express
CMD ["pnpm", "run", "dev"]
