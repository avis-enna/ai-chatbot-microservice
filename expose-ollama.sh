#!/bin/bash

# Script to expose local Ollama to the internet
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Ollama Internet Exposure Setup${NC}"
echo ""

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo -e "${YELLOW}⚠️  Ollama is not running. Starting Ollama...${NC}"
    
    # Kill any existing Ollama processes
    pkill ollama 2>/dev/null || true
    sleep 2
    
    # Start Ollama with external access
    echo -e "${YELLOW}Starting Ollama with external access...${NC}"
    ollama serve --host 0.0.0.0:11434 &
    
    # Wait for Ollama to start
    sleep 5
    
    # Check if Ollama started successfully
    if ! curl -s http://localhost:11434/api/tags >/dev/null; then
        echo -e "${RED}❌ Failed to start Ollama${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Ollama started successfully${NC}"
else
    echo -e "${GREEN}✅ Ollama is already running${NC}"
fi

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo -e "${YELLOW}⚠️  cloudflared not found. Installing...${NC}"
    
    if command -v brew &> /dev/null; then
        brew install cloudflared
    elif command -v apt-get &> /dev/null; then
        # For Ubuntu/Debian
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
    else
        echo -e "${RED}❌ Please install cloudflared manually from: https://github.com/cloudflare/cloudflared/releases${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ cloudflared is available${NC}"
echo ""

# Start the tunnel
echo -e "${YELLOW}🌐 Creating tunnel to Ollama...${NC}"
echo -e "${BLUE}This will give you a public URL to access your Ollama instance${NC}"
echo -e "${BLUE}Keep this terminal open to maintain the tunnel${NC}"
echo ""

# Create tunnel
cloudflared tunnel --url http://localhost:11434
