#!/bin/bash

# Cloud Run Deployment Script for Inventory Management System

set -e

# Configuration
PROJECT_ID="your-gcp-project-id"
REGION="asia-south1"
SERVICE_NAME="inventory-api"
FRONTEND_SERVICE_NAME="inventory-frontend"

echo "🚀 Starting deployment to Cloud Run..."

# Deploy Backend API
echo "📦 Building and deploying backend API..."
cd Backend

# Build and push container
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "JWT_SECRET_KEY=your-production-jwt-secret" \
  --set-env-vars "CORS_ORIGINS=https://your-frontend-domain.com"

cd ..

# Deploy Frontend
echo "🌐 Building and deploying frontend..."
cd inventory-frontend

# Build and push container
gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy $FRONTEND_SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5

cd ..

echo "✅ Deployment completed!"
echo "Backend URL: https://$SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app"
echo "Frontend URL: https://$FRONTEND_SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app"
