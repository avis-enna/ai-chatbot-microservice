#!/bin/bash

# Permanent AI Chatbot Service Starter
# This script starts both the Podman container and Cloudflare tunnel

set -e

echo "🚀 Starting AI Chatbot Permanent Service..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to handle cleanup
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    pkill -f "cloudflared tunnel" || true
    podman stop ai-chatbot || true
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}1. Starting Ollama...${NC}"
ollama serve &
OLLAMA_PID=$!
sleep 3

echo -e "${BLUE}2. Starting Podman container...${NC}"
./deploy-podman.sh

echo -e "${BLUE}3. Starting Cloudflare tunnel...${NC}"
cloudflared tunnel --url http://localhost:3001 > tunnel.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnel to start and get URL
echo -e "${YELLOW}Waiting for tunnel to establish...${NC}"
sleep 10

# Extract URL from log
if [ -f tunnel.log ]; then
    URL=$(grep -o 'https://[^.]*\.trycloudflare\.com' tunnel.log | head -1)
    if [ -n "$URL" ]; then
        echo -e "${GREEN}✅ AI Chatbot is now live at:${NC}"
        echo -e "${GREEN}🌐 Public URL: $URL${NC}"
        echo -e "${GREEN}🔧 Widget: $URL/widget${NC}"
        echo -e "${GREEN}❤️  Health: $URL/health${NC}"
        echo -e "${GREEN}📚 API Docs: $URL/docs${NC}"
    else
        echo -e "${RED}❌ Failed to get tunnel URL${NC}"
    fi
else
    echo -e "${RED}❌ Tunnel log not found${NC}"
fi

echo -e "${BLUE}4. Service Status:${NC}"
echo -e "   ${GREEN}✅ Ollama: Running (PID: $OLLAMA_PID)${NC}"
echo -e "   ${GREEN}✅ Podman: Running${NC}"
echo -e "   ${GREEN}✅ Tunnel: Running (PID: $TUNNEL_PID)${NC}"

echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running
wait $TUNNEL_PID
