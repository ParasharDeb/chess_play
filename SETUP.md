# Chess Play - Setup Guide

Welcome to Chess Play! This guide will help you set up the project for development or deployment.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Manual Installation](#manual-installation)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure](#project-structure)

---

## System Requirements

### For Docker Setup:
- **Docker**: Version 20.10 or higher - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: Version 2.0 or higher - [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Git**: For cloning the repository

### For Manual Installation:
- **Node.js**: Version 20.x LTS - [Install Node.js](https://nodejs.org/)
- **pnpm**: Version 8.x - Install via `npm install -g pnpm`
- **MongoDB**: Version 7.0 or higher - [Install MongoDB](https://docs.mongodb.com/manual/installation/)
- **Git**: For cloning the repository

---

## Quick Start with Docker

Setting up the entire application with Docker is the easiest and most reliable way to get started.

### 1. Clone the Repository

```bash
git clone https://github.com/ParasharDeb/chess_play.git
cd chess_play
```

### 2. Build and Start Services

```bash
docker-compose up --build
```

This command will:
- Build all Docker images for frontend, backend, and database
- Start MongoDB service
- Start Express API server on port `3001`
- Start WebSocket server on port `8080`
- Start Next.js frontend on port `3000`

### 3. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **WebSocket**: ws://localhost:8080

### 4. Verify Everything is Working

```bash
# Check if all services are running
docker-compose ps

# View logs from all services
docker-compose logs -f

# View logs from a specific service
docker-compose logs -f frontend
docker-compose logs -f express
docker-compose logs -f ws-server
```

### 5. Stop the Services

```bash
# Stop all services
docker-compose down

# Stop services and remove volumes (database data will be deleted)
docker-compose down -v
```

---

## Manual Installation

If you prefer to run the application without Docker, follow these steps.

### 1. Clone the Repository

```bash
git clone https://github.com/ParasharDeb/chess_play.git
cd chess_play
```

### 2. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### 3. Set Up MongoDB

**Option A: Local MongoDB Installation**

- Install MongoDB Community Edition from [here](https://docs.mongodb.com/manual/installation/)
- Start MongoDB service
- Create a database named `chess_play`

**Option B: MongoDB Atlas (Cloud)**

- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get your connection string

### 4. Install Dependencies

```bash
# Install workspace dependencies
pnpm install
```

### 5. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_URL=mongodb://localhost:27017/chess_play
# For MongoDB Atlas, use:
# DB_URL=mongodb+srv://username:password@clustername.mongodb.net/chess_play

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Node Environment
NODE_ENV=development

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-secret-key-here-change-in-production
```

### 6. Build All Packages

```bash
pnpm build
```

### 7. Run Services in Separate Terminals

**Terminal 1: Database Service** (if needed for initialization)

```bash
cd database
pnpm build
```

**Terminal 2: Express API Server**

```bash
cd express
pnpm run dev
# Server runs on http://localhost:3001
```

**Terminal 3: WebSocket Server**

```bash
cd ws-server
pnpm run dev
# Server runs on ws://localhost:8080
```

**Terminal 4: Frontend**

```bash
cd frontend
pnpm run dev
# Frontend runs on http://localhost:3000
```

### 8. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **WebSocket**: ws://localhost:8080

---

## Environment Configuration

### Root `.env` File

The main environment configuration should be placed in the root directory:

```env
# Database
DB_URL=mongodb://localhost:27017/chess_play

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Environment
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-here
```

### Docker Environment

When using Docker Compose, environment variables are automatically configured in `docker-compose.yml`. You can override them by creating a `.env` file in the root directory and setting:

```env
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin_password
EXPRESS_PORT=3001
WS_PORT=8080
FRONTEND_PORT=3000
```

---

## Running the Application

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using pnpm (Manual)

**Development Mode**

```bash
# From root directory - run all services in dev mode
pnpm dev

# Or run individual services
cd frontend && pnpm run dev
cd express && pnpm run dev
cd ws-server && pnpm run dev
```

**Production Mode**

```bash
# Build all packages
pnpm build

# Run services
cd express && pnpm start
cd ws-server && pnpm start
cd frontend && pnpm start
```

---

## Testing Your Setup

### 1. Check API Endpoint

```bash
# Using curl
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Expected response (or error if validation fails)
```

### 2. Check WebSocket Connection

```bash
# Using Node.js WebSocket client
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');
ws.on('open', () => {
  console.log('✅ WebSocket connected!');
  ws.close();
  process.exit(0);
});
ws.on('error', (err) => {
  console.error('❌ Connection failed:', err);
  process.exit(1);
});
"
```

Or use an online WebSocket client: https://www.websocket.org/echo.html

### 3. Check Frontend

Simply open http://localhost:3000 in your browser and verify it loads without errors.

### 4. Check Database Connection

```bash
# For local MongoDB
mongosh localhost:27017/chess_play

# For MongoDB Atlas
mongosh "mongodb+srv://username:password@clustername.mongodb.net/chess_play"
```

---

## Troubleshooting

### Docker Issues

**Issue: Port already in use**

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (macOS/Linux)
kill -9 <PID>

# On Windows, use Task Manager or:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Issue: Container won't start**

```bash
# Check logs
docker-compose logs -f <service-name>

# Rebuild image
docker-compose build --no-cache

# Remove dangling images
docker image prune -f
```

### Manual Installation Issues

**Issue: pnpm not found**

```bash
npm install -g pnpm
```

**Issue: MongoDB connection failed**

- Ensure MongoDB is running: `mongosh localhost:27017`
- Check connection string in `.env`
- Verify MongoDB user credentials (if using authentication)

**Issue: Port already in use**

Change the ports in `.env` or modify service configurations.

**Issue: Dependencies not installed**

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Common Errors

**Error: "Cannot find module '@repo/database'**

```bash
# Ensure workspace is properly set up
pnpm install --frozen-lockfile
pnpm build
```

**Error: "ECONNREFUSED - Database connection failed"**

- Ensure MongoDB is running
- Check `DB_URL` in `.env`
- Verify network connectivity (for Docker: check service names)

**Error: "WebSocket connection failed"**

- Ensure ws-server is running on port 8080
- Check `NEXT_PUBLIC_WS_URL` in frontend environment

---

## Project Structure

```
chess_play/
├── frontend/              # Next.js React application
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks
│   └── package.json
│
├── express/              # Express.js API server
│   ├── src/
│   │   ├── index.ts      # Main server file
│   │   └── types.ts      # TypeScript types/schemas
│   └── package.json
│
├── ws-server/            # WebSocket server for real-time game
│   ├── src/
│   │   ├── index.ts      # WebSocket entry point
│   │   ├── game.ts       # Game logic
│   │   ├── gamemanager.ts
│   │   └── message.ts
│   └── package.json
│
├── database/             # Shared database package
│   ├── src/
│   │   ├── index.ts
│   │   └── config.ts
│   └── package.json
│
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile.prod       # Production Docker build
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── package.json          # Root package.json
└── README.md
```

---

## Next Steps

After setup, check out:
- [CONTRIBUTION.md](./CONTRIBUTION.md) - Contributing guidelines
- [README.md](./README.md) - Project overview
- Individual service READMEs for specific documentation

---

## Support

If you encounter issues not covered here:

1. Check existing GitHub issues: https://github.com/ParasharDeb/chess_play/issues
2. Create a new issue with details about your problem
3. Join our community discussions

---

**Last updated**: February 2026
