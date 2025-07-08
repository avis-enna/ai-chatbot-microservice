import dotenv from 'dotenv';
import { ServerConfig } from '../types/index.js';

dotenv.config();

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  
  cors: {
    origin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
      ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'https://*.railway.app', 'https://*.render.com', 'https://*.trycloudflare.com'],
    credentials: true
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },
  
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.1',
    temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS || '500', 10),
    contextWindow: parseInt(process.env.OLLAMA_CONTEXT_WINDOW || '4096', 10)
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  database: {
    path: process.env.DATABASE_PATH || './data/chatbot.db'
  }
};

export const validateConfig = (): void => {
  const requiredEnvVars = ['JWT_SECRET'];
  
  if (config.environment === 'production') {
    requiredEnvVars.push('OLLAMA_BASE_URL', 'CORS_ORIGIN');
  }
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    if (config.environment === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

export default config;
