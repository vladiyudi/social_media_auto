# Build stage
FROM --platform=linux/amd64 node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    build-base \
    vips-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Copy env file
COPY .env.build .env

# Build the app
RUN npm run build

# Remove env file
RUN rm -f .env

# Production stage
FROM --platform=linux/amd64 node:18-alpine AS runner

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache \
    vips \
    openssl \
    ca-certificates

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV PORT=8080
ENV HOST=0.0.0.0

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
