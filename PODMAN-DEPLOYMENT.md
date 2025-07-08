# Podman Deployment Guide

## Overview
Since Ollama requires significant resources and Railway doesn't support it, we'll use a hybrid approach:
- **Local**: Ollama running on your machine
- **Cloud**: Backend API deployed to Railway/Render/etc.

## Option 1: Expose Local Ollama to Internet

### Step 1: Make Ollama Accessible Externally
```bash
# Stop Ollama if running
pkill ollama

# Start Ollama with external access
ollama serve --host 0.0.0.0:11434
```

### Step 2: Use a Tunnel Service
```bash
# Install cloudflared (Cloudflare Tunnel - free, no signup)
brew install cloudflared

# Create tunnel to Ollama
cloudflared tunnel --url http://localhost:11434
```

This gives you a public URL like: `https://abc123.trycloudflare.com`

### Step 3: Update Backend for Production
Use the tunnel URL as your Ollama base URL in production.

## Option 2: Local Podman Container with Tunnel

### Step 1: Build with Podman
```bash
# Build the container
podman build -t ai-chatbot .

# Run with environment variables
podman run -d \
  --name ai-chatbot \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e OLLAMA_BASE_URL=http://host.containers.internal:11434 \
  -e CORS_ORIGIN=* \
  ai-chatbot
```

### Step 2: Expose Container to Internet
```bash
# Install cloudflared
brew install cloudflared

# Create tunnel to your container
cloudflared tunnel --url http://localhost:3001
```

## Option 3: Remote Ollama Alternative

### Use OpenAI-Compatible API
Instead of local Ollama, use a cloud service:

1. **Groq** (Fast, free tier): https://groq.com
2. **Together AI**: https://together.ai
3. **Replicate**: https://replicate.com

Update your backend to use OpenAI-compatible endpoints.

## Recommended Approach

For production, I recommend **Option 1** with some modifications:

1. Keep Ollama running locally
2. Use cloudflared to expose it
3. Deploy just the backend to Railway
4. Backend connects to your tunneled Ollama

This gives you:
- ✅ Free deployment
- ✅ Full control over AI model
- ✅ Internet accessibility
- ✅ No vendor lock-in
