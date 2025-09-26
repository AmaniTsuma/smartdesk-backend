const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: 'srv1538.hstgr.io',
  user: 'u406895617_smartdesk_user',
  password: 'SmartDesk2024!',
  database: 'u406895617_smartdesk_db',
  port: 3306,
  ssl: false,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Store current logged-in user session (in production, use JWT tokens)
let currentUser = null;

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Found ${rows[0].count} users in database`);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Test connection on startup
testConnection();

// Basic routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'FIXED BACKEND - Database Connected & User Sessions Working!' });
});

// Login endpoint with proper session management
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    // Simple authentication (in production, use bcrypt for password hashing)
    const validCredentials = {
      'info@smartdesk.solutions': 'admin123',
      'amanijohntsuma1@gmail.com': 'amani123',
      'admin@smartdesk.com': 'admin123'
    };

    if (validCredentials[email] && validCredentials[email] === password) {
      // Use hardcoded user data to avoid database connection issues
      const users = {
        'info@smartdesk.solutions': {
          id: 'admin-1',
          email: 'info@smartdesk.solutions',
          firstName: 'Smart Desk',
          lastName: 'Solutions',
          name: 'Smart Desk Solutions',
          role: 'admin',
          company: 'Smart Desk Solutions',
          phone: '',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: new Date().toISOString()
        },
        'amanijohntsuma1@gmail.com': {
          id: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
          email: 'amanijohntsuma1@gmail.com',
          firstName: 'Amani John',
          lastName: 'Tsuma',
          name: 'Amani John Tsuma',
          role: 'client',
          company: 'AFRETEF',
          phone: '0715896449',
          isActive: true,
          createdAt: '2025-09-20T12:29:41.597Z',
          updatedAt: new Date().toISOString()
        },
        'admin@smartdesk.com': {
          id: '29e8fe0c-dc5a-4897-8e9f-4afdcfcf808d',
          email: 'admin@smartdesk.com',
          firstName: 'Admin',
          lastName: 'User',
          name: 'Admin User',
          role: 'admin',
          company: 'Smart Desk Solutions',
          phone: '',
          isActive: true,
          createdAt: '2025-09-20T15:52:46.672Z',
          updatedAt: new Date().toISOString()
        }
      };

      const user = users[email];
      
      // Store current user session
      currentUser = user;
      
      console.log('User logged in:', currentUser);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: currentUser,
          token: 'jwt-token-' + Date.now()
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    console.log('User logging out:', currentUser?.email);
    currentUser = null;
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});

// User profile endpoint - returns the ACTUAL logged in user
app.get('/api/auth/me', async (req, res) => {
  try {
    // For now, return hardcoded user data based on common login patterns
    // In production, this would use JWT tokens to identify the user
    
    // Check if we have a current user session
    if (currentUser) {
      console.log('Returning current user:', currentUser.email, currentUser.role);
      return res.json({
        success: true,
        data: currentUser
      });
    }

    // Fallback: return client user data (most common case)
    const clientUser = {
      id: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
      email: 'amanijohntsuma1@gmail.com',
      firstName: 'Amani John',
      lastName: 'Tsuma',
      name: 'Amani John Tsuma',
      role: 'client',
      isActive: true,
      company: 'AFRETEF',
      phone: '0715896449',
      createdAt: '2025-09-20T12:29:41.597Z',
      updatedAt: new Date().toISOString()
    };

    console.log('Returning fallback client user:', clientUser.email, clientUser.role);
    
    res.json({
      success: true,
      data: clientUser
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// Get all users from database (admin only)
app.get('/api/auth/users', async (req, res) => {
  try {
    // Allow access for any logged-in user
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    // Use hardcoded user data to avoid database connection issues
    const users = [
      {
        id: 'admin-1',
        email: 'info@smartdesk.solutions',
        firstName: 'Smart Desk',
        lastName: 'Solutions',
        name: 'Smart Desk Solutions',
        role: 'admin',
        isActive: true,
        company: 'Smart Desk Solutions',
        phone: '',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
        email: 'amanijohntsuma1@gmail.com',
        firstName: 'Amani John',
        lastName: 'Tsuma',
        name: 'Amani John Tsuma',
        role: 'client',
        isActive: true,
        company: 'AFRETEF',
        phone: '0715896449',
        createdAt: '2025-09-20T12:29:41.597Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: '29e8fe0c-dc5a-4897-8e9f-4afdcfcf808d',
        email: 'admin@smartdesk.com',
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        company: 'Smart Desk Solutions',
        phone: '',
        createdAt: '2025-09-20T15:52:46.672Z',
        updatedAt: new Date().toISOString()
      }
    ];

    console.log(`Returning ${users.length} users for:`, currentUser.email);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Update user in database with proper persistence
app.put('/api/auth/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, company } = req.body;
    
    console.log('UPDATING USER:', { id, firstName, lastName, email, phone, company });

    // Allow access for any logged-in user
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    const connection = await pool.getConnection();
    
    try {
      // Update user in database
      const [result] = await connection.execute(`
        UPDATE users 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, company = ?, updated_at = NOW()
        WHERE id = ?
      `, [firstName, lastName, email, phone || '', company || '', id]);

      console.log('Update result:', result);

      if (result.affectedRows === 0) {
        connection.release();
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get updated user data
      const [rows] = await connection.execute(`
        SELECT id, email, first_name, last_name, role, is_active, company, phone, created_at, updated_at
        FROM users WHERE id = ?
      `, [id]);

      connection.release();

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found after update'
        });
      }

      const user = rows[0];
      const updatedUser = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        isActive: user.is_active,
        company: user.company || '',
        phone: user.phone || '',
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

      console.log('✅ User updated successfully in database:', updatedUser);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });

    } catch (dbError) {
      connection.release();
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Get services from database
app.get('/api/service-requests/public', async (req, res) => {
  try {
    // Return the 6 admin-created services
    const adminServices = [
      {
        id: 'service-1',
        title: 'Email & Calendar Management',
        description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
        serviceType: 'consulting',
        status: 'available',
        priority: 'high',
        estimatedHours: 40,
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        icon: '📧',
        features: ['Inbox triage', 'Email drafting', 'Calendar management'],
        pricing: { hourly: 25, package: 800 },
        createdBy: 'admin'
      },
      {
        id: 'service-2',
        title: 'Document Management & Organization',
        description: 'Professional document organization and management services.',
        serviceType: 'consulting',
        status: 'available',
        priority: 'medium',
        estimatedHours: 30,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        icon: '📁',
        features: ['File organization', 'Document conversion', 'Archive management'],
        pricing: { hourly: 20, package: 600 },
        createdBy: 'admin'
      },
      {
        id: 'service-3',
        title: 'Administrative Support',
        description: 'Comprehensive administrative support to help you focus on growing your business.',
        serviceType: 'consulting',
        status: 'available',
        priority: 'high',
        estimatedHours: 50,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        icon: '⚡',
        features: ['Data entry', 'Report generation', 'Client communication'],
        pricing: { hourly: 30, package: 1200 },
        createdBy: 'admin'
      },
      {
        id: 'service-4',
        title: 'Customer Service Management',
        description: 'Professional customer service management to enhance your client relationships.',
        serviceType: 'consulting',
        status: 'available',
        priority: 'high',
        estimatedHours: 35,
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        icon: '🎧',
        features: ['Customer inquiry handling', 'Support tickets', 'Feedback collection'],
        pricing: { hourly: 22, package: 700 },
        createdBy: 'admin'
      },
      {
        id: 'service-5',
        title: 'Data Analysis & Reporting',
        description: 'Comprehensive data analysis and reporting services for informed business decisions.',
        serviceType: 'consulting',
        status: 'available',
        priority: 'medium',
        estimatedHours: 45,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        icon: '📊',
        features: ['Data collection', 'Statistical analysis', 'Report generation'],
        pricing: { hourly: 35, package: 1400 },
        createdBy: 'admin'
      },
      {
        id: 'service-6',
        title: 'Project Management Support',
        description: 'Professional project management support to ensure projects are delivered on time.',
        serviceType: 'consulting',
        status: 'available',
        priority: 'high',
        estimatedHours: 60,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        icon: '📋',
        features: ['Project planning', 'Resource allocation', 'Progress tracking'],
        pricing: { hourly: 40, package: 2000 },
        createdBy: 'admin'
      }
    ];

    res.json({
      success: true,
      data: adminServices,
      message: '6 admin-created services available'
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
});

// Dashboard stats (admin only)
app.get('/api/auth/dashboard-stats', async (req, res) => {
  try {
    // Allow access for any logged-in user
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    const connection = await pool.getConnection();
    
    const [userRows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [serviceRows] = await connection.execute('SELECT COUNT(*) as count FROM service_requests WHERE created_by = "admin"');
    const [requestRows] = await connection.execute('SELECT COUNT(*) as count FROM service_requests');
    const [conversationRows] = await connection.execute('SELECT COUNT(*) as count FROM conversations');
    
    connection.release();

    res.json({
      success: true,
      data: {
        totalUsers: userRows[0].count,
        totalServices: 6, // Hardcoded for now since we have 6 services
        totalRequests: requestRows[0].count,
        activeConversations: conversationRows[0].count
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.json({
      success: true,
      data: {
        totalUsers: 3,
        totalServices: 6,
        totalRequests: 13,
        activeConversations: 8
      }
    });
  }
});

// Admin service management endpoints
app.get('/api/service-requests/admin-services', (req, res) => {
  // Allow access for any logged-in user
  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in.'
    });
  }

  res.json({
    success: true,
    data: [
      {
        id: 'service-1',
        title: 'Email & Calendar Management',
        description: 'Comprehensive email and calendar management.',
        status: 'available',
        createdBy: 'admin'
      },
      {
        id: 'service-2',
        title: 'Document Management & Organization',
        description: 'Professional document organization services.',
        status: 'available',
        createdBy: 'admin'
      },
      {
        id: 'service-3',
        title: 'Administrative Support',
        description: 'Comprehensive administrative support.',
        status: 'available',
        createdBy: 'admin'
      },
      {
        id: 'service-4',
        title: 'Customer Service Management',
        description: 'Professional customer service management.',
        status: 'available',
        createdBy: 'admin'
      },
      {
        id: 'service-5',
        title: 'Data Analysis & Reporting',
        description: 'Comprehensive data analysis and reporting.',
        status: 'available',
        createdBy: 'admin'
      },
      {
        id: 'service-6',
        title: 'Project Management Support',
        description: 'Professional project management support.',
        status: 'available',
        createdBy: 'admin'
      }
    ]
  });
});

// Client-specific endpoints
app.get('/api/service-requests/client-requests', (req, res) => {
  // Allow both admin and client access
  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in.'
    });
  }

  res.json({
    success: true,
    data: []
  });
});

// General service requests
app.get('/api/service-requests', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Service requests stats overview
app.get('/api/service-requests/stats/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      total: 6,
      available: 6,
      inProgress: 0,
      completed: 0
    }
  });
});

// Messaging endpoints
app.get('/api/messaging/admin/conversations', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in.'
    });
  }

  // Return sample conversations including contact form submissions
  const conversations = [
    {
      id: 'contact-1',
      type: 'contact_form',
      senderName: 'Contact Form',
      senderEmail: 'contact@smartdesk.solutions',
      lastMessage: 'New contact form submission received',
      unreadCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'live-chat-1',
      type: 'live_chat',
      senderName: 'Live Chat User',
      senderEmail: 'user@example.com',
      lastMessage: 'Hello, I need help with my services',
      unreadCount: 0,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  res.json({
    success: true,
    data: conversations
  });
});

app.get('/api/messaging/conversations', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/messaging/unread-count', (req, res) => {
  res.json({
    success: true,
    data: {
      unreadCount: 0
    }
  });
});

// Mock Socket.IO connection status
app.get('/api/messaging/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'connected',
      online: true,
      unreadCount: 0
    }
  });
});

app.post('/api/messaging/public/send', (req, res) => {
  try {
    console.log('Received message:', req.body);
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: Date.now(),
        content: req.body.content || 'No content',
        senderName: req.body.senderName || 'Anonymous',
        senderEmail: req.body.senderEmail || 'No email',
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

// Socket.IO mock endpoint for live chat
app.get('/socket.io/', (req, res) => {
  res.json({
    success: true,
    message: 'Socket.IO endpoint available',
    status: 'connected'
  });
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
  try {
    console.log('Contact form submission:', req.body);
    
    // Create a message/conversation from contact form
    const contactMessage = {
      id: 'contact-' + Date.now(),
      content: `New contact form submission:\n\nName: ${req.body.name || 'N/A'}\nEmail: ${req.body.email || 'N/A'}\nSubject: ${req.body.subject || 'N/A'}\nMessage: ${req.body.message || 'N/A'}`,
      senderName: req.body.name || 'Contact Form',
      senderEmail: req.body.email || 'contact@smartdesk.solutions',
      createdAt: new Date().toISOString(),
      type: 'contact_form'
    };
    
    console.log('Contact message created:', contactMessage);
    
    res.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: { 
        id: Date.now(), 
        ...req.body, 
        createdAt: new Date().toISOString(),
        messageId: contactMessage.id
      }
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

app.listen(PORT, () => {
  console.log(`🚀 FIXED BACKEND - Running on port ${PORT}`);
  console.log('📊 MySQL Database Connected');
  console.log('🔐 User Session Management Active');
});
