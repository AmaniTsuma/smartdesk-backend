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

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    // Test basic connection
    const [connectionTest] = await mysqlConnection.execute('SELECT 1 as test');
    
    // Check what tables exist
    const [tables] = await mysqlConnection.execute('SHOW TABLES');
    
    res.json({
      success: true,
      message: 'Database connection working',
      data: {
        connectionTest: connectionTest[0],
        tables: tables.map(t => Object.values(t)[0])
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Service requests endpoint - simple version without database dependency
app.get('/api/service-requests/public', (req, res) => {
  console.log('Returning sample services data');
  
  const sampleServices = [
    {
      id: 'service-1',
      title: 'Email & Calendar Management',
      description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
      serviceType: 'consulting',
      status: 'pending',
      priority: 'high',
      estimatedHours: 40,
      actualHours: 15,
      startDate: '2024-01-15T00:00:00.000Z',
      endDate: '2024-02-15T00:00:00.000Z',
      createdAt: '2024-01-10T00:00:00.000Z',
      updatedAt: '2025-09-20T19:33:29.642Z',
      image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      icon: '📧',
      features: [
        'Inbox triage and prioritization',
        'Email response drafting',
        'Calendar scheduling and management',
        'Meeting coordination',
        'Follow-up reminders'
      ],
      pricing: {
        hourly: 25,
        package: 800
      }
    },
    {
      id: 'service-2',
      title: 'Document Management & Organization',
      description: 'Professional document organization and management services to streamline your business operations.',
      serviceType: 'consulting',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 30,
      actualHours: 12,
      startDate: '2024-01-20T00:00:00.000Z',
      endDate: '2024-02-20T00:00:00.000Z',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2025-09-20T19:33:29.642Z',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      icon: '📁',
      features: [
        'File organization and categorization',
        'Digital document conversion',
        'Archive management',
        'Version control',
        'Backup and security'
      ],
      pricing: {
        hourly: 20,
        package: 600
      }
    },
    {
      id: 'service-3',
      title: 'Administrative Support',
      description: 'Comprehensive administrative support to help you focus on growing your business.',
      serviceType: 'consulting',
      status: 'pending',
      priority: 'high',
      estimatedHours: 50,
      actualHours: 20,
      startDate: '2024-01-25T00:00:00.000Z',
      endDate: '2024-03-25T00:00:00.000Z',
      createdAt: '2024-01-20T00:00:00.000Z',
      updatedAt: '2025-09-20T19:33:29.642Z',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      icon: '⚡',
      features: [
        'Data entry and management',
        'Report generation',
        'Client communication',
        'Schedule coordination',
        'Task prioritization'
      ],
      pricing: {
        hourly: 30,
        package: 1200
      }
    }
  ];
  
  res.json({ 
    success: true, 
    data: sampleServices, 
    message: 'Sample services loaded successfully' 
  });
});

// Auth login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if users table exists
    const [tableCheck] = await mysqlConnection.execute(
      'SHOW TABLES LIKE "users"'
    );
    
    if (tableCheck.length === 0) {
      console.log('users table does not exist');
      return res.status(500).json({
        success: false,
        message: 'Database not properly set up'
      });
    }
    
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
    
    // Check if users table exists
    const [tableCheck] = await mysqlConnection.execute(
      'SHOW TABLES LIKE "users"'
    );
    
    if (tableCheck.length === 0) {
      console.log('users table does not exist');
      return res.status(500).json({
        success: false,
        message: 'Database not properly set up'
      });
    }
    
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

// Messaging endpoints for live chat
app.post('/api/messaging/public/send', async (req, res) => {
  try {
    const { content, senderName, senderEmail, messageType = 'text' } = req.body;
    
    // Check if messages table exists
    const [tableCheck] = await mysqlConnection.execute(
      'SHOW TABLES LIKE "messages"'
    );
    
    if (tableCheck.length === 0) {
      console.log('messages table does not exist, creating basic response');
      return res.json({
        success: true,
        message: 'Message received (table not set up yet)',
        data: {
          id: Date.now(),
          content,
          senderName,
          senderEmail,
          messageType,
          createdAt: new Date().toISOString()
        }
      });
    }
    
    // Insert message into database
    const [result] = await mysqlConnection.execute(
      'INSERT INTO messages (content, senderName, senderEmail, messageType, senderId, conversationId) VALUES (?, ?, ?, ?, ?, ?)',
      [content, senderName, senderEmail, messageType, null, null]
    );
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: result.insertId,
        content,
        senderName,
        senderEmail,
        messageType,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Messaging error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Get public messages
app.get('/api/messaging/public/messages', async (req, res) => {
  try {
    // Check if messages table exists
    const [tableCheck] = await mysqlConnection.execute(
      'SHOW TABLES LIKE "messages"'
    );
    
    if (tableCheck.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No messages table found'
      });
    }
    
    const [rows] = await mysqlConnection.execute(
      'SELECT * FROM messages WHERE senderId IS NULL ORDER BY createdAt DESC LIMIT 50'
    );
    
    res.json({
      success: true,
      data: rows,
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
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
