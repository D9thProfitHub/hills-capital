// This MUST be the very first line to ensure environment variables are loaded first
import 'dotenv/config';

// Core Node.js modules
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sendEmail, { initializeSMTP } from './utils/sendEmail.js';

// Log environment variable status
console.log('🔍 Environment Variables:');
console.log('   - NODE_ENV:', process.env.NODE_ENV || 'development (default)');
console.log('   - DB_HOST:', process.env.DB_HOST || 'localhost (default)');
console.log('   - DB_NAME:', process.env.DB_NAME || 'hillscapitaltrade (default)');
console.log('   - DB_USER:', process.env.DB_USER || 'root (default)');

// Initialize paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Log important environment variables (safely)
console.log('🔍 Environment Variables Status:');
const importantVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'NODE_ENV', 'PORT', 'JWT_SECRET'];
importantVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`  - ${varName}:`, 
    value ? (varName.includes('PASSWORD') || varName.includes('SECRET') ? '*** (set)' : value) : '(not set)'
  );
});

// Set default values for required variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '5000';

// Now import other dependencies
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// Simple cookie parser middleware
const cookieParser = () => (req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts[0]) {  // Only process if there's a key
        req.cookies[parts[0].trim()] = (parts[1] || '').trim();
      }
    });
  }
  
  next();
};
import { connectDB, sequelize } from './config/db.js';
import { errorHandler } from './middleware/error.js';
import { verifyToken } from './middleware/auth.js';
import models from './models/index.js';

// API-only server - no frontend build directory needed
console.log('🚀 Starting API server...');

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tradingviewRoutes from './routes/tradingviewRoutes.js';
import { publicAdminRouter, protectedAdminRouter } from './routes/admin.js';
import investmentRoutes from './routes/investments.js';
import tradeRoutes from './routes/trades.js';
import investmentPlanRoutes from './routes/investmentPlans.js';
import botRequestRoutes from './routes/botRequests.js';
import educationTestRoutes from './routes/educationTest.js';
import testPlansRoutes from './routes/testPlans.js';
import copyTradingRoutes from './routes/copyTrading.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Initialize express app
console.log('🚀 Initializing Express app...');
const app = express();

// Create HTTP server
console.log('🔧 Creating HTTP server...');
const httpServer = createServer(app);

// Initialize Socket.IO with enhanced configuration
console.log('🔌 Initializing Socket.IO...');
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://hillscapitaltrade.com',
      'https://www.hillscapitaltrade.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://api.hillscapitaltrade.com',
      'http://127.0.0.1:5000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    exposedHeaders: ['set-cookie']
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  cookie: false,
  serveClient: false
});

// Make io accessible in routes and globally
app.set('io', io);
global.io = io;

