import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn('Request validation failed:', { error: errorMessage, body: req.body });
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

export const chatMessageSchema = Joi.object({
  message: Joi.string().required().min(1).max(2000).messages({
    'string.empty': 'Message cannot be empty',
    'string.min': 'Message must be at least 1 character long',
    'string.max': 'Message cannot exceed 2000 characters',
    'any.required': 'Message is required'
  }),
  sessionId: Joi.string().optional().pattern(/^[a-zA-Z0-9_-]+$/).messages({
    'string.pattern.base': 'Session ID must contain only alphanumeric characters, hyphens, and underscores'
  }),
  model: Joi.string().optional().min(1).max(50).messages({
    'string.min': 'Model name must be at least 1 character long',
    'string.max': 'Model name cannot exceed 50 characters'
  }),
  context: Joi.object().optional().messages({
    'object.base': 'Context must be a valid object'
  })
});

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  name: Joi.string().optional().min(1).max(100).messages({
    'string.min': 'Name must be at least 1 character long',
    'string.max': 'Name cannot exceed 100 characters'
  })
});

export const sessionSchema = Joi.object({
  metadata: Joi.object().optional().messages({
    'object.base': 'Metadata must be a valid object'
  })
});

export const queryParamsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  offset: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Offset must be a number',
    'number.integer': 'Offset must be an integer',
    'number.min': 'Offset must be at least 0'
  }),
  timeRange: Joi.string().valid('day', 'week', 'month').default('week').messages({
    'any.only': 'Time range must be one of: day, week, month'
  })
});

export const validateQueryParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn('Query parameter validation failed:', { error: errorMessage, query: req.query });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    req.query = value;
    next();
  };
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    // Recursively sanitize strings in the request body
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return obj.trim().replace(/[<>]/g, ''); // Basic XSS protection
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};
