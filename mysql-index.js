const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import MySQL services
const databaseService = require('./mysql-database-service');
const DatabaseSchema = require('./mysql-schema');
const DataMigration = require('./migrate-data-to-mysql');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://smartdesk.solutions',
      /^https:\/\/smartdesk\.solutions$/
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://smartdesk.solutions',
    /^https:\/\/smartdesk\.solutions$/
  ],
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Desk API is running with MySQL',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'MySQL'
  });
});

// Basic API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'MySQL API is working!' });
});

// Service requests endpoint - fetch from database
app.get('/api/service-requests/public', async (req, res) => {
  try {
    const [rows] = await mysqlConnection.execute(
      'SELECT * FROM service_requests WHERE status = "pending" OR status = "in-progress" ORDER BY createdAt DESC'
    );
    
    res.json({ 
      success: true, 
      data: rows, 
      message: 'Public services retrieved successfully' 
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching services',
      error: error.message 
    });
  }
});

// Auth login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [rows] = await mysqlConnection.execute(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = rows[0];
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        },
        token: 'mock-jwt-token-' + user.id
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Auth register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, company, phone } = req.body;
    
    // Check if user already exists
    const [existingRows] = await mysqlConnection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Insert new user
    const [result] = await mysqlConnection.execute(
      'INSERT INTO users (firstName, lastName, email, password, company, phone, role, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, password, company || null, phone || null, 'client', true]
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: result.insertId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'client',
          isActive: true
        },
        token: 'mock-jwt-token-' + result.insertId
      },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, phone, service, message } = req.body;
    
    await mysqlConnection.execute(
      'INSERT INTO contact_submissions (name, email, company, phone, service, message) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, company || null, phone || null, service || null, message]
    );
    
    res.json({
      success: true,
      message: 'Contact form submitted successfully'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database and services
async function initializeApp() {
  try {
    console.log('🚀 Initializing Smart Desk application with MySQL...');
    
    // Test database connection
    const connected = await databaseService.testConnection();
    if (!connected) {
      console.error('❌ MySQL database connection failed. Please check your configuration.');
      process.exit(1);
    }
    
    // Create tables if they don't exist
    await DatabaseSchema.createTables();
    
    // Seed default data
    await DatabaseSchema.seedDefaultData();
    
    // Migrate existing data from JSON files
    console.log('🔄 Migrating existing data...');
    const migration = new DataMigration();
    await migration.runMigration();
    
    console.log('✅ Application initialized successfully with MySQL!');
    
    return true;
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    process.exit(1);
  }
}

// Initialize app and start server
async function startServer() {
  try {
    await initializeApp();
    
    // Make WebSocket server available to routes
    app.set('io', io);

    // Basic WebSocket connection handling
    io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      socket.on('disconnect', (reason) => {
        console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
      });
    });

    // Start server
    server.listen(Number(PORT), HOST, () => {
      console.log(`🚀 Smart Desk API server running on ${HOST}:${PORT}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 Default admin: admin@smartdesk.com / admin123`);
      console.log(`🔌 WebSocket server ready for real-time messaging`);
      console.log(`🗄️ Database: MySQL`);
      console.log(`📱 Website: https://smartdesk.solutions`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
