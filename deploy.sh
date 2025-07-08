#!/bin/bash

# Quick deployment script for AI Chatbot
# This script helps deploy to various cloud platforms

echo "🚀 AI Chatbot Deployment Helper"
echo "================================"

# Check if git repo is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Commit them first for proper deployment."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 Choose your deployment option:"
echo "1) Railway (recommended for beginners)"
echo "2) Vercel"
echo "3) Docker build only"
echo "4) Create .env.production template"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚂 Deploying to Railway..."
        echo "1. Push your code to GitHub if you haven't already"
        echo "2. Visit https://railway.app and connect your GitHub repo"
        echo "3. Set these environment variables in Railway dashboard:"
        echo "   - NODE_ENV=production"
        echo "   - JWT_SECRET=$(openssl rand -base64 32)"
        echo "   - CORS_ORIGIN=https://your-domain.railway.app"
        echo "4. Deploy!"
        ;;
    2)
        echo "▲ Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel
        else
            echo "Installing Vercel CLI..."
            npm install -g vercel
            vercel
        fi
        ;;
    3)
        echo "🐳 Building Docker image..."
        docker build -t ai-chatbot .
        echo "✅ Docker image built! Run with:"
        echo "docker run -p 3001:3001 -e NODE_ENV=production ai-chatbot"
        ;;
    4)
        echo "📝 Creating .env.production template..."
        if [ ! -f .env.production ]; then
            cp .env.production.example .env.production 2>/dev/null || echo "Template already exists"
        fi
        echo "✅ Edit .env.production with your production values"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo "🔗 Test your deployment health: https://your-domain.com/health"
echo "🤖 Access the widget: https://your-domain.com/widget"
