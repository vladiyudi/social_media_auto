# Use Node.js LTS (Long Term Support) version
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy local code to container
COPY . .

# Set default environment variables
ENV MONGODB_URI=""
ENV NEXTAUTH_URL=""
ENV NEXTAUTH_SECRET=""
ENV GOOGLE_ID=""
ENV GOOGLE_SECRET=""
ENV CLAUDE_API_KEY=""
ENV FAL_AI_KEY=""
ENV NEXT_PUBLIC_CONNECTIONS=""
ENV PORT=8080

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
