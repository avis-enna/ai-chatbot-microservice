# AI Chatbot Microservice

A powerful, production-ready AI chatbot microservice built with Node.js, TypeScript, and Ollama integration. This service provides a comprehensive API for AI-powered conversations with built-in security, rate limiting, and database persistence.

## 🚀 Features

### Core Capabilities
- **AI-Powered Conversations**: Integration with Ollama for local LLM inference
- **RESTful API**: Clean, well-documented API endpoints
- **WebSocket Support**: Real-time chat capabilities
- **Embeddable Widget**: Easy integration into any website
- **Session Management**: Persistent conversation history
- **User Management**: Registration and authentication system

### Security & Performance
- **Rate Limiting**: Configurable rate limits per IP and user
- **Input Validation**: Comprehensive request validation and sanitization
- **Authentication**: API key-based authentication system
- **CORS Support**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for enhanced security
- **Error Handling**: Comprehensive error handling and logging

### Data & Analytics
- **SQLite Database**: Lightweight, embedded database for persistence
- **Conversation Analytics**: Track usage patterns and popular questions
- **Health Monitoring**: Service health checks and monitoring
- **Structured Logging**: Winston-based logging system

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **Database**: SQLite3
- **AI Integration**: Ollama HTTP API
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Container**: Docker/Podman

## 📦 Quick Start

### Prerequisites
- Node.js 18 or higher
- Ollama installed and running locally
- Podman or Docker (for containerization)

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Ollama**
   ```bash
   # Make sure Ollama is running
   ollama serve
   
   # Pull a model (if not already available)
   ollama pull llama3.2
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Test the Service**
   ```bash
   # Health check
   curl http://localhost:3001/health
   
   # Register a user
   curl -X POST http://localhost:3001/api/users/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "name": "Test User"}'
   
   # Send a message (use the API key from registration response)
   curl -X POST http://localhost:3001/api/chat/message \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-api-key" \
     -d '{"message": "Tell me about your experience"}'
   ```

### Production Deployment with Podman

1. **Build the Container**
   ```bash
   npm run docker:build
   ```

2. **Run with Podman**
   ```bash
   npm run docker:run
   ```

3. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `HOST` | Server host | `0.0.0.0` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3000` |
| `OLLAMA_BASE_URL` | Ollama API URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Default model | `llama3.2` |
| `JWT_SECRET` | JWT secret key | Required in production |
| `DATABASE_PATH` | SQLite database path | `./data/chatbot.db` |

### Customize Your AI Assistant

Edit `src/knowledge-base/data.ts` to customize the AI's knowledge about your background, skills, and experience:

```typescript
export const knowledgeBase: KnowledgeBase = {
  personalInfo: {
    name: "Your Name",
    title: "Your Professional Title",
    email: "your.email@example.com",
    // ... add your information
  },
  experience: [
    {
      company: "Your Company",
      position: "Your Position",
      duration: "2022 - Present",
      // ... add your experience
    }
  ],
  skills: {
    technical: ["JavaScript", "Python", "AI/ML", "..."],
    // ... add your skills
  },
  // ... add projects, education, etc.
};
```

## 📚 API Documentation

### Authentication
Most endpoints require an API key:
```
Authorization: Bearer your-api-key
```

### Core Endpoints

#### Chat Endpoints
- `POST /api/chat/message` - Send a message to the AI
- `GET /api/chat/history/:sessionId` - Get chat history
- `GET /api/chat/session/:sessionId` - Get session information
- `POST /api/chat/session` - Create a new session
- `GET /api/chat/models` - Get available models
- `GET /api/chat/health` - Chat service health check

#### User Management
- `POST /api/users/register` - Register a new user
- `GET /api/users/profile` - Get user profile (requires auth)
- `GET /api/users/analytics` - Get usage analytics (requires auth)

#### Utility Endpoints
- `GET /health` - Service health check
- `GET /docs` - API documentation
- `GET /widget` - Embeddable chat widget

### Example API Usage

#### Send a Message
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "message": "Tell me about your experience with AI",
    "sessionId": "optional-session-id"
  }'
```

#### Register a User
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

## 🔌 Integration Examples

### HTML Widget Integration
```html
<iframe 
  src="http://localhost:3001/widget?apiKey=your-api-key"
  width="400" 
  height="600"
  frameborder="0">
</iframe>
```

### JavaScript Integration
```javascript
// Send a message to the AI
const response = await fetch('http://localhost:3001/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    message: 'Hello, tell me about your skills',
    sessionId: 'my-session-123'
  })
});

const data = await response.json();
console.log(data.data.response);
```

### React Component Example
```jsx
import React, { useState } from 'react';

const ChatWidget = ({ apiKey }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:3001/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      const aiMessage = { text: data.data.response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setInput('');
  };

  return (
    <div className="chat-widget">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
```

## 📊 Monitoring & Analytics

### Health Checks
```bash
curl http://localhost:3001/health
```

### Usage Analytics
```bash
curl -H "Authorization: Bearer your-api-key" \
  "http://localhost:3001/api/users/analytics?timeRange=week"
```

## 🐛 Troubleshooting

### Common Issues

1. **Ollama Connection Failed**
   - Ensure Ollama is running: `ollama serve`
   - Check the `OLLAMA_BASE_URL` configuration
   - Verify the model is available: `ollama list`

2. **Database Errors**
   - Ensure the data directory exists and is writable
   - Check database path in configuration

3. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Kill existing processes: `lsof -ti:3001 | xargs kill`

### Debug Mode
Set `LOG_LEVEL=debug` in your `.env` file for detailed logging.

## 📋 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

### Project Structure
```
src/
├── api/              # API routes
├── middleware/       # Express middleware
├── services/         # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── knowledge-base/  # AI knowledge and prompts
└── server.ts        # Main server file
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production with Podman
```bash
# Build image
podman build -t ai-chatbot-microservice .

# Run container
podman run -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -e NODE_ENV=production \
  ai-chatbot-microservice
```

### Docker Compose
```bash
docker-compose up -d
```

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for showcasing AI development skills**

This microservice demonstrates:
- Modern Node.js/TypeScript development
- AI integration with Ollama
- Production-ready architecture
- Security best practices
- Comprehensive API design
- Container deployment
- Real-time capabilities
- Database integration
- Monitoring and analytics
