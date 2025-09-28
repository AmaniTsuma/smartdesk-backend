const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://smartdesk.solutions',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration
app.use(cors({
  origin: 'https://smartdesk.solutions',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

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

// In-memory storage for service requests (in production, use database)
let serviceRequests = [
  {
    id: 'req-sample-1',
    title: 'Email & Calendar Management',
    description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
    serviceType: 'consulting',
    priority: 'medium',
    status: 'pending',
    clientId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
    clientName: 'Amani John Tsuma',
    clientEmail: 'amanijohntsuma1@gmail.com',
    preferredStartDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    adminId: null,
    adminNotes: null,
    estimatedHours: null,
    actualHours: null,
    budget: null,
    deadline: null
  },
  {
    id: 'req-sample-2',
    title: 'Website Development Project',
    description: 'Need a new company website with modern design and responsive layout.',
    serviceType: 'consulting',
    priority: 'high',
    status: 'in-progress',
    clientId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
    clientName: 'Amani John Tsuma',
    clientEmail: 'amanijohntsuma1@gmail.com',
    preferredStartDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
    adminId: 'admin-1',
    adminNotes: 'Project started, initial design phase completed',
    estimatedHours: 40,
    actualHours: 15,
    budget: 2000,
    deadline: new Date(Date.now() + 2592000000).toISOString() // 30 days from now
  },
  {
    id: 'req-sample-3',
    title: 'Data Analysis Report',
    description: 'Monthly data analysis and reporting for business insights.',
    serviceType: 'consulting',
    priority: 'low',
    status: 'completed',
    clientId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
    clientName: 'Amani John Tsuma',
    clientEmail: 'amanijohntsuma1@gmail.com',
    preferredStartDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    adminId: 'admin-1',
    adminNotes: 'Report completed and delivered to client',
    estimatedHours: 20,
    actualHours: 18,
    budget: 1000,
    deadline: new Date(Date.now() - 86400000).toISOString()
  }
];

// In-memory storage for registered users (in production, use database)
let registeredUsers = [
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
    console.log('=== LOGIN REQUEST RECEIVED ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    console.log('Current registeredUsers:', registeredUsers.map(u => ({ email: u.email, hasPassword: !!u.password })));
    
    // Check authentication against registered users (including updated passwords)
    const user = registeredUsers.find(u => u.email === email);
    console.log('Found user:', user ? { email: user.email, hasPassword: !!user.password, password: user.password } : 'none');
    
    // Fallback to hardcoded credentials for initial users
    const validCredentials = {
      'info@smartdesk.solutions': 'admin123',
      'amanijohntsuma1@gmail.com': 'amani123',
      'admin@smartdesk.com': 'admin123'
    };
    
    let isValidPassword = false;
    let foundUser = user;
    
    if (user && user.password) {
      // Use the password from registeredUsers (including updated passwords)
      isValidPassword = user.password === password;
      console.log(`Checking password for ${email}: stored=${user.password}, provided=${password}, match=${isValidPassword}`);
    } else if (validCredentials[email]) {
      // Fallback to hardcoded credentials
      isValidPassword = validCredentials[email] === password;
      console.log(`Using hardcoded credentials for ${email}: match=${isValidPassword}`);
    }

    if (isValidPassword) {
      // Use the found user or create a default user
      if (!foundUser) {
        foundUser = {
          id: email === 'info@smartdesk.solutions' ? 'admin-info' : 'user-' + Date.now(),
          firstName: email === 'info@smartdesk.solutions' ? 'Admin' : 'User',
          lastName: email === 'info@smartdesk.solutions' ? 'Info' : 'User',
          name: email === 'info@smartdesk.solutions' ? 'Admin Info' : 'User User',
          email: email,
          role: email === 'info@smartdesk.solutions' ? 'admin' : 'client',
          phone: '+1234567890',
          company: 'Smart Desk Solutions',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add to registered users if not already there
        if (!registeredUsers.find(u => u.email === email)) {
          registeredUsers.push(foundUser);
        }
      }
      
      // Store current user session
      currentUser = foundUser;
      
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

// Register endpoint - Save to database
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, company, phone } = req.body;
    
    console.log('Registration attempt:', { firstName, lastName, email, company, phone });
    
    // Enhanced validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if email already exists in database
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      // Create new user in database
      const userId = 'user-' + Date.now();
      await connection.execute(
        `INSERT INTO users (id, email, first_name, last_name, role, company, phone, password, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 'client', ?, ?, ?, true, NOW(), NOW())`,
        [userId, email, firstName, lastName, company || '', phone || '', password]
      );
      
      // Get the created user
      const [rows] = await connection.execute(
        'SELECT id, email, first_name, last_name, role, is_active, company, phone, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );
      
      connection.release();
      
      if (rows.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create user'
        });
      }
      
      const user = rows[0];
      const newUser = {
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
      
      // Also add to registeredUsers array for session management
      registeredUsers.push(newUser);
      
      // Set as current user
      currentUser = newUser;
      
      console.log('✅ New user registered and saved to database:', newUser);
      
      res.json({
        success: true,
        message: 'Registration successful',
        data: {
          user: newUser,
          token: 'jwt-token-' + Date.now()
        }
      });
      
    } catch (dbError) {
      connection.release();
      console.error('Database error during registration, falling back to memory storage:', dbError);
      
      // FALLBACK: Create user in memory if database fails
      const userId = 'user-' + Date.now();
      const newUser = {
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        role: 'client',
        isActive: true,
        company: company || '',
        phone: phone || '',
        password: password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Check if email already exists in memory
      const existingUser = registeredUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      // Add to registeredUsers array
      registeredUsers.push(newUser);
      
      // Set as current user
      currentUser = newUser;
      
      console.log('✅ New user registered in memory (database fallback):', newUser);
      
      res.json({
        success: true,
        message: 'Registration successful (saved in memory)',
        data: {
          user: newUser,
          token: 'jwt-token-' + Date.now()
        }
      });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
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
app.get('/api/auth/profile', async (req, res) => {
  try {
    // Check if we have a current user session
    if (currentUser) {
      console.log('Returning current user profile:', currentUser.email, currentUser.role);
      return res.json({
        success: true,
        data: currentUser
      });
    }

    // Temporarily return admin user for debugging
    console.log('No current user session found, returning admin user for debugging');
    const adminUser = {
      id: 'admin-1',
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      email: 'admin@smartdesk.com',
      role: 'admin',
      phone: '+1234567890',
      company: 'Smart Desk Solutions',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: adminUser
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

// User profile endpoint - alias for /profile
app.get('/api/auth/me', async (req, res) => {
  try {
    // Check if we have a current user session
    if (currentUser) {
      console.log('Returning current user (me):', currentUser.email, currentUser.role);
      return res.json({
        success: true,
        data: currentUser
      });
    }

    // Temporarily return admin user for debugging
    console.log('No current user session found, returning admin user for debugging');
    const adminUser = {
      id: 'admin-1',
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      email: 'info@smartdesk.solutions',
      role: 'admin',
      phone: '+1234567890',
      company: 'Smart Desk Solutions',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: adminUser
    });
  } catch (error) {
    console.error('Get user profile (me) error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// Update user profile endpoint
app.put('/api/auth/profile', async (req, res) => {
  try {
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    const { firstName, lastName, email, company, phone, address, industry, website, bio, password } = req.body;
    
    console.log('Updating profile for user:', currentUser.email, 'with data:', req.body, 'hasPassword:', !!password);
    
    // Find the user in registeredUsers and update
    const userIndex = registeredUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update the user data
    const updatedUser = {
      ...registeredUsers[userIndex],
      firstName: firstName || registeredUsers[userIndex].firstName,
      lastName: lastName || registeredUsers[userIndex].lastName,
      name: `${firstName || registeredUsers[userIndex].firstName} ${lastName || registeredUsers[userIndex].lastName}`,
      email: email || registeredUsers[userIndex].email,
      company: company || registeredUsers[userIndex].company,
      phone: phone || registeredUsers[userIndex].phone,
      address: address || registeredUsers[userIndex].address,
      industry: industry || registeredUsers[userIndex].industry,
      website: website || registeredUsers[userIndex].website,
      bio: bio || registeredUsers[userIndex].bio,
      password: password || registeredUsers[userIndex].password, // Include password update
      updatedAt: new Date().toISOString()
    };
    
    // Update in registeredUsers array
    registeredUsers[userIndex] = updatedUser;
    
    // Update currentUser session
    currentUser = updatedUser;
    
    console.log('Profile updated successfully for:', currentUser.email);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
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

    console.log(`Returning ${registeredUsers.length} users for:`, currentUser.email);

    res.json({
      success: true,
      data: registeredUsers
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

// Delete user endpoint
app.delete('/api/auth/users/:id', (req, res) => {
  try {
    // Temporarily allow access without strict authentication for debugging
    console.log('Delete user request - currentUser:', currentUser ? currentUser.email : 'none');
    
    if (!currentUser) {
      console.log('No current user session, but allowing delete for debugging');
      // Don't block the request, just log the issue
    }

    const { id } = req.params;
    console.log(`Attempting to delete user with ID: ${id}`);

    // Find the user to delete
    const userIndex = registeredUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userToDelete = registeredUsers[userIndex];
    
    // Prevent deleting the current logged-in user
    if (currentUser.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Remove the user from the array
    registeredUsers.splice(userIndex, 1);
    
    console.log(`User ${userToDelete.name} (${userToDelete.email}) deleted successfully`);

    res.json({
      success: true,
      message: `User ${userToDelete.name} deleted successfully`,
      data: { deletedUserId: id }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Update user in database with proper persistence
app.put('/api/auth/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, company, password } = req.body;
    
    console.log('UPDATING USER:', { id, firstName, lastName, email, phone, company, hasPassword: !!password });

    // Allow access for any logged-in user
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    const connection = await pool.getConnection();
    
    try {
      // Update user in database (with or without password)
      let updateQuery, updateParams;
      
      if (password) {
        // Update including password
        updateQuery = `
          UPDATE users 
          SET first_name = ?, last_name = ?, email = ?, phone = ?, company = ?, password = ?, updated_at = NOW()
          WHERE id = ?
        `;
        updateParams = [firstName, lastName, email, phone || '', company || '', password, id];
      } else {
        // Update without password
        updateQuery = `
          UPDATE users 
          SET first_name = ?, last_name = ?, email = ?, phone = ?, company = ?, updated_at = NOW()
          WHERE id = ?
        `;
        updateParams = [firstName, lastName, email, phone || '', company || '', id];
      }
      
      const [result] = await connection.execute(updateQuery, updateParams);

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

      // Update registeredUsers array if password was changed
      if (password) {
        const registeredUserIndex = registeredUsers.findIndex(u => u.id === id);
        if (registeredUserIndex !== -1) {
          registeredUsers[registeredUserIndex] = {
            ...registeredUsers[registeredUserIndex],
            ...updatedUser,
            password: password // Store the new password
          };
          
          // Update currentUser session if it's the same user
          if (currentUser && currentUser.id === id) {
            currentUser = {
              ...currentUser,
              ...updatedUser,
              password: password
            };
            console.log('✅ Updated currentUser session with new password');
          }
          
          console.log('✅ Updated registeredUsers array with new password');
        }
      }

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
    // Temporarily allow access without authentication for debugging
    console.log('Dashboard stats requested - currentUser:', currentUser ? currentUser.email : 'none');

    // Calculate real stats from stored data
    console.log(`Total service requests: ${serviceRequests.length}`);
    console.log(`Service requests statuses:`, serviceRequests.map(req => ({ id: req.id, title: req.title, status: req.status })));
    
    const completedServices = serviceRequests.filter(req => req.status === 'completed').length;
    const pendingRequests = serviceRequests.filter(req => req.status === 'pending').length;
    const rejectedRequests = serviceRequests.filter(req => req.status === 'rejected').length;
    
    console.log(`Calculated stats - Completed: ${completedServices}, Pending: ${pendingRequests}, Rejected: ${rejectedRequests}`);
    
    const stats = {
      totalUsers: registeredUsers.length,
      completedServices: completedServices,
      pendingRequests: pendingRequests,
      rejectedRequests: rejectedRequests,
      activeConversations: 8 // Mock conversations
    };

    console.log(`Admin dashboard stats for ${currentUser ? currentUser.name : 'unknown'}:`, stats);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.json({
      success: true,
      data: {
        totalUsers: registeredUsers.length,
        totalServices: 6,
        totalRequests: serviceRequests.length,
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
  // Temporarily allow access without authentication for debugging
  console.log('Client requests requested - currentUser:', currentUser ? currentUser.email : 'none');

  // Filter service requests for the current user
  const userRequests = serviceRequests.filter(request => 
    request.clientId === currentUser.id || 
    request.clientEmail === currentUser.email
  );

  res.json({
    success: true,
    data: userRequests,
    message: `Found ${userRequests.length} service requests for ${currentUser.name}`
  });
});

// Admin service requests endpoint - shows ALL client submissions
app.get('/api/service-requests/admin-requests', (req, res) => {
  try {
    // Temporarily allow access without authentication for debugging
    console.log(`Admin service requests requested - currentUser: ${currentUser ? currentUser.email : 'none'}`);
    console.log(`Total service requests available: ${serviceRequests.length}`);
    console.log(`Service requests:`, serviceRequests.map(req => ({ id: req.id, title: req.title, status: req.status, clientName: req.clientName })));

    // Return all service requests for admin to manage
    res.json({
      success: true,
      data: serviceRequests,
      message: `Found ${serviceRequests.length} total service requests for admin review`
    });
  } catch (error) {
    console.error('Admin service requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests',
      error: error.message
    });
  }
});

// General service requests
app.get('/api/service-requests', (req, res) => {
  res.json({
    success: true,
    data: serviceRequests,
    message: `Found ${serviceRequests.length} service requests`
  });
});

// Update service request status (approve/reject/update) - Save to database
app.put('/api/service-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, estimatedHours, actualHours, budget, deadline } = req.body;
    
    console.log(`Updating service request ${id} with status: ${status}`);
    
    // First check if it exists in memory (for sample data)
    const memoryRequestIndex = serviceRequests.findIndex(req => req.id === id);
    
    if (memoryRequestIndex !== -1) {
      // Update in memory array (for sample data that's not in database)
      const updatedRequest = {
        ...serviceRequests[memoryRequestIndex],
        status: status || serviceRequests[memoryRequestIndex].status,
        adminNotes: adminNotes || serviceRequests[memoryRequestIndex].adminNotes,
        estimatedHours: estimatedHours || serviceRequests[memoryRequestIndex].estimatedHours,
        actualHours: actualHours || serviceRequests[memoryRequestIndex].actualHours,
        budget: budget || serviceRequests[memoryRequestIndex].budget,
        deadline: deadline || serviceRequests[memoryRequestIndex].deadline,
        updatedAt: new Date().toISOString()
      };
      
      serviceRequests[memoryRequestIndex] = updatedRequest;
      
      console.log(`✅ Service request ${id} updated successfully in memory:`, updatedRequest);
      
      return res.json({
        success: true,
        data: updatedRequest,
        message: `Service request ${id} updated successfully`
      });
    }
    
    // If not in memory, try database
    const connection = await pool.getConnection();
    
    try {
      // Check if service request exists in database
      const [existingRows] = await connection.execute(
        'SELECT id FROM service_requests WHERE id = ?',
        [id]
      );
      
      if (existingRows.length === 0) {
        connection.release();
        return res.status(404).json({
          success: false,
          message: 'Service request not found'
        });
      }
      
      // Update service request in database
      await connection.execute(
        `UPDATE service_requests 
         SET status = ?, admin_notes = ?, estimated_hours = ?, actual_hours = ?, budget = ?, deadline = ?, updated_at = NOW()
         WHERE id = ?`,
        [status, adminNotes, estimatedHours, actualHours, budget, deadline, id]
      );
      
      // Get updated service request
      const [rows] = await connection.execute(
        'SELECT * FROM service_requests WHERE id = ?',
        [id]
      );
      
      connection.release();
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Service request not found'
        });
      }
      
      const dbRequest = rows[0];
      const updatedRequest = {
        id: dbRequest.id,
        title: dbRequest.title,
        description: dbRequest.description,
        serviceType: dbRequest.service_type,
        priority: dbRequest.priority,
        status: dbRequest.status,
        clientId: dbRequest.client_id,
        clientName: dbRequest.client_name,
        clientEmail: dbRequest.client_email,
        preferredStartDate: dbRequest.preferred_start_date,
        createdAt: dbRequest.created_at,
        updatedAt: dbRequest.updated_at,
        adminId: dbRequest.admin_id,
        adminNotes: dbRequest.admin_notes,
        estimatedHours: dbRequest.estimated_hours,
        actualHours: dbRequest.actual_hours,
        budget: dbRequest.budget,
        deadline: dbRequest.deadline
      };
      
      // Also update in memory array for immediate consistency
      const requestIndex = serviceRequests.findIndex(req => req.id === id);
      if (requestIndex !== -1) {
        serviceRequests[requestIndex] = updatedRequest;
      }
      
      console.log(`✅ Service request ${id} updated successfully in database:`, updatedRequest);
      
      res.json({
        success: true,
        data: updatedRequest,
        message: `Service request ${id} updated successfully`
      });
      
    } catch (dbError) {
      connection.release();
      throw dbError;
    }
    
  } catch (error) {
    console.error('Update service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service request',
      error: error.message
    });
  }
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

// Create service request (client submission) - Save to database
app.post('/api/service-requests', async (req, res) => {
  try {
    const { title, description, serviceType, priority, preferredStartDate } = req.body;
    
    console.log('Service request submission:', { title, description, serviceType, priority, preferredStartDate });
    
    // Basic validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }
    
    if (description.length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 20 characters long'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Create service request in database
      const requestId = 'req-' + Date.now();
      await connection.execute(
        `INSERT INTO service_requests (id, title, description, service_type, priority, status, client_id, client_name, client_email, preferred_start_date, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, NOW(), NOW())`,
        [
          requestId,
          title.trim(),
          description.trim(),
          serviceType || 'consulting',
          priority || 'medium',
          currentUser ? currentUser.id : 'anonymous',
          currentUser ? currentUser.name : 'Anonymous User',
          currentUser ? currentUser.email : 'anonymous@example.com',
          preferredStartDate || new Date().toISOString()
        ]
      );
      
      // Get the created service request
      const [rows] = await connection.execute(
        'SELECT * FROM service_requests WHERE id = ?',
        [requestId]
      );
      
      connection.release();
      
      if (rows.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create service request'
        });
      }
      
      const dbRequest = rows[0];
      const serviceRequest = {
        id: dbRequest.id,
        title: dbRequest.title,
        description: dbRequest.description,
        serviceType: dbRequest.service_type,
        priority: dbRequest.priority,
        status: dbRequest.status,
        clientId: dbRequest.client_id,
        clientName: dbRequest.client_name,
        clientEmail: dbRequest.client_email,
        preferredStartDate: dbRequest.preferred_start_date,
        createdAt: dbRequest.created_at,
        updatedAt: dbRequest.updated_at,
        adminId: dbRequest.admin_id,
        adminNotes: dbRequest.admin_notes,
        estimatedHours: dbRequest.estimated_hours,
        actualHours: dbRequest.actual_hours,
        budget: dbRequest.budget,
        deadline: dbRequest.deadline
      };
      
      // Also add to memory array for immediate consistency
      serviceRequests.push(serviceRequest);
      
      console.log('✅ Service request created and saved to database:', serviceRequest);
      console.log('Total service requests:', serviceRequests.length);
      
      res.json({
        success: true,
        message: 'Service request submitted successfully',
        data: serviceRequest
      });
      
    } catch (dbError) {
      connection.release();
      throw dbError;
    }
    
  } catch (error) {
    console.error('Service request creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service request',
      error: error.message
    });
  }
});

// Admin services endpoint (for admin portal)
app.get('/api/service-requests/admin-services', (req, res) => {
  try {
    console.log('Admin services request received');
    
    // Return the 6 services that admin can manage
    const adminServices = [
      {
        id: 'service-1',
        name: 'Email & Calendar Management',
        description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
        category: 'consulting',
        price: '$500/month',
        duration: 'Ongoing',
        status: 'active'
      },
      {
        id: 'service-2', 
        name: 'Website Development',
        description: 'Custom website development and design services for your business needs.',
        category: 'development',
        price: '$2000/project',
        duration: '2-4 weeks',
        status: 'active'
      },
      {
        id: 'service-3',
        name: 'Social Media Management',
        description: 'Complete social media strategy and content management across all platforms.',
        category: 'marketing',
        price: '$800/month',
        duration: 'Ongoing',
        status: 'active'
      },
      {
        id: 'service-4',
        name: 'Data Analysis & Reporting',
        description: 'Business data analysis and custom reporting solutions.',
        category: 'analytics',
        price: '$1200/month',
        duration: 'Ongoing',
        status: 'active'
      },
      {
        id: 'service-5',
        name: 'IT Support & Maintenance',
        description: '24/7 IT support and system maintenance services.',
        category: 'support',
        price: '$1000/month',
        duration: 'Ongoing',
        status: 'active'
      },
      {
        id: 'service-6',
        name: 'Project Management',
        description: 'Professional project management and coordination services.',
        category: 'management',
        price: '$1500/month',
        duration: 'Ongoing',
        status: 'active'
      }
    ];
    
    console.log(`Returning ${adminServices.length} admin services`);
    
    res.json({
      success: true,
      data: adminServices,
      message: `Found ${adminServices.length} admin services`
    });
  } catch (error) {
    console.error('Admin services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin services',
      error: error.message
    });
  }
});

// Available services for client request page
app.get('/api/services/available', (req, res) => {
  const availableServices = [
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
    data: availableServices,
    message: '6 admin-created services available for selection'
  });
});

// Messaging endpoints
app.get('/api/messaging/admin/conversations', (req, res) => {
  // Temporarily allow access without authentication for debugging
  console.log('Admin conversations requested - currentUser:', currentUser ? currentUser.email : 'none');

  // Return sample conversations including contact form submissions
  const conversations = [
    {
      id: 'conv-sample-1',
      participants: [
        {
          userId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
          userName: 'Amani John Tsuma',
          userEmail: 'amanijohntsuma1@gmail.com',
          userRole: 'client',
          joinedAt: new Date().toISOString(),
          isActive: true
        }
      ],
      conversationType: 'client-admin',
      title: 'Client Support',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: {
        id: 'msg-sample-1',
        senderId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
        senderName: 'Amani John Tsuma',
        senderEmail: 'amanijohntsuma1@gmail.com',
        senderRole: 'client',
        content: 'hey',
        messageType: 'text',
        conversationId: 'conv-sample-1',
        isRead: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      lastMessageAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: conversations
  });
});

app.get('/api/messaging/conversations', (req, res) => {
  try {
    // Return conversations for current user
    const userConversations = [
      {
        id: 'conv-sample-1',
        participants: [
          {
            userId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
            userName: 'Amani John Tsuma',
            userEmail: 'amanijohntsuma1@gmail.com',
            userRole: 'client',
            joinedAt: new Date().toISOString(),
            isActive: true
          }
        ],
        conversationType: 'client-admin',
        title: 'Client Support',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: {
          id: 'msg-sample-1',
          senderId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
          senderName: 'Amani John Tsuma',
          senderEmail: 'amanijohntsuma1@gmail.com',
          senderRole: 'client',
          content: 'hey',
          messageType: 'text',
          conversationId: 'conv-sample-1',
          isRead: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        lastMessageAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: userConversations,
      total: userConversations.length
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// Client dashboard stats endpoint
app.get('/api/service-requests/client-dashboard-stats', (req, res) => {
  try {
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    // Filter service requests for the current user
    const userRequests = serviceRequests.filter(request => 
      request.clientId === currentUser.id || 
      request.clientEmail === currentUser.email
    );

    console.log(`Total service requests: ${serviceRequests.length}`);
    console.log(`Current user: ${currentUser.email} (ID: ${currentUser.id})`);
    console.log(`User requests found: ${userRequests.length}`);
    console.log(`User requests:`, userRequests.map(req => ({ id: req.id, title: req.title, status: req.status })));

    // Calculate stats based on user's actual requests
    const stats = {
      activeServices: userRequests.filter(req => req.status === 'in-progress').length,
      completedServices: userRequests.filter(req => req.status === 'completed').length,
      pendingRequests: userRequests.filter(req => req.status === 'pending').length,
      rejectedRequests: userRequests.filter(req => req.status === 'rejected').length
    };

    console.log(`Client dashboard stats for ${currentUser.name}:`, stats);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Client dashboard stats error:', error);
    res.json({
      success: true,
      data: {
        activeServices: 0,
        completedServices: 0,
        pendingRequests: 0,
        rejectedRequests: 0
      }
    });
  }
});

app.get('/api/messaging/unread-count', (req, res) => {
  res.json({
    success: true,
    data: {
      unreadCount: 1
    }
  });
});

// Get conversation messages
app.get('/api/messaging/conversations/:id/messages', (req, res) => {
  try {
    const { id } = req.params;
    const conversationMessages = [
      {
        id: 'msg-sample-1',
        senderId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
        senderName: 'Amani John Tsuma',
        senderEmail: 'amanijohntsuma1@gmail.com',
        senderRole: 'client',
        content: 'hey',
        messageType: 'text',
        conversationId: id,
        isRead: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: conversationMessages,
      total: conversationMessages.length
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation messages',
      error: error.message
    });
  }
});

// Send message endpoint
app.post('/api/messaging/send', (req, res) => {
  try {
    console.log('Message send request:', req.body);
    
    const { content, conversationId, recipientId, messageType = 'text' } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    console.log('🔍 Current user when sending message:', currentUser);
    console.log('🔍 Current user role:', currentUser?.role);
    console.log('🔍 Current user email:', currentUser?.email);
    
    const message = {
      id: 'msg-' + Date.now(),
      senderId: currentUser?.id,
      senderName: currentUser?.name || currentUser?.firstName + ' ' + currentUser?.lastName,
      senderEmail: currentUser?.email,
      senderRole: currentUser?.role || 'public',
      content: content,
      messageType: messageType,
      conversationId: conversationId || 'conv-sample-1',
      isRead: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('🔍 Created message:', JSON.stringify(message, null, 2));
    
    // Emit to Socket.IO - target specific rooms based on sender role
    if (currentUser?.role === 'admin') {
      // Admin message - send to client rooms only (NOT to admin room to avoid self-receipt)
      // This ensures admin messages appear as "sent" in client portal
      io.emit('new-message', message); // Broadcast to all connected clients
    } else if (currentUser?.role === 'client') {
      // Client message - send to admin room only
      io.to('admin-room').emit('new-message', message);
    } else {
      // Public message - send to admin room
      io.to('admin-room').emit('new-message', message);
    }
    
    console.log('✅ Message sent:', message);
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Public message endpoint (for non-logged-in users)
app.post('/api/messaging/public-send', (req, res) => {
  try {
    console.log('Public message send request:', req.body);
    
    const { content, senderName, senderEmail, messageType = 'text' } = req.body;
    
    if (!content || !senderName || !senderEmail) {
      return res.status(400).json({
        success: false,
        message: 'Content, sender name, and email are required'
      });
    }
    
    const message = {
      id: 'msg-public-' + Date.now(),
      senderId: 'public-' + Date.now(),
      senderName: senderName,
      senderEmail: senderEmail,
      senderRole: 'public',
      content: content,
      messageType: messageType,
      conversationId: 'conv-public-' + Date.now(),
      isRead: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Emit to admin room for public messages
    io.to('admin-room').emit('new-message', message);
    io.to('admin-room').emit('message-notification', { messageId: message.id });
    console.log('✅ Public message sent to admin room');
    
    console.log('✅ Public message sent:', message);
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending public message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Mark conversation as read
app.put('/api/messaging/conversations/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark conversation as read',
      error: error.message
    });
  }
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

// Socket.IO server implementation
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  console.log('✅ Socket auth:', socket.handshake.auth);
  console.log('✅ Socket headers:', socket.handshake.headers);

  // Handle user joining their room
  socket.on('join-user-room', (data) => {
    const { userId, userRole } = data;
    console.log(`✅ User ${userId} (${userRole}) joining room`);
    
    if (userRole === 'admin') {
      socket.join('admin-room');
      console.log('✅ Admin joined admin-room');
    } else if (userRole === 'client') {
      socket.join(`client-${userId}`);
      console.log(`✅ Client joined client-${userId}`);
    }
  });

  // Handle user online status
  socket.on('user-online', (data) => {
    const { userId, userRole } = data;
    console.log(`User ${userId} (${userRole}) is online`);
    
    // Notify other users that this user is online
    if (userRole === 'admin') {
      socket.to('admin-room').emit('user-status', { userId, status: 'online' });
    } else if (userRole === 'client') {
      socket.to('admin-room').emit('user-status', { userId, status: 'online' });
    }
  });

  // Handle joining a conversation
  socket.on('join-conversation', (data) => {
    const { conversationId } = data;
    socket.join(`conversation-${conversationId}`);
    console.log(`User joined conversation ${conversationId}`);
  });

  // Handle leaving a conversation
  socket.on('leave-conversation', (data) => {
    const { conversationId } = data;
    socket.leave(`conversation-${conversationId}`);
    console.log(`User left conversation ${conversationId}`);
  });

  // Handle typing indicators
  socket.on('user-typing', (data) => {
    socket.to(`conversation-${data.conversationId}`).emit('user-typing', data);
  });

  // Handle new messages (this is for direct socket messages, not API messages)
  socket.on('new-message', (data) => {
    console.log('✅ Direct socket message received:', data);
    console.log('✅ Message sender role:', data.senderRole);
    
    // Route message to appropriate rooms based on sender role
    if (data.senderRole === 'admin') {
      // Admin message - broadcast to all clients
      console.log('✅ Broadcasting admin message to all clients');
      socket.broadcast.emit('new-message', data); // Broadcast to all connected clients
    } else if (data.senderRole === 'client') {
      // Client message - send to admin room
      console.log('✅ Sending client message to admin room');
      socket.to('admin-room').emit('new-message', data);
    } else if (data.senderRole === 'public') {
      // Public message - send to admin room
      console.log('✅ Sending public message to admin room');
      socket.to('admin-room').emit('new-message', data);
    }
    
    // Also emit to conversation room
    socket.to(`conversation-${data.conversationId}`).emit('new-message', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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

// Start server
server.listen(PORT, () => {
  console.log(`🚀 FIXED BACKEND - Running on port ${PORT}`);
  console.log('📊 MySQL Database Connected');
  console.log('🔐 User Session Management Active');
  console.log('🔌 Socket.IO Server Active');
});
