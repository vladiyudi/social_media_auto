# Use Node.js LTS (Long Term Support) version
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install sharp explicitly
RUN apk add --no-cache python3 make g++ vips-dev

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies including sharp
RUN npm install --legacy-peer-deps sharp

# Copy local code to container
COPY . .

# Copy build environment file
COPY .env.build .env

# Build the application
RUN npm run build

# Remove the environment file after build
RUN rm -f .env

# Production image, copy all the files and run next
FROM node:20-alpine AS runner

WORKDIR /app

# Install sharp in the production image
RUN apk add --no-cache vips-dev
RUN npm install --platform=linuxmusl --arch=x64 sharp

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set runtime environment variables
ENV PORT=8080
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/server ./.next/server
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/types ./.next/types
COPY --from=builder /app/node_modules ./node_modules

# Create cache directory and set permissions
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 8080

# Start the server with the correct port
CMD ["sh", "-c", "PORT=8080 node server.js"]
