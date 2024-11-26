#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="poetic-analog-442510-e8"
REGION="us-central1"  # Default region
SERVICE_NAME="sm-automation"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Process environment variables
echo "🔧 Processing environment variables..."

# Get essential environment variables
MONGODB_URI=$(grep MONGODB_URI .env.build | cut -d'=' -f2-)
NEXTAUTH_SECRET=$(grep NEXTAUTH_SECRET .env.build | cut -d'=' -f2-)

# Ensure we're logged in and have the correct project set
echo "🔐 Configuring Google Cloud project..."
gcloud config set project $PROJECT_ID

# Build the container image
echo "🏗️ Building container image..."
docker build -t $IMAGE_NAME .

# Push the image to Google Container Registry
echo "⬆️ Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
NEXTAUTH_URL="https://$SERVICE_NAME-$(gcloud config get-value project).a.run.app"

# Deploy with environment variables (excluding PORT as it's set by Cloud Run)
gcloud beta run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,MONGODB_URI=$MONGODB_URI,NEXTAUTH_SECRET=$NEXTAUTH_SECRET,NEXTAUTH_URL=$NEXTAUTH_URL"

echo "✅ Deployment complete!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "🌎 Your service is available at: $SERVICE_URL"
