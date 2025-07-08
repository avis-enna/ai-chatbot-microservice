import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'ai-chatbot-microservice' },
  transports: [
    new winston.transports.Console({
      format: nodeEnv === 'development' ? consoleFormat : logFormat
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: logFormat
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: logFormat
    })
  ]
});

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' })
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default logger;
