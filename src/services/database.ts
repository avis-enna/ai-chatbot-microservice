import sqlite3 from 'sqlite3';
import { ChatMessage, ChatSession, User } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';
import { promises as fs } from 'fs';
import { dirname } from 'path';

export class DatabaseService {
  private db: sqlite3.Database;
  private isInitialized = false;

  constructor(dbPath: string = config.database.path) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Error opening database:', err);
        throw err;
      }
      logger.info(`Connected to SQLite database at ${dbPath}`);
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure database directory exists
      const dbDir = dirname(config.database.path);
      await fs.mkdir(dbDir, { recursive: true });

      // Create tables
      await this.createTables();
      this.isInitialized = true;
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        api_key TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1
      )
    `;

    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        model TEXT,
        context TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity)'
    ];

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createUsersTable);
        this.db.run(createSessionsTable);
        this.db.run(createMessagesTable);
        
        createIndexes.forEach(indexSql => {
          this.db.run(indexSql);
        });

        this.db.run('PRAGMA journal_mode = WAL', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    const sql = `
      INSERT INTO messages (id, session_id, user_id, message, response, timestamp, model, context)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [
        message.id,
        message.sessionId,
        message.userId || null,
        message.message,
        message.response,
        message.timestamp.toISOString(),
        message.model || null,
        message.context ? JSON.stringify(message.context) : null
      ], (err) => {
        if (err) {
          logger.error('Failed to save message:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getSessionMessages(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    const sql = `
      SELECT * FROM messages 
      WHERE session_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [sessionId, limit], (err, rows: any[]) => {
        if (err) {
          logger.error('Failed to get session messages:', err);
          reject(err);
        } else {
          const messages: ChatMessage[] = rows.map(row => ({
            id: row.id,
            message: row.message,
            response: row.response,
            timestamp: new Date(row.timestamp),
            sessionId: row.session_id,
            userId: row.user_id,
            model: row.model,
            context: row.context ? JSON.parse(row.context) : undefined
          })).reverse();
          resolve(messages);
        }
      });
    });
  }

  async createSession(session: Partial<ChatSession>): Promise<ChatSession> {
    const sql = `
      INSERT INTO sessions (id, user_id, created_at, last_activity, metadata)
      VALUES (?, ?, ?, ?, ?)
    `;

    const sessionData: ChatSession = {
      id: session.id || this.generateId(),
      userId: session.userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      messages: [],
      metadata: session.metadata
    };

    return new Promise((resolve, reject) => {
      this.db.run(sql, [
        sessionData.id,
        sessionData.userId || null,
        sessionData.createdAt.toISOString(),
        sessionData.lastActivity.toISOString(),
        sessionData.metadata ? JSON.stringify(sessionData.metadata) : null
      ], (err) => {
        if (err) {
          logger.error('Failed to create session:', err);
          reject(err);
        } else {
          resolve(sessionData);
        }
      });
    });
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const sql = 'UPDATE sessions SET last_activity = ? WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [new Date().toISOString(), sessionId], (err) => {
        if (err) {
          logger.error('Failed to update session activity:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const sql = 'SELECT * FROM sessions WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [sessionId], async (err, row: any) => {
        if (err) {
          logger.error('Failed to get session:', err);
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const messages = await this.getSessionMessages(sessionId);
            const session: ChatSession = {
              id: row.id,
              userId: row.user_id,
              createdAt: new Date(row.created_at),
              lastActivity: new Date(row.last_activity),
              messages: messages,
              metadata: row.metadata ? JSON.parse(row.metadata) : undefined
            };
            resolve(session);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async createUser(user: Partial<User>): Promise<User> {
    const sql = `
      INSERT INTO users (id, email, name, api_key, created_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const userData: User = {
      id: user.id || this.generateId(),
      email: user.email,
      name: user.name,
      apiKey: user.apiKey || this.generateApiKey(),
      createdAt: new Date(),
      isActive: true
    };

    return new Promise((resolve, reject) => {
      this.db.run(sql, [
        userData.id,
        userData.email || null,
        userData.name || null,
        userData.apiKey,
        userData.createdAt.toISOString(),
        userData.isActive
      ], (err) => {
        if (err) {
          logger.error('Failed to create user:', err);
          reject(err);
        } else {
          resolve(userData);
        }
      });
    });
  }

  async getUserByApiKey(apiKey: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE api_key = ? AND is_active = 1';
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [apiKey], (err, row: any) => {
        if (err) {
          logger.error('Failed to get user by API key:', err);
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          const user: User = {
            id: row.id,
            email: row.email,
            name: row.name,
            apiKey: row.api_key,
            createdAt: new Date(row.created_at),
            lastLogin: row.last_login ? new Date(row.last_login) : undefined,
            isActive: row.is_active
          };
          resolve(user);
        }
      });
    });
  }

  async getAnalytics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    const timeFilter = this.getTimeFilter(timeRange);
    
    const queries = {
      totalMessages: `SELECT COUNT(*) as count FROM messages WHERE timestamp >= ?`,
      totalSessions: `SELECT COUNT(*) as count FROM sessions WHERE created_at >= ?`,
      activeUsers: `SELECT COUNT(DISTINCT user_id) as count FROM messages WHERE timestamp >= ? AND user_id IS NOT NULL`,
      topQuestions: `
        SELECT message, COUNT(*) as count 
        FROM messages 
        WHERE timestamp >= ? 
        GROUP BY message 
        ORDER BY count DESC 
        LIMIT 10
      `,
      messagesOverTime: `
        SELECT DATE(timestamp) as date, COUNT(*) as count 
        FROM messages 
        WHERE timestamp >= ? 
        GROUP BY DATE(timestamp) 
        ORDER BY date
      `
    };

    const results = await Promise.all([
      this.runQuery(queries.totalMessages, [timeFilter]),
      this.runQuery(queries.totalSessions, [timeFilter]),
      this.runQuery(queries.activeUsers, [timeFilter]),
      this.runQuery(queries.topQuestions, [timeFilter]),
      this.runQuery(queries.messagesOverTime, [timeFilter])
    ]);

    return {
      totalMessages: results[0][0]?.count || 0,
      totalSessions: results[1][0]?.count || 0,
      activeUsers: results[2][0]?.count || 0,
      topQuestions: results[3] || [],
      messagesOverTime: results[4] || []
    };
  }

  private getTimeFilter(timeRange: 'day' | 'week' | 'month'): string {
    const now = new Date();
    const timeAgo = new Date(now);
    
    switch (timeRange) {
      case 'day':
        timeAgo.setDate(now.getDate() - 1);
        break;
      case 'week':
        timeAgo.setDate(now.getDate() - 7);
        break;
      case 'month':
        timeAgo.setMonth(now.getMonth() - 1);
        break;
    }
    
    return timeAgo.toISOString();
  }

  private runQuery(sql: string, params: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateApiKey(): string {
    return `ak_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
          reject(err);
        } else {
          logger.info('Database connection closed');
          resolve();
        }
      });
    });
  }
}

export const createDatabaseService = (dbPath?: string): DatabaseService => {
  return new DatabaseService(dbPath);
};
