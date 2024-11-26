# Build stage
FROM --platform=linux/amd64 node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    build-base \
    vips-dev \
    openssl \
    openssl-dev

# Copy package files
COPY package*.json ./

# Copy environment files
COPY .env.temp .env

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Clean up environment files
RUN rm -f .env

# Production stage
FROM --platform=linux/amd64 node:18-alpine AS runner

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache \
    vips \
    openssl \
    openssl-dev \
    ca-certificates

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/google-credentials.json

# Copy the standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/google-credentials.json ./google-credentials.json

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
