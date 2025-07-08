import express from 'express';
import { OllamaService } from '../services/ollama.js';
import { DatabaseService } from '../services/database.js';
import { AuthenticatedRequest, optionalAuthMiddleware } from '../middleware/auth.js';
import { validateRequest, chatMessageSchema, sanitizeInput } from '../middleware/validation.js';
import { ChatRequest, ChatResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { conversationStarters } from '../knowledge-base/data.js';

export const createChatRouter = (ollamaService: OllamaService, db: DatabaseService) => {
  const router = express.Router();

  // Apply middleware
  router.use(optionalAuthMiddleware(db));
  router.use(sanitizeInput);

  // Health check endpoint
  router.get('/health', async (req, res) => {
    try {
      const isOllamaHealthy = await ollamaService.isHealthy();
      const availableModels = await ollamaService.getAvailableModels();
      
      res.json({
        success: true,
        data: {
          status: 'healthy',
          ollama: {
            healthy: isOllamaHealthy,
            models: availableModels
          },
          database: 'connected',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        message: 'Service is not healthy'
      });
    }
  });

  // Get conversation starters
  router.get('/starters', (req, res) => {
    res.json({
      success: true,
      data: conversationStarters
    });
  });

  // Send a message to the AI
  router.post('/message', validateRequest(chatMessageSchema), async (req: AuthenticatedRequest, res) => {
    try {
      const { message, sessionId, model, context } = req.body;
      
      // Generate session ID if not provided
      const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get conversation context
      const previousMessages = await db.getSessionMessages(currentSessionId, 5);
      const conversationContext = {
        ...context,
        previousMessages: previousMessages.map(msg => ({
          message: msg.message,
          response: msg.response,
          timestamp: msg.timestamp
        }))
      };

      // Create chat request
      const chatRequest: ChatRequest = {
        message,
        sessionId: currentSessionId,
        userId: req.user?.id,
        model,
        context: conversationContext
      };

      // Generate AI response
      const aiResponse = await ollamaService.generateResponse(chatRequest);

      // Save to database
      await db.saveMessage({
        id: aiResponse.messageId,
        message: aiResponse.message,
        response: aiResponse.response,
        timestamp: aiResponse.timestamp,
        sessionId: aiResponse.sessionId,
        userId: req.user?.id,
        model: aiResponse.model,
        context: conversationContext
      });

      // Update session activity
      await db.updateSessionActivity(currentSessionId);

      res.json({
        success: true,
        data: aiResponse
      });
    } catch (error) {
      logger.error('Failed to process message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process message',
        message: 'An error occurred while processing your message'
      });
    }
  });

  // Get chat history for a session
  router.get('/history/:sessionId', async (req: AuthenticatedRequest, res) => {
    try {
      const { sessionId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await db.getSessionMessages(sessionId, limit);
      
      res.json({
        success: true,
        data: {
          sessionId,
          messages,
          count: messages.length
        }
      });
    } catch (error) {
      logger.error('Failed to get chat history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat history',
        message: 'An error occurred while fetching chat history'
      });
    }
  });

  // Get session information
  router.get('/session/:sessionId', async (req: AuthenticatedRequest, res) => {
    try {
      const { sessionId } = req.params;
      
      let session = await db.getSession(sessionId);
      
      if (!session) {
        // Create new session if it doesn't exist
        session = await db.createSession({
          id: sessionId,
          userId: req.user?.id
        });
      }
      
      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      logger.error('Failed to get session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session',
        message: 'An error occurred while fetching session information'
      });
    }
  });

  // Create a new session
  router.post('/session', async (req: AuthenticatedRequest, res) => {
    try {
      const { metadata } = req.body;
      
      const session = await db.createSession({
        userId: req.user?.id,
        metadata
      });
      
      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      logger.error('Failed to create session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create session',
        message: 'An error occurred while creating the session'
      });
    }
  });

  // Get available models
  router.get('/models', async (req, res) => {
    try {
      const models = await ollamaService.getAvailableModels();
      
      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      logger.error('Failed to get available models:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available models',
        message: 'An error occurred while fetching available models'
      });
    }
  });

  return router;
};
