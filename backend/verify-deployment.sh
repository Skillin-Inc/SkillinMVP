#!/bin/bash

# Deployment Verification Script
# Run this on your EC2 instance after deployment

set -e

APP_DIR="/var/www/skillin"
cd "$APP_DIR"

echo "=== Deployment Verification ==="
echo "Current directory: $(pwd)"
echo ""

echo "1. Checking application files..."
ls -la
echo ""

echo "2. Checking if dist/ folder exists..."
if [ -d "dist" ]; then
    echo "✓ dist/ folder found"
    ls -la dist/
else
    echo "✗ dist/ folder missing!"
    exit 1
fi
echo ""

echo "3. Checking package.json..."
if [ -f "package.json" ]; then
    echo "✓ package.json found"
    echo "Dependencies:"
    npm list --depth=0
else
    echo "✗ package.json missing!"
    exit 1
fi
echo ""

echo "4. Checking environment configuration..."
if [ -f ".env" ]; then
    echo "✓ .env file found"
    echo "Environment variables:"
    grep -v '^#' .env | grep -v '^$' || echo "No environment variables set"
else
    echo "⚠ .env file missing - using env.production.example"
    if [ -f "env.production.example" ]; then
        echo "✓ env.production.example found"
    else
        echo "✗ No environment configuration found!"
    fi
fi
echo ""

echo "5. Checking PM2 status..."
if command -v pm2 >/dev/null 2>&1; then
    echo "✓ PM2 installed"
    pm2 status
else
    echo "✗ PM2 not installed"
fi
echo ""

echo "6. Checking if service is running..."
if curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1; then
    echo "✓ Service is responding on port 3000"
    curl -s http://127.0.0.1:3000/health | jq . || curl -s http://127.0.0.1:3000/health
else
    echo "✗ Service not responding on port 3000"
    echo "Check PM2 logs: pm2 logs skillin"
fi
echo ""

echo "=== Verification Complete ==="
