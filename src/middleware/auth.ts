import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { DatabaseService } from '../services/database.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    apiKey: string;
  };
}

export const createAuthMiddleware = (db: DatabaseService) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.headers.authorization?.replace('Bearer ', '') || 
                     req.headers['x-api-key'] as string || 
                     req.query.apiKey as string;
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API key required',
          message: 'Please provide a valid API key'
        });
      }

      const user = await db.getUserByApiKey(apiKey);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key',
          message: 'The provided API key is invalid or expired'
        });
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        apiKey: user.apiKey
      };

      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed',
        message: 'Internal server error during authentication'
      });
    }
  };
};

export const optionalAuthMiddleware = (db: DatabaseService) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.headers.authorization?.replace('Bearer ', '') || 
                     req.headers['x-api-key'] as string || 
                     req.query.apiKey as string;
      
      if (apiKey) {
        const user = await db.getUserByApiKey(apiKey);
        
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            apiKey: user.apiKey
          };
        }
      }

      next();
    } catch (error) {
      logger.error('Optional authentication error:', error);
      // Don't fail the request for optional auth
      next();
    }
  };
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };
    
    if (res.statusCode >= 400) {
      logger.error('Request failed:', logData);
    } else {
      logger.info('Request completed:', logData);
    }
  });
  
  next();
};

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    message: statusCode === 500 ? 'An unexpected error occurred' : message,
    timestamp: new Date().toISOString()
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
};

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};
