import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './utils/config.js';
import { logger } from './utils/logger.js';
import { createDatabaseService } from './services/database.js';
import { createOllamaService } from './services/ollama.js';
import { createChatRouter } from './api/chat.js';
import { createUserRouter } from './api/users.js';
import { requestLogger, errorHandler, notFoundHandler } from './middleware/auth.js';

class ChatbotServer {
  private app: express.Application;
  private server: any;
  private io: Server;
  private db: any;
  private ollamaService: any;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
  }

  async initialize(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();

      // Initialize database
      this.db = createDatabaseService();
      await this.db.initialize();

      // Initialize Ollama service
      this.ollamaService = createOllamaService(config.ollama);

      // Check Ollama connection
      const isOllamaHealthy = await this.ollamaService.isHealthy();
      if (!isOllamaHealthy) {
        logger.warn('Ollama service is not available. Some features may not work properly.');
      } else {
        logger.info('Ollama service is healthy');
      }

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup WebSocket
      this.setupWebSocket();

      // Setup error handling
      this.setupErrorHandling();

      logger.info('Server initialization completed');
    } catch (error) {
      logger.error('Failed to initialize server:', error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false // Disable CSP for testing
    }));

    // CORS
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key']
    }));

    // Rate limiting
    this.app.use(rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: {
        success: false,
        error: 'Too many requests',
        message: config.rateLimit.message
      },
      standardHeaders: config.rateLimit.standardHeaders,
      legacyHeaders: config.rateLimit.legacyHeaders
    }));

    // Custom rate limiting by user
    // this.app.use('/api/chat', rateLimitByUser(60000, 30)); // 30 requests per minute per user

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Trust proxy if behind reverse proxy
    if (config.environment === 'production') {
      this.app.set('trust proxy', 1);
    }
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: config.environment,
          version: '1.0.0'
        }
      });
    });

    // API routes
    this.app.use('/api/chat', createChatRouter(this.ollamaService, this.db));
    this.app.use('/api/users', createUserRouter(this.db));

    // Widget endpoint for embedding
    this.app.get('/widget', (req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>AI Chatbot Widget</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .widget { max-width: 400px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .chat-container { border: 1px solid #e1e5e9; border-radius: 12px; height: 600px; display: flex; flex-direction: column; background: white; }
            .chat-header { background: #007bff; color: white; padding: 15px 20px; border-radius: 12px 12px 0 0; text-align: center; font-weight: bold; }
            .messages { flex: 1; overflow-y: auto; padding: 20px; background: #f8f9fa; }
            .input-container { padding: 15px 20px; border-top: 1px solid #e1e5e9; background: white; border-radius: 0 0 12px 12px; }
            .input-form { display: flex; gap: 10px; align-items: center; }
            .input-form input { flex: 1; padding: 12px 15px; border: 1px solid #e1e5e9; border-radius: 25px; font-size: 14px; outline: none; }
            .input-form input:focus { border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,0.25); }
            .send-button { background: #007bff; color: white; border: none; padding: 12px 20px; border-radius: 25px; cursor: pointer; font-size: 14px; font-weight: bold; transition: background 0.2s; }
            .send-button:hover { background: #0056b3; }
            .send-button:disabled { background: #ccc; cursor: not-allowed; }
            .message { margin-bottom: 15px; animation: fadeIn 0.3s ease-in; }
            .message.user { text-align: right; }
            .message.ai { text-align: left; }
            .message-content { display: inline-block; padding: 12px 16px; border-radius: 18px; max-width: 85%; word-wrap: break-word; }
            .user .message-content { background: #007bff; color: white; }
            .ai .message-content { background: white; color: #333; border: 1px solid #e1e5e9; }
            .typing-indicator { display: none; text-align: left; margin-bottom: 15px; }
            .typing-indicator .message-content { background: #e9ecef; color: #666; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .empty-state { text-align: center; color: #666; padding: 40px 20px; }
            .suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
            .suggestion-button { background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 15px; padding: 6px 12px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
            .suggestion-button:hover { background: #e9ecef; border-color: #007bff; }
          </style>
        </head>
        <body>
          <div class="widget">
            <div class="chat-container">
              <div class="chat-header">
                AI Assistant - Ask me anything!
              </div>
              <div class="messages" id="messages">
                <div class="empty-state">
                  <p>👋 Hi! I'm an AI assistant that can tell you all about my background, skills, and experience.</p>
                  <p>Feel free to ask me anything!</p>
                  <div class="suggestions">
                    <button class="suggestion-button" data-suggestion="Tell me about your experience">Your Experience</button>
                    <button class="suggestion-button" data-suggestion="What are your technical skills?">Technical Skills</button>
                    <button class="suggestion-button" data-suggestion="Show me your projects">Projects</button>
                    <button class="suggestion-button" data-suggestion="What is your background?">Background</button>
                  </div>
                </div>
              </div>
              <div class="input-container">
                <div class="input-form">
                  <input type="text" id="messageInput" placeholder="Ask me anything about my background and experience..." />
                  <button class="send-button" id="sendButton">Send</button>
                </div>
              </div>
              <div class="typing-indicator" id="typingIndicator">
                <div class="message ai">
                  <div class="message-content">AI is typing...</div>
                </div>
              </div>
            </div>
          </div>
          <script>
            console.log('Widget script starting...');
            
            // Ensure DOM is loaded
            document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM loaded, initializing widget...');
                initializeWidget();
            });
            
            // Also try immediate initialization in case DOM is already loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeWidget);
            } else {
                initializeWidget();
            }
            
            function initializeWidget() {
                console.log('Initializing widget...');
                
                const apiKey = '${req.query.apiKey || 'ak_1751948233952_l9tap319gfn'}';
                console.log('API Key loaded:', apiKey);
                
                const messagesContainer = document.getElementById('messages');
                const messageInput = document.getElementById('messageInput');
                const sendButton = document.getElementById('sendButton');
                const typingIndicator = document.getElementById('typingIndicator');
                let sessionId = 'widget_' + Date.now();
                let isLoading = false;
                
                console.log('Elements found:', {
                  messagesContainer: !!messagesContainer,
                  messageInput: !!messageInput,
                  sendButton: !!sendButton,
                  typingIndicator: !!typingIndicator
                });
                
                if (!messagesContainer || !messageInput || !sendButton) {
                    console.error('Required elements not found!');
                    return;
                }
                
                function addMessage(content, isUser = false) {
                  console.log('Adding message:', content, 'isUser:', isUser);
                  // Hide empty state on first message
                  const emptyState = messagesContainer.querySelector('.empty-state');
                  if (emptyState) {
                    emptyState.style.display = 'none';
                  }
                  
                  const messageDiv = document.createElement('div');
                  messageDiv.className = 'message ' + (isUser ? 'user' : 'ai');
                  messageDiv.innerHTML = '<div class="message-content">' + content + '</div>';
                  messagesContainer.appendChild(messageDiv);
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
                
                function showTyping() {
                  if (typingIndicator) {
                    typingIndicator.style.display = 'block';
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                  }
                }
                
                function hideTyping() {
                  if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                  }
                }
                
                function setLoading(loading) {
                  isLoading = loading;
                  messageInput.disabled = loading;
                  sendButton.disabled = loading;
                  sendButton.textContent = loading ? 'Sending...' : 'Send';
                }
                
                async function sendMessage(message) {
                  const messageText = message || messageInput.value.trim();
                  if (!messageText || isLoading) {
                    console.log('Message empty or already loading:', { messageText, isLoading });
                    return;
                  }
                  
                  console.log('Sending message:', messageText);
                  
                  addMessage(messageText, true);
                  messageInput.value = '';
                  setLoading(true);
                  showTyping();
                  
                  try {
                    console.log('Making fetch request...');
                    const response = await fetch('/api/chat/message', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': apiKey
                      },
                      body: JSON.stringify({
                        message: messageText,
                        sessionId: sessionId
                      })
                    });
                    
                    console.log('Response status:', response.status);
                    
                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error('Response not ok:', response.status, errorText);
                      throw new Error('HTTP error! status: ' + response.status + ', message: ' + errorText);
                    }
                    
                    const data = await response.json();
                    console.log('Response data:', data);
                    
                    hideTyping();
                    
                    if (data.success) {
                      addMessage(data.data.response);
                    } else {
                      console.error('API returned error:', data);
                      addMessage('Sorry, I encountered an error: ' + (data.error || 'Unknown error'));
                    }
                  } catch (error) {
                    hideTyping();
                    console.error('Error sending message:', error);
                    addMessage('Sorry, I encountered an error. Please try again. Error: ' + error.message);
                  }
                  
                  setLoading(false);
                  messageInput.focus();
                }
                
                // Event listeners
                sendButton.addEventListener('click', function(e) {
                    console.log('Send button clicked');
                    e.preventDefault();
                    sendMessage();
                });
                
                messageInput.addEventListener('keypress', function(e) {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    console.log('Enter key pressed');
                    e.preventDefault();
                    sendMessage();
                  }
                });
                
                // Add event listeners for suggestion buttons
                const suggestionButtons = document.querySelectorAll('.suggestion-button');
                console.log('Found suggestion buttons:', suggestionButtons.length);
                suggestionButtons.forEach(function(button) {
                  button.addEventListener('click', function() {
                    const suggestion = button.getAttribute('data-suggestion');
                    console.log('Suggestion clicked:', suggestion);
                    sendMessage(suggestion);
                  });
                });
                
                // Focus input on load
                messageInput.focus();
                console.log('Widget initialized successfully');
            }
          </script>
        </body>
        </html>
      `);
    });

    // API documentation
    this.app.get('/docs', (req, res) => {
      res.json({
        success: true,
        data: {
          title: 'AI Chatbot Microservice API',
          version: '1.0.0',
          endpoints: {
            'GET /health': 'Health check',
            'GET /api/chat/health': 'Chat service health check',
            'GET /api/chat/starters': 'Get conversation starters',
            'POST /api/chat/message': 'Send a message to the AI',
            'GET /api/chat/history/:sessionId': 'Get chat history',
            'GET /api/chat/session/:sessionId': 'Get session info',
            'POST /api/chat/session': 'Create new session',
            'GET /api/chat/models': 'Get available models',
            'POST /api/users/register': 'Register a new user',
            'GET /api/users/profile': 'Get user profile (requires auth)',
            'GET /api/users/analytics': 'Get usage analytics (requires auth)',
            'GET /widget': 'Embeddable chat widget'
          },
          examples: {
            'Send Message': {
              method: 'POST',
              url: '/api/chat/message',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-api-key'
              },
              body: {
                message: 'Tell me about your experience',
                sessionId: 'optional-session-id'
              }
            },
            'Register User': {
              method: 'POST',
              url: '/api/users/register',
              headers: {
                'Content-Type': 'application/json'
              },
              body: {
                email: 'user@example.com',
                name: 'John Doe'
              }
            }
          }
        }
      });
    });
  }

  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      logger.info('Client connected:', socket.id);

      socket.on('join-session', (sessionId) => {
        socket.join(sessionId);
        logger.info(`Client ${socket.id} joined session ${sessionId}`);
      });

      socket.on('send-message', async (data) => {
        try {
          const { message, sessionId, apiKey } = data;
          
          // Validate API key if provided
          let user = null;
          if (apiKey) {
            user = await this.db.getUserByApiKey(apiKey);
          }

          const response = await this.ollamaService.generateResponse({
            message,
            sessionId,
            userId: user?.id
          });

          // Save to database
          await this.db.saveMessage({
            id: response.messageId,
            message: response.message,
            response: response.response,
            timestamp: response.timestamp,
            sessionId: response.sessionId,
            userId: user?.id,
            model: response.model
          });

          // Emit response to session
          this.io.to(sessionId).emit('message-response', response);
        } catch (error) {
          logger.error('WebSocket message error:', error);
          socket.emit('error', { message: 'Failed to process message' });
        }
      });

      socket.on('disconnect', () => {
        logger.info('Client disconnected:', socket.id);
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // General error handler
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(config.port, config.host, () => {
        logger.info(`🚀 AI Chatbot Microservice running on http://${config.host}:${config.port}`);
        logger.info(`📚 API Documentation: http://${config.host}:${config.port}/docs`);
        logger.info(`🔧 Widget Demo: http://${config.host}:${config.port}/widget`);
        logger.info(`🌍 Environment: ${config.environment}`);
        resolve();
      }).on('error', (error: any) => {
        logger.error('Failed to start server:', error);
        reject(error);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        logger.info('Server stopped');
        resolve();
      });
    });
  }

  async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down gracefully...');
      await this.stop();
      await this.db.close();
      logger.info('Shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown:', error);
    }
  }
}

// Main execution
const main = async () => {
  const server = new ChatbotServer();
  
  try {
    await server.initialize();
    await server.start();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.shutdown();
    process.exit(0);
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ChatbotServer;