// Log when Socket.IO connects
// WebSocket authentication middleware
io.use(async (socket, next) => {
  try {
    // Log connection attempt with sanitized headers
    const { headers, query, auth } = socket.handshake;
    const sanitizedHeaders = { ...headers };
    
    // Remove sensitive information from logs
    if (sanitizedHeaders.cookie) {
      sanitizedHeaders.cookie = sanitizedHeaders.cookie
        .split(';')
        .map(c => c.trim().startsWith('token=') ? 'token=***' : c)
        .join('; ');
    }
    
    console.log('🔌 New connection attempt:', {
      id: socket.id,
      handshake: { headers: sanitizedHeaders, query, auth: auth ? { ...auth, token: auth.token ? '***' : null } : null }
    });
    
    // Check for authentication token in multiple possible locations
    let token = auth?.token || 
               query?.token ||
               headers['x-access-token'] ||
               (headers.cookie && 
                headers.cookie.split('; ')
                  .find(row => row.trim().startsWith('token='))
                  ?.split('=')[1]
                );

    console.log('🔑 Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.warn('⚠️ Unauthenticated connection attempt - No token provided');
      return next(new Error('Authentication error: No token provided'));
    }
    
    try {
      // Verify the token
      console.log('🔍 Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.id) {
        console.warn('⚠️ Invalid token payload:', decoded);
        return next(new Error('Authentication error: Invalid token payload'));
      }
      
      // Get user from the token
      console.log(`🔍 Looking up user with ID: ${decoded.id}`);
      const user = await models.User.findByPk(decoded.id, {
        attributes: ['id', 'email', 'role', 'status']
      });
      
      if (!user) {
        console.warn(`⚠️ User not found for ID: ${decoded.id}`);
        return next(new Error('Authentication error: User not found'));
      }
      
      if (user.status !== 'active') {
        console.warn(`⚠️ User account is not active: ${user.email} (${user.id})`);
        return next(new Error('Authentication error: Account is not active'));
      }
      
      // Attach user to socket for later use
      socket.user = user;
      console.log(`✅ Authenticated user: ${user.email} (${user.id}, Role: ${user.role})`);
      
      // Join user to their room
      socket.join(`user-${user.id}`);
      console.log(`👤 User ${user.id} joined room: user-${user.id}`);
      
      next();
    } catch (verifyError) {
      console.error('❌ Token verification failed:', verifyError.message);
      
      if (verifyError.name === 'TokenExpiredError') {
        console.warn('⚠️ Token has expired');
        return next(new Error('Authentication error: Token expired'));
      } else if (verifyError.name === 'JsonWebTokenError') {
        console.warn('⚠️ Invalid token format');
        return next(new Error('Authentication error: Invalid token'));
      }
      
      console.error('❌ Unexpected error during token verification:', verifyError);
      return next(new Error('Authentication error: Token verification failed'));
    }
  } catch (error) {
    console.error('❌ WebSocket authentication error:', error);
    return next(new Error('Authentication error: ' + (error.message || 'Unknown error')));
  }
});

