# Use specific version of Bun for reproducibility
FROM oven/bun:1.1.34-alpine AS base

# Set working directory
WORKDIR /app

# Development stage
FROM base AS development

# Copy package files (handle missing bun.lockb gracefully)
COPY package.json ./
COPY bun.lockb* ./

# Install all dependencies (including dev dependencies)
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start the application in development mode
CMD ["bun", "run", "dev"]

# Production stage
FROM base AS production

# Copy package files
COPY package.json ./
COPY bun.lockb* ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production || bun install --production

# Copy source code
COPY . .


# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Expose port
EXPOSE 4000

# Start the application
CMD ["bun", "run", "src/server.ts"]
