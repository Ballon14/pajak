#!/bin/bash

# Script deployment untuk aplikasi pajakapp
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Navigate to app directory
cd /var/www/pajakapp

# Pull latest changes (jika menggunakan git)
# git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build application
echo "🏗️ Building application..."
npm run build

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart pajakapp

# Check status
echo "✅ Checking PM2 status..."
pm2 status

echo "🎉 Deployment completed successfully!"
echo "📊 Application logs: pm2 logs pajakapp"
echo "🌐 Application URL: http://yourdomain.com" 