// Handle authenticated connections
io.on('connection', (socket) => {
  const userId = socket.user?.id;
  const userEmail = socket.user?.email;
  
  if (!userId) {
    console.error('❌ No user ID found in socket connection');
    return socket.disconnect(true);
  }
  
  console.log(`🔌 New client connected: ${socket.id} (User: ${userEmail}, ID: ${userId})`);
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (User: ${userEmail}, ID: ${userId}, Reason: ${reason})`);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error for user ${userEmail} (${userId}):`, error);
  });
  
  // Join user's room
  if (userId) {
    socket.join(`user-${userId}`);
    console.log(`👥 User ${userId} joined their room`);
    
    // Notify user of successful connection
    socket.emit('connection_success', { 
      message: 'Connected to WebSocket server',
      userId,
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected (${reason}):`, socket.id, `(User ID: ${userId})`);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', {
      userId,
      error: error.message,
      stack: error.stack
    });
  });
  
  // Debug: Log all events
  socket.onAny((event, ...args) => {
    console.log(`📡 [${userId || 'unauthorized'}] Event: ${event}`, args);
  });
});



// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const startTime = Date.now();
let server;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage()
  });
});

// CORS Configuration
const corsOptions = {
  origin: [
    'https://hillscapitaltrade.com',
    'https://www.hillscapitaltrade.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://api.hillscapitaltrade.com',
    'http://127.0.0.1:5000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'X-XSRF-TOKEN',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  exposedHeaders: ['set-cookie', 'Authorization'],
  preflightContinue: false
};

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize cookie parser
app.use(cookieParser());

// CORS middleware
app.use((req, res, next) => {
    // Allow requests from frontend origins
  const allowedOrigins = [
    'https://hillscapitaltrade.com',
    'https://www.hillscapitaltrade.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://api.hillscapitaltrade.com',
    'http://127.0.0.1:5000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Allow credentials (cookies, authorization headers)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    // Allow these HTTP methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Allow these headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN, Accept, Origin');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    
    // Cache preflight response for 1 hour (optional)
    res.setHeader('Access-Control-Max-Age', '3600');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Return OK for OPTIONS requests
    return res.status(200).end();
  }
  
  // Continue to next middleware
  next();
});

// API-only logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes (must come before React Router catch-all)
app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/users', userRoutes);
app.use('/api/tradingview', tradingviewRoutes);
app.use('/api/admin', publicAdminRouter);
app.use('/api/admin', protectedAdminRouter);
app.use('/api/investments', investmentRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/bot-requests', botRequestRoutes);
app.use('/api/users/copy-trading', copyTradingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/investment-plans', investmentPlanRoutes);
app.use('/api/education', educationTestRoutes);
app.use('/api', testPlansRoutes);

// API 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The requested API endpoint ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

/**
 * Start background jobs
 */
function startBackgroundJobs() {
  console.log('🚀 Starting background jobs...');
  
  // Broadcast subscription updates every 10 seconds
  const subscriptionInterval = setInterval(async () => {
    try {
      // Import models dynamically to avoid circular imports
      const { Subscription, SubscriptionPlan, User } = sequelize.models || {};
      
      if (Subscription && SubscriptionPlan && User) {
        // Get all subscriptions with plan and user details
        const subscriptions = await Subscription.findAll({
          include: [
            {
              model: SubscriptionPlan,
              as: 'plan'
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ],
          order: [['createdAt', 'DESC']]
        });
        
        // Broadcast to all connected clients
        io.emit('subscriptionsUpdated', subscriptions);
        
        // Also broadcast individual user subscription updates
        for (const subscription of subscriptions) {
          if (subscription.user_id) {
            io.to(`user-${subscription.user_id}`).emit('userSubscriptionUpdated', {
              subscription,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error broadcasting subscription updates:', error);
    }
  }, 10000); // Every 10 seconds
  
  // Store interval for cleanup
  global.subscriptionInterval = subscriptionInterval;
}

/**
 * Stop background jobs
 */
function stopBackgroundJobs() {
  console.log('🛑 Stopping background jobs...');
  
  // Clean up subscription interval
  if (global.subscriptionInterval) {
    clearInterval(global.subscriptionInterval);
    global.subscriptionInterval = null;
    console.log('✅ Subscription broadcast interval cleared');
  }
}

/**
 * Test database connection with a simple query
 */
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Create a new connection to test with
    const testSequelize = new sequelize.Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'mysql', // Connect to default mysql database first
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        connectTimeout: 10000
      }
    });
    
    // Test connection
    await testSequelize.authenticate();
    console.log('✅ Successfully connected to MySQL server');
    
    // Check if database exists
    const [dbs] = await testSequelize.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${process.env.DB_NAME || 'hillscapitaltrade'}'`
    );
    
    if (dbs.length === 0) {
      console.log(`⚠️  Database '${process.env.DB_NAME || 'hillscapitaltrade'}' does not exist`);
      // We'll let the main flow handle database creation
    } else {
      console.log(`✅ Database '${process.env.DB_NAME || 'hillscapitaltrade'}' exists`);
    }
    
    await testSequelize.close();
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    if (error.original) {
      console.error('Error Code:', error.original.code);
      console.error('Error Number:', error.original.errno);
      console.error('SQL State:', error.original.sqlState);
    }
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Initialize database models using the centralized models/index.js
 */
async function initializeModels() {
  try {
    console.log('🔧 Starting model initialization...');
    
    // Import the centralized db object with all models and associations
    console.log('📥 Importing models from models/index.js...');
    const db = (await import('./models/index.js')).default;
    
    console.log('✅ All models initialized and associated successfully');
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize models:', error);
    throw error;
  }
}

/**
 * Handle graceful shutdown
 */
async function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    // Close the HTTP server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('✅ HTTP server closed');
    }
    
    // Close database connections
    if (sequelize) {
      await sequelize.close();
      console.log('✅ Database connections closed');
    }
    
    // Stop any background jobs
    stopBackgroundJobs();
    console.log('✅ Background jobs stopped');
    
    console.log('👋 Server stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider whether to shut down the server in production
  if (process.env.NODE_ENV === 'production') {
    shutdown('unhandledRejection');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error);
  // Consider whether to shut down the server in production
  if (process.env.NODE_ENV === 'production') {
    shutdown('uncaughtException');
  }
});

