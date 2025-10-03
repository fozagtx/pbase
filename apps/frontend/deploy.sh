#!/bin/bash

# DigitalProductStore Netlify Deployment Script
echo "🚀 Starting deployment process..."

# Navigate to frontend directory
cd "$(dirname "$0")"

# Build the project
echo "📦 Building the frontend..."
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Netlify using npx
echo "🌐 Deploying to Netlify..."
echo ""

# Use npx to avoid CLI version issues
npx netlify-cli@latest deploy --prod --dir=dist

echo ""
echo "📁 Build output is in: ./dist"
echo ""
echo "If deployment fails, you can also:"
echo "1. Drag and drop the 'dist' folder to: https://app.netlify.com/drop"
echo "2. Or connect your GitHub repo at: https://app.netlify.com/"
