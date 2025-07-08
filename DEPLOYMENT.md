# Deployment Guide for AI Chatbot Microservice

## Quick Internet Access Options

### Option 1: Using ngrok (Development/Testing)
1. Install ngrok: `brew install ngrok` (macOS) or download from https://ngrok.com
2. Sign up for free account at https://dashboard.ngrok.com/signup
3. Get your authtoken and run: `ngrok config add-authtoken YOUR_TOKEN`
4. Start your server: `npm run dev`
5. In another terminal: `ngrok http 3001`
6. Copy the https URL (e.g., https://abc123.ngrok.io) and share it

### Option 2: Cloud Deployment (Production)

#### A. Railway (Easiest)
1. Push your code to GitHub
2. Visit https://railway.app and connect your GitHub repo
3. Railway will auto-detect Node.js and deploy
4. Set environment variables in Railway dashboard
5. Your app will be live at: https://yourapp.railway.app

#### B. Vercel (Good for frontend + API)
```bash
npm install -g vercel
vercel login
vercel
```

#### C. Heroku
```bash
npm install -g heroku
heroku login
heroku create your-chatbot-app
git push heroku main
```

#### D. DigitalOcean App Platform
1. Connect your GitHub repo
2. Choose Node.js environment
3. Set environment variables
4. Deploy

### Option 3: VPS/Server Deployment

#### Using Docker (Recommended)
```bash
# Build the image
docker build -t ai-chatbot .

# Run with production environment
docker run -d \
  --name ai-chatbot \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://yourdomain.com \
  -v $(pwd)/data:/app/data \
  ai-chatbot
```

#### Direct deployment on Ubuntu/CentOS
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Deploy your app
git clone your-repo
cd AiProject
npm install
npm run build

# Start with PM2
pm2 start dist/server.js --name "ai-chatbot"
pm2 startup
pm2 save
```

## Required Setup for Internet Access

### 1. Update CORS Origins
Edit `.env.production` and set your domain:
```
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### 2. SSL Certificate (HTTPS)
Most cloud platforms provide SSL automatically. For VPS:
- Use Let's Encrypt with certbot
- Or use Cloudflare for SSL termination

### 3. Environment Variables
Set these in your deployment platform:
- `NODE_ENV=production`
- `JWT_SECRET=your-secure-secret`
- `CORS_ORIGIN=your-domain`
- `OLLAMA_BASE_URL=your-ollama-server`

### 4. Ollama Setup
For cloud deployment, you need Ollama accessible:
- Run Ollama on the same server
- Use a dedicated Ollama instance
- Or use OpenAI API instead (requires code changes)

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **Rate Limiting**: Adjust based on expected traffic
3. **API Keys**: Implement proper user authentication for production
4. **HTTPS**: Always use HTTPS in production
5. **Database**: Consider PostgreSQL for production instead of SQLite

## Monitoring & Maintenance

1. **Health Checks**: Use `/health` endpoint
2. **Logs**: Monitor application logs
3. **Database Backups**: Regular SQLite backups
4. **Updates**: Keep dependencies updated

## Testing Your Deployment

1. Health check: `curl https://yourdomain.com/health`
2. Widget: Visit `https://yourdomain.com/widget`
3. API: Test chat endpoints with valid API key

Choose the option that best fits your needs:
- **Development/Testing**: ngrok
- **Quick deployment**: Railway or Vercel
- **Full control**: VPS with Docker
