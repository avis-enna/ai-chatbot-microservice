# 🚀 Quick Internet Deployment Guide

## Option 1: Local Ollama + Cloud Backend (Recommended)

### Step 1: Expose Ollama to Internet
```bash
# Run the exposure script
./expose-ollama.sh
```

This will:
- Start Ollama with external access
- Install cloudflared if needed
- Create a tunnel and give you a public URL like: `https://abc123.trycloudflare.com`

### Step 2: Deploy Backend to Railway
1. **Create .env.production with your tunnel URL:**
```bash
NODE_ENV=production
OLLAMA_BASE_URL=https://abc123.trycloudflare.com  # Your tunnel URL
JWT_SECRET=your-secure-secret-key
CORS_ORIGIN=*
```

2. **Push to GitHub:**
```bash
git add .
git commit -m "Add production config"
git push origin main
```

3. **Deploy to Railway:**
- Go to https://railway.app
- Connect GitHub repo
- Add environment variables from .env.production
- Deploy!

## Option 2: Full Local Deployment with Podman

### Step 1: Deploy Locally with Podman
```bash
# Build and run with Podman
./deploy-podman.sh
```

### Step 2: Expose to Internet
```bash
# In another terminal, expose the web app
cloudflared tunnel --url http://localhost:3001
```

## Option 3: Quick Test (No Deployment)

### Just expose your current development server:
```bash
# In terminal 1: Start dev server
npm run dev

# In terminal 2: Expose to internet
cloudflared tunnel --url http://localhost:3001
```

## 🌐 Access Your Chatbot

Once deployed, you'll get URLs like:
- **Widget:** `https://your-url.com/widget`
- **API:** `https://your-url.com/api/docs` 
- **Health:** `https://your-url.com/health`

## 💡 Tips

1. **Keep tunnels running:** The cloudflared tunnels need to stay open
2. **Free limits:** Cloudflare tunnels are free but may have usage limits
3. **Production:** For production, consider paid hosting like Railway Pro, DigitalOcean, or AWS
4. **Security:** In production, set specific CORS origins instead of `*`

## 🔧 Troubleshooting

### Ollama Connection Issues:
```bash
# Check if Ollama is accessible
curl http://localhost:11434/api/tags

# Check if tunnel is working
curl https://your-tunnel-url.trycloudflare.com/api/tags
```

### Container Issues:
```bash
# Check container logs
podman logs ai-chatbot

# Restart container
podman restart ai-chatbot
```
