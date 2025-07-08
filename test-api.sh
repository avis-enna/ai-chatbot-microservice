#!/bin/bash

# AI Chatbot Microservice Test Script
echo "🚀 Testing AI Chatbot Microservice"
echo "=================================="

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:3001/health | jq .
echo ""

# Test user registration
echo "2. Testing user registration..."
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com", "name": "Test User"}')
echo $USER_RESPONSE | jq .
echo ""

# Extract API key
API_KEY=$(echo $USER_RESPONSE | jq -r '.data.apiKey')
echo "Generated API Key: $API_KEY"
echo ""

# Test chat models
echo "3. Testing available models..."
curl -s http://localhost:3001/api/chat/models | jq .
echo ""

# Test chat message
echo "4. Testing chat message..."
curl -s -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"message": "What programming languages do you know?", "model": "llama3:latest"}' | jq .
echo ""

# Test widget endpoint
echo "5. Testing widget endpoint..."
curl -s http://localhost:3001/widget | head -n 10
echo ""

echo "✅ All tests completed!"
echo ""
echo "🔗 Useful URLs:"
echo "   - Health: http://localhost:3001/health"
echo "   - API Docs: http://localhost:3001/docs"
echo "   - Widget: http://localhost:3001/widget"
echo "   - Chat API: http://localhost:3001/api/chat/message"
echo ""
echo "🔑 Your API Key: $API_KEY"
