#!/bin/bash

echo "🚀 BlazeNeuro Developer Portal - Production Deployment"
echo "=================================================="

# Check if required environment variables are set
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with production environment variables"
    exit 1
fi

# Load production environment
export NODE_ENV=production
source .env.production

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Run database migrations (non-interactive)
echo "🗄️  Running database migrations..."
npm run db:migrate:prod

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed!"
    exit 1
fi

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t blazeneuro-dev-portal:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Deploy with Docker Compose
echo "🚀 Deploying with Docker Compose..."
docker-compose -f docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Deployment successful!"
echo ""
echo "🌐 Application is running at:"
echo "   HTTP:  http://localhost"
echo "   HTTPS: https://localhost"
echo ""
echo "📊 Monitor logs with:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Stop deployment with:"
echo "   docker-compose -f docker-compose.prod.yml down"
