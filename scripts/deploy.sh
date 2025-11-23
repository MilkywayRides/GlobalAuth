#!/bin/bash

# BlazeNeuro Developer Portal - Production Deployment Script

set -e

echo "🚀 Starting BlazeNeuro Developer Portal deployment..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

if [ -z "$BETTER_AUTH_SECRET" ]; then
    echo "❌ ERROR: BETTER_AUTH_SECRET environment variable is not set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

# Generate database schema
echo "📋 Generating database schema..."
npm run db:generate

# Run type checking
echo "🔍 Running type checks..."
npm run type-check

# Run linting
echo "🧹 Running linter..."
npm run lint:check

echo "✅ Deployment completed successfully!"
echo "🌐 Application is ready to start with: npm start"
