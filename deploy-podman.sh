#!/bin/bash

# Podman deployment script for AI Chatbot
set -e

echo "🚀 Starting Podman deployment..."

# Configuration
CONTAINER_NAME="ai-chatbot"
IMAGE_NAME="ai-chatbot:latest"
PORT=3001

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stop and remove existing container
echo -e "${YELLOW}Stopping existing container...${NC}"
podman stop $CONTAINER_NAME 2>/dev/null || true
podman rm $CONTAINER_NAME 2>/dev/null || true

# Build the image
echo -e "${YELLOW}Building container image...${NC}"
podman build -t $IMAGE_NAME -f Containerfile .

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Creating .env.production file...${NC}"
    cat > .env.production << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
JWT_SECRET=$(openssl rand -base64 32)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
CORS_ORIGIN=*
DATABASE_PATH=/app/data/chatbot.db
EOF
fi

# Run the container
echo -e "${YELLOW}Starting container...${NC}"
podman run -d \
    --name $CONTAINER_NAME \
    -p $PORT:$PORT \
    --env-file .env.production \
    -v ./data:/app/data:Z \
    --network host \
    $IMAGE_NAME

# Wait for container to start
echo -e "${YELLOW}Waiting for container to start...${NC}"
sleep 5

# Check if container is running
if podman ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✅ Container started successfully!${NC}"
    echo -e "${GREEN}🌐 App is running at: http://localhost:$PORT${NC}"
    echo -e "${GREEN}🔧 Widget demo: http://localhost:$PORT/widget${NC}"
    echo -e "${GREEN}📚 API docs: http://localhost:$PORT/docs${NC}"
    echo -e "${GREEN}❤️  Health check: http://localhost:$PORT/health${NC}"
    echo ""
    echo -e "${YELLOW}To expose to internet, run:${NC}"
    echo "brew install cloudflared"
    echo "cloudflared tunnel --url http://localhost:$PORT"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    echo "Checking logs..."
    podman logs $CONTAINER_NAME
    exit 1
fi

# Show logs
echo -e "${YELLOW}Container logs:${NC}"
podman logs --tail 10 $CONTAINER_NAME
