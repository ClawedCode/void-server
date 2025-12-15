# Void Server - Production Dockerfile
# Multi-stage build for optimized production image

# =============================================================================
# Stage 1: Builder - Install dependencies and build client
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation (better layer caching)
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci && cd client && npm ci

# Copy source code
COPY . .

# Build client for production
ENV NODE_ENV=production
RUN npm run build --prefix client

# =============================================================================
# Stage 2: Production - Minimal runtime image
# =============================================================================
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built client from builder
COPY --from=builder /app/client/dist ./client/dist

# Copy server and plugins
COPY server/ ./server/
COPY plugins/ ./plugins/

# Copy ecosystem config
COPY ecosystem.config.js ./

# Create directories for volume mounts
RUN mkdir -p config backups logs data

# Create non-root user for security
RUN addgroup -g 1001 -S voidserver && \
    adduser -S voidserver -u 1001 -G voidserver && \
    chown -R voidserver:voidserver /app

USER voidserver

EXPOSE 4401

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4401/health || exit 1

# Start with PM2 runtime
CMD ["npx", "pm2-runtime", "ecosystem.config.js", "--env", "production"]
