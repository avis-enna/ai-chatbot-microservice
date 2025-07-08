import express from 'express';
import { DatabaseService } from '../services/database.js';
import { AuthenticatedRequest, createAuthMiddleware } from '../middleware/auth.js';
import { validateRequest, userRegistrationSchema, validateQueryParams, queryParamsSchema } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

export const createUserRouter = (db: DatabaseService) => {
  const router = express.Router();

  // Register a new user (public endpoint)
  router.post('/register', validateRequest(userRegistrationSchema), async (req, res) => {
    try {
      const { email, name } = req.body;
      
      const user = await db.createUser({
        email,
        name
      });
      
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          apiKey: user.apiKey,
          createdAt: user.createdAt
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      logger.error('Failed to register user:', error);
      
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({
          success: false,
          error: 'Email already exists',
          message: 'A user with this email already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Registration failed',
          message: 'An error occurred while registering the user'
        });
      }
    }
  });

  // Get user profile (protected endpoint)
  router.get('/profile', createAuthMiddleware(db), async (req: AuthenticatedRequest, res) => {
    try {
      const user = await db.getUserByApiKey(req.user!.apiKey);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User profile not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive
        }
      });
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
        message: 'An error occurred while fetching user profile'
      });
    }
  });

  // Get usage analytics for the user
  router.get('/analytics', 
    createAuthMiddleware(db),
    validateQueryParams(queryParamsSchema),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { timeRange } = req.query as { timeRange: 'day' | 'week' | 'month' };
        
        const analytics = await db.getAnalytics(timeRange);
        
        res.json({
          success: true,
          data: {
            timeRange,
            ...analytics,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        logger.error('Failed to get analytics:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get analytics',
          message: 'An error occurred while fetching analytics data'
        });
      }
    }
  );

  return router;
};
