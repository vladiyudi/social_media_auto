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
NEXTAUTH_URL="https://$SERVICE_NAME-95928265990.us-central1.run.app"
GOOGLE_ID=$(grep GOOGLE_ID .env.build | cut -d'=' -f2-)
GOOGLE_SECRET=$(grep GOOGLE_SECRET .env.build | cut -d'=' -f2-)
CLAUDE_API_KEY=$(grep CLAUDE_API_KEY .env.build | cut -d'=' -f2-)
FAL_AI_KEY=$(grep FAL_AI_KEY .env.build | cut -d'=' -f2-)

# Ensure we're logged in and have the correct project set
echo "🔐 Configuring Google Cloud project..."
gcloud config set project $PROJECT_ID

# Add environment variables to temporary env file
echo "Creating temporary env file..."
cp .env.build .env.temp

# Add Google Cloud configuration
echo "GOOGLE_CLOUD_PROJECT_ID=poetic-analog-442510-e8" >> .env.temp
echo "GOOGLE_CLOUD_BUCKET_NAME=knbl-sma" >> .env.temp
echo "GOOGLE_CLOUD_CLIENT_EMAIL=knbl-sma@poetic-analog-442510-e8.iam.gserviceaccount.com" >> .env.temp

# Build the container image
echo "🏗️ Building container image..."
docker build -t $IMAGE_NAME .

# Push the image to Container Registry
echo "⬆️ Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --service-account="knbl-sma@poetic-analog-442510-e8.iam.gserviceaccount.com" \
  --set-env-vars="MONGODB_URI=$MONGODB_URI" \
  --set-env-vars="NEXTAUTH_SECRET=$NEXTAUTH_SECRET" \
  --set-env-vars="NEXTAUTH_URL=$NEXTAUTH_URL" \
  --set-env-vars="GOOGLE_ID=$GOOGLE_ID" \
  --set-env-vars="GOOGLE_SECRET=$GOOGLE_SECRET" \
  --set-env-vars="CLAUDE_API_KEY=$CLAUDE_API_KEY" \
  --set-env-vars="FAL_AI_KEY=$FAL_AI_KEY" \
  --set-env-vars="NODE_OPTIONS=--openssl-legacy-provider" \
  --set-env-vars="GOOGLE_APPLICATION_CREDENTIALS=/app/google-credentials.json"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "✅ Deployment complete!"
echo "🌎 Your service is available at: $SERVICE_URL"

# Cleanup
rm .env.temp
