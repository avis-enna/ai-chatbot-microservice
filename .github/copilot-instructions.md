<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Chatbot Microservice - Copilot Instructions

This is a Node.js TypeScript microservice that provides AI-powered chat capabilities using Ollama for local LLM inference.

## Project Context

This microservice is designed to be:
- **Production-ready** with proper error handling, logging, and security
- **Scalable** with rate limiting and database persistence
- **Secure** with authentication, input validation, and CORS protection
- **Embeddable** as a widget in other websites
- **Real-time** with WebSocket support

## Architecture

- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite3 for persistence
- **AI Integration**: Ollama HTTP API for local LLM inference
- **Security**: Helmet, CORS, rate limiting, input validation
- **Real-time**: Socket.io for WebSocket communication
- **Containerization**: Docker/Podman ready

## Key Components

### Services
- `OllamaService`: Handles AI model interactions and response generation
- `DatabaseService`: Manages SQLite database operations and persistence
- `Logger`: Winston-based structured logging

### API Routes
- `/api/chat/*`: Chat-related endpoints (messages, sessions, history)
- `/api/users/*`: User management and authentication
- `/widget`: Embeddable chat widget

### Middleware
- Authentication with API keys
- Request validation using Joi schemas
- Rate limiting per user/IP
- Input sanitization and security headers

## Coding Standards

1. **TypeScript**: Use strict typing with proper interfaces
2. **Error Handling**: Always use try-catch blocks and proper error responses
3. **Logging**: Use the Winston logger for all important events
4. **Validation**: Validate all inputs using Joi schemas
5. **Security**: Sanitize inputs and use security middleware
6. **Async/Await**: Use async/await instead of promises where possible
7. **RESTful API**: Follow REST conventions for API design

## Common Patterns

### API Response Format
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  timestamp: Date;
}
```

### Error Handling
```typescript
try {
  // operation
} catch (error) {
  logger.error('Operation failed:', error);
  res.status(500).json({
    success: false,
    error: 'Operation failed',
    message: 'User-friendly error message'
  });
}
```

### Database Operations
Always use transactions for multi-step operations and handle SQLite-specific patterns.

### AI Integration
Use the OllamaService for all AI operations, handle streaming responses when needed, and implement fallback responses for errors.

## Development Guidelines

- Follow the existing project structure
- Use the established middleware patterns
- Implement proper error boundaries
- Add comprehensive logging
- Write self-documenting code with clear variable names
- Use TypeScript interfaces for all data structures
- Implement proper input validation for all endpoints
- Follow security best practices for API development

## Testing Considerations

When suggesting tests:
- Use Jest for unit testing
- Test API endpoints with supertest
- Mock external dependencies (Ollama, database)
- Test error scenarios and edge cases
- Include integration tests for critical paths

## Deployment

The service is designed for:
- Local development with hot reload
- Container deployment with Docker/Podman
- Production deployment with proper environment configuration
- Integration as a microservice in larger applications