/**
 * Main server startup function
 */
async function startServer() {
  try {
    const startTime = Date.now();
    
    // Initialize database connection
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    // Initialize models
    console.log('🔧 Initializing models...');
    const db = await initializeModels();
    
    // Sync database to create tables
    console.log('🔄 Syncing database...');
    try {
      // Skip sync temporarily due to affiliates table key limit issue
      console.log('⚠️ Skipping database sync to avoid key limit issue');
      console.log('✅ Database connection established (sync skipped)');
    } catch (syncError) {
      console.error('❌ Database sync error:', syncError);
      throw syncError;
    }
    
    // Use the existing HTTP server and Socket.IO instance
    console.log('🔌 WebSocket connections ready...');
    
    // Start the HTTP server
    return new Promise((resolve, reject) => {
      const server = httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`\n✅ Server is running on port ${PORT}`);
        console.log(`🔗 http://localhost:${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`⏱️  Startup time: ${Date.now() - startTime}ms`);
        
        // Start background jobs after server starts
        startBackgroundJobs();
        
        // Store models and io in app context
        app.set('models', db);
        app.set('io', io);
        
        resolve(server);
      });
      
      // Handle server errors
      server.on('error', (error) => {
        if (error.syscall !== 'listen') {
          reject(error);
          return;
        }
        
        // Handle specific listen errors with friendly messages
        switch (error.code) {
          case 'EACCES':
            console.error(`❌ Port ${PORT} requires elevated privileges`);
            process.exit(1);
            break;
          case 'EADDRINUSE':
            console.error(`❌ Port ${PORT} is already in use`);
            process.exit(1);
            break;
          default:
            reject(error);
        }
      });
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error);
    throw error;
  }
}

// Start the server if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('🚀 Starting server in', NODE_ENV, 'mode...');
  
      // Force development mode for email
  console.log('🚀 Forcing development mode for email');
  process.env.NODE_ENV = 'development';
  
  // Initialize SMTP transporter - non-blocking
  initializeSMTP()
    .then((success) => {
      if (success) {
        console.log('✅ Development: Using mock email transporter');
      } else {
        console.log('⚠️  Email functionality is disabled - falling back to mock');
        // Force mock transporter
        transporter = {
          sendMail: (mailOptions) => {
            console.log('📧 [Mock] Email would be sent:', {
              to: mailOptions.to,
              subject: mailOptions.subject,
              text: mailOptions.text || 'No text content',
              html: mailOptions.html ? '[HTML content]' : 'No HTML content'
            });
            return Promise.resolve({
              messageId: 'mock-message-id',
              envelope: {
                from: process.env.SMTP_EMAIL || 'no-reply@example.com',
                to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to]
              },
              accepted: [mailOptions.to],
              rejected: [],
              pending: [],
              response: '250 Mock: OK'
            });
          },
          verify: () => Promise.resolve(true)
        };
      }
    })
    .catch((error) => {
      console.error('❌ Error initializing email:', error.message);
      console.log('⚠️  Email functionality will use mock transporter');
    });
  
  startServer()
    .then(() => {
      console.log('✅ Server started successfully');
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        syscall: error.syscall,
        port: PORT
      });
      process.exit(1);
    });
}

// Create a single export object
const exportsToExport = {
  app,
  server,
  io,
  startServer,
  shutdown,
  // Add any other exports you need
};

// For ES modules
export default exportsToExport;

export { app, startServer, io };

// For CommonJS (Node.js require)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = exportsToExport;
  module.exports.default = exportsToExport;
}
