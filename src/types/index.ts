export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  model?: string;
  context?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId?: string;
  createdAt: Date;
  lastActivity: Date;
  messages: ChatMessage[];
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  apiKey: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  model?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  response: string;
  sessionId: string;
  messageId: string;
  timestamp: Date;
  model: string;
  success: boolean;
  error?: string;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  contextWindow?: number;
}

export interface KnowledgeBase {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location: string;
    summary: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    location: string;
    description: string;
    achievements: string[];
    technologies: string[];
  }>;
  skills: {
    technical: string[];
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
  };
  education: Array<{
    institution: string;
    degree: string;
    duration: string;
    location: string;
    gpa?: string;
    relevant_coursework?: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    github?: string;
    demo?: string;
    achievements: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

export interface ServerConfig {
  port: number;
  host: string;
  environment: 'development' | 'production' | 'test';
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: RateLimitConfig;
  ollama: OllamaConfig;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  database: {
    path: string;
  };
}
