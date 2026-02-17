# Frontend - Development Dockerfile
# Optimized for development with Next.js hot reload

FROM node:20-alpine

# Install pnpm package manager
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration files (these rarely change)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy database package (shared dependency)
COPY database ./database

# Copy frontend
COPY frontend ./frontend

# Install dependencies
# Use frozen-lockfile to ensure reproducible builds
RUN pnpm install --frozen-lockfile

# Expose the frontend dev server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Run Next.js dev server
# Next.js dev server includes hot module reload
WORKDIR /app/frontend
CMD ["pnpm", "run", "dev"]
