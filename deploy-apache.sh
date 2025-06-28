#!/bin/bash

# Script deployment untuk aplikasi pajakapp dengan Apache
# Usage: ./deploy-apache.sh

set -e

echo "🚀 Starting deployment with Apache..."

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

# Test Apache configuration
echo "🔍 Testing Apache configuration..."
sudo apache2ctl configtest

# Restart Apache
echo "🔄 Restarting Apache..."
sudo systemctl restart apache2

# Check status
echo "✅ Checking PM2 status..."
pm2 status

echo "✅ Checking Apache status..."
sudo systemctl status apache2 --no-pager

echo "🎉 Deployment completed successfully!"
echo "📊 Application logs: pm2 logs pajakapp"
echo "🌐 Application URL: http://yourdomain.com"
echo "📋 Apache logs: sudo tail -f /var/log/apache2/pajakapp_error.log" 