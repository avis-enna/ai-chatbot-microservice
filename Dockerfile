# Use the official Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
  const options = { host: 'localhost', port: 3001, path: '/health', timeout: 2000 }; \
  const req = http.request(options, (res) => { \
    if (res.statusCode === 200) { process.exit(0); } else { process.exit(1); } \
  }); \
  req.on('error', () => process.exit(1)); \
  req.end();"

# Start the application
CMD ["npm", "start"]
