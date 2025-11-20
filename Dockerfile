# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy configuration files
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copy source code (explicitly copy src to ensure all files are included)
COPY src ./src

# Build the NestJS application
RUN npm run build

# Stage 2: Production Run
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy frontend static files
COPY frontend ./frontend
COPY chat-frontend ./chat-frontend

# Copy email templates (needed at runtime)
COPY src/auth/templates ./src/auth/templates

# Create cache directory for IA models
ENV XENOVA_CACHE_DIR=/app/.cache
RUN mkdir -p /app/.cache && chown -R node:node /app/.cache

# Expose application port
EXPOSE 3000

# Use non-root user for security
USER node

# Start command
CMD ["node", "dist/main"]
