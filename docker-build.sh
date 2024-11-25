#!/bin/bash

# Stop any running containers
docker ps -q | xargs -r docker stop

# Remove existing container
docker rm -f sm-automation 2>/dev/null || true

# Build the Docker image
docker buildx build \
  --platform linux/amd64 \
  --progress plain \
  --no-cache \
  -t sm-automation \
  .

# Run the container with environment variables
docker run -d \
  --name sm-automation \
  --env-file .env \
  -p 8080:8080 \
  sm-automation

# Follow the logs
docker logs -f sm-automation
