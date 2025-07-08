#!/bin/bash

# Auto-update script for permanent tunnel URL
# This script maintains a persistent tunnel and updates your portfolio

set -e

PROJECT_DIR="/Users/ssivared/MyResume/AiProject"
TUNNEL_URL_FILE="$PROJECT_DIR/current_tunnel_url.txt"
PORTFOLIO_CONFIG_FILE="/Users/ssivared/MyResume/chatbot-config.js"

cd "$PROJECT_DIR"

echo "🚀 Starting permanent tunnel service..."

# Function to start tunnel and extract URL
start_tunnel() {
    echo "Starting new tunnel..."
    
    # Kill any existing tunnels
    pkill -f "cloudflared tunnel" 2>/dev/null || true
    
    # Start new tunnel and capture output
    cloudflared tunnel --url http://localhost:3001 > /tmp/tunnel_output.log 2>&1 &
    TUNNEL_PID=$!
    
    # Wait for tunnel to start and get URL
    echo "Waiting for tunnel to establish..."
    for i in {1..30}; do
        if grep -q "https://.*\.trycloudflare\.com" /tmp/tunnel_output.log; then
            TUNNEL_URL=$(grep -o "https://[^[:space:]]*\.trycloudflare\.com" /tmp/tunnel_output.log | head -1)
            echo "✅ Tunnel established: $TUNNEL_URL"
            echo "$TUNNEL_URL" > "$TUNNEL_URL_FILE"
            return 0
        fi
        sleep 2
    done
    
    echo "❌ Failed to establish tunnel"
    return 1
}

# Function to update portfolio config
update_portfolio() {
    local url=$1
    echo "📝 Updating portfolio configuration..."
    
    # Create or update the chatbot config file
    cat > "$PORTFOLIO_CONFIG_FILE" << EOF
// Auto-generated chatbot configuration
// Last updated: $(date)

export const CHATBOT_CONFIG = {
  apiUrl: '$url',
  widgetUrl: '$url/widget',
  isEnabled: true,
  lastUpdated: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")'
};

// For direct usage in HTML
window.CHATBOT_CONFIG = {
  apiUrl: '$url',
  widgetUrl: '$url/widget',
  isEnabled: true,
  lastUpdated: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")'
};
EOF
    
    echo "✅ Portfolio configuration updated"
}

# Function to monitor tunnel and restart if needed
monitor_tunnel() {
    while true; do
        if ! pgrep -f "cloudflared tunnel" > /dev/null; then
            echo "⚠️ Tunnel died, restarting..."
            start_tunnel
            if [ $? -eq 0 ]; then
                update_portfolio "$(cat $TUNNEL_URL_FILE)"
            fi
        fi
        sleep 30
    done
}

# Main execution
echo "🔧 Setting up permanent tunnel service..."

# Start tunnel
start_tunnel
if [ $? -eq 0 ]; then
    CURRENT_URL=$(cat "$TUNNEL_URL_FILE")
    update_portfolio "$CURRENT_URL"
    
    echo ""
    echo "🎉 Permanent tunnel service is running!"
    echo "📍 Current URL: $CURRENT_URL"
    echo "🔧 Config file: $PORTFOLIO_CONFIG_FILE"
    echo "📝 URL file: $TUNNEL_URL_FILE"
    echo ""
    echo "💡 To use in your portfolio:"
    echo "   1. Include the config file: <script src='./chatbot-config.js'></script>"
    echo "   2. Use: window.CHATBOT_CONFIG.apiUrl"
    echo "   3. Widget: window.CHATBOT_CONFIG.widgetUrl"
    echo ""
    echo "🔄 Monitoring tunnel (press Ctrl+C to stop)..."
    
    # Start monitoring
    monitor_tunnel
else
    echo "❌ Failed to start tunnel service"
    exit 1
fi
