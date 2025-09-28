const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

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

// Middleware
app.use(cors({
  origin: 'https://smartdesk.solutions',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

// File-based persistence functions
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SERVICE_REQUESTS_FILE = path.join(DATA_DIR, 'service-requests.json');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load data from files
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [];
}

function saveUsers(usersArray) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersArray, null, 2));
    console.log('✅ Users saved to file');
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

function loadServiceRequests() {
  try {
    if (fs.existsSync(SERVICE_REQUESTS_FILE)) {
      const data = fs.readFileSync(SERVICE_REQUESTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading service requests:', error);
  }
  return [];
}

function saveServiceRequests(requestsArray) {
  try {
    fs.writeFileSync(SERVICE_REQUESTS_FILE, JSON.stringify(requestsArray, null, 2));
    console.log('✅ Service requests saved to file');
  } catch (error) {
    console.error('Error saving service requests:', error);
  }
}

function loadConversations() {
  try {
    if (fs.existsSync(CONVERSATIONS_FILE)) {
      const data = fs.readFileSync(CONVERSATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
  return [];
}

function saveConversations(conversationsArray) {
  try {
    fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversationsArray, null, 2));
    console.log('✅ Conversations saved to file');
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
}

function loadMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
  return [];
}

function saveMessages(messagesArray) {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messagesArray, null, 2));
    console.log('✅ Messages saved to file');
  } catch (error) {
    console.error('Error saving messages:', error);
  }
}

// In-memory storage for users (with file persistence)
let users = loadUsers();

// If no users file exists, initialize with default users
if (users.length === 0) {
  users = [
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
      password: 'admin123',
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
      password: 'amani123',
      createdAt: '2025-09-20T12:29:41.597Z',
      updatedAt: new Date().toISOString()
    }
  ];
  saveUsers(users); // Save initial users to file
}

// In-memory storage for service requests (with file persistence)
let serviceRequests = loadServiceRequests();

// If no service requests file exists, initialize with default requests
if (serviceRequests.length === 0) {
  serviceRequests = [
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
      deadline: null,
      category: 'consulting',
      company: 'AFRETEF',
      phone: '0715896449'
    },
    {
      id: 'req-sample-2',
      title: 'Data Entry & Reporting',
      description: 'Accurate data handling and comprehensive weekly/monthly reports for informed business decisions.',
      serviceType: 'analytics',
      priority: 'high',
      status: 'in-progress',
      clientId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
      clientName: 'Amani John Tsuma',
      clientEmail: 'amanijohntsuma1@gmail.com',
      preferredStartDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminId: 'admin-1',
      adminNotes: 'Initial setup complete, awaiting client feedback.',
      estimatedHours: 40,
      actualHours: 15,
      budget: 2000,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'analytics',
      company: 'AFRETEF',
      phone: '0715896449'
    },
    {
      id: 'req-sample-3',
      title: 'Bookkeeping & Invoicing',
      description: 'Professional expense tracking, invoice management, and financial reconciliation services.',
      serviceType: 'finance',
      priority: 'low',
      status: 'completed',
      clientId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
      clientName: 'Amani John Tsuma',
      clientEmail: 'amanijohntsuma1@gmail.com',
      preferredStartDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminId: 'admin-1',
      adminNotes: 'Project completed successfully',
      estimatedHours: 20,
      actualHours: 18,
      budget: 1000,
      deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'finance',
      company: 'AFRETEF',
      phone: '0715896449'
    }
  ];
  saveServiceRequests(serviceRequests); // Save initial service requests to file
}
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
    deadline: null,
    category: 'consulting',
    company: 'AFRETEF',
    phone: '0715896449'
  },
  {
    id: 'req-sample-2',
    title: 'Data Entry & Reporting',
    description: 'Accurate data handling and comprehensive weekly/monthly reports for informed business decisions.',
    serviceType: 'analytics',
    priority: 'high',
    status: 'in-progress',
    clientId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
    clientName: 'Amani John Tsuma',
    clientEmail: 'amanijohntsuma1@gmail.com',
    preferredStartDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    adminId: 'admin-1',
    adminNotes: 'Project approved and in development phase',
    estimatedHours: 40,
    actualHours: 15,
    budget: 2000,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req-sample-3',
    title: 'Bookkeeping & Invoicing',
    description: 'Professional expense tracking, invoice management, and financial reconciliation services.',
    serviceType: 'finance',
    priority: 'low',
    status: 'completed',
    clientId: '59fe66a6-2f50-4272-b284-fbb3da05d9a0',
    clientName: 'Amani John Tsuma',
    clientEmail: 'amanijohntsuma1@gmail.com',
    preferredStartDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    adminId: 'admin-1',
    adminNotes: 'Project completed successfully',
    estimatedHours: 20,
    actualHours: 18,
    budget: 800,
    deadline: new Date(Date.now() - 86400000).toISOString()
  }
];

// Current user session
let currentUser = null;

// Basic routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'SIMPLE BACKEND - All endpoints working!' });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    console.log('=== LOGIN REQUEST RECEIVED ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      currentUser = user;
      console.log('✅ User logged in:', user);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user,
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

// Registration endpoint
app.post('/api/auth/register', (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST RECEIVED ===');
    console.log('Request body:', req.body);
    
    const { firstName, lastName, email, password, company, phone } = req.body;
    
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
    
    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Create new user
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
    
    // Add to users array
    users.push(newUser);
    
    // Save users to file
    saveUsers(users);
    
    // Set as current user
    currentUser = newUser;
    
    console.log('✅ New user registered successfully:', newUser);
    
    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: newUser,
        token: 'jwt-token-' + Date.now()
      }
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

// User profile endpoint
app.get('/api/auth/profile', (req, res) => {
  try {
    if (currentUser) {
      console.log('Returning current user profile:', currentUser.email, currentUser.role);
      return res.json({
        success: true,
        data: currentUser
      });
    }

    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  try {
    if (currentUser) {
      res.json({
        success: true,
        data: currentUser
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Update profile endpoint
app.put('/api/auth/profile', (req, res) => {
  try {
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    const { firstName, lastName, email, company, phone, address, industry, website, bio, password } = req.body;
    
    console.log('Updating profile for user:', currentUser.email, 'with data:', req.body, 'hasPassword:', !!password);
    
    // Find the user in users array and update
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update the user data
    const updatedUser = {
      ...users[userIndex],
      firstName: firstName || users[userIndex].firstName,
      lastName: lastName || users[userIndex].lastName,
      name: `${firstName || users[userIndex].firstName} ${lastName || users[userIndex].lastName}`,
      email: email || users[userIndex].email,
      company: company || users[userIndex].company,
      phone: phone || users[userIndex].phone,
      address: address || users[userIndex].address,
      industry: industry || users[userIndex].industry,
      website: website || users[userIndex].website,
      bio: bio || users[userIndex].bio,
      password: password || users[userIndex].password,
      updatedAt: new Date().toISOString()
    };
    
    // Update in users array
    users[userIndex] = updatedUser;
    
    // Update currentUser session
    currentUser = updatedUser;
    
    console.log('✅ User profile updated successfully:', updatedUser);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get all users
app.get('/api/auth/users', (req, res) => {
  try {
    console.log('Fetching users, current user:', currentUser?.email);
    
    res.json({
      success: true,
      data: users,
      message: `Found ${users.length} users`
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
    const { id } = req.params;
    console.log('Delete user request for ID:', id);
    
    // Find user index
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove user
    const deletedUser = users.splice(userIndex, 1)[0];
    
    // Save users to file
    saveUsers(users);
    
    console.log('✅ User deleted successfully:', deletedUser.email);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser
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

// Update user endpoint
app.put('/api/auth/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, company, phone, password } = req.body;
    
    console.log(`Updating user ${id} with data:`, req.body);
    
    // Find user index
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user data
    const updatedUser = {
      ...users[userIndex],
      firstName: firstName || users[userIndex].firstName,
      lastName: lastName || users[userIndex].lastName,
      name: `${firstName || users[userIndex].firstName} ${lastName || users[userIndex].lastName}`,
      email: email || users[userIndex].email,
      role: role || users[userIndex].role,
      company: company || users[userIndex].company,
      phone: phone || users[userIndex].phone,
      password: password || users[userIndex].password,
      updatedAt: new Date().toISOString()
    };
    
    // Update in users array
    users[userIndex] = updatedUser;
    
    // Update currentUser if it's the same user
    if (currentUser && currentUser.id === id) {
      currentUser = updatedUser;
    }
    
    console.log('✅ User updated successfully:', updatedUser);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Service requests endpoints
app.get('/api/service-requests/public', (req, res) => {
  try {
    const adminServices = [
      {
        id: 'service-1',
        name: 'Email & Calendar Management',
        description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
        category: 'consulting',
        price: '$500/month',
        duration: 'Ongoing',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-2', 
        name: 'Data Entry & Reporting',
        description: 'Accurate data handling and comprehensive weekly/monthly reports for informed business decisions.',
        category: 'analytics',
        price: '$1200/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-3',
        name: 'Bookkeeping & Invoicing',
        description: 'Professional expense tracking, invoice management, and financial reconciliation services.',
        category: 'finance',
        price: '$600/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-4',
        name: 'Document Preparation',
        description: 'Professional document creation including contracts, presentations, and spreadsheets.',
        category: 'documentation',
        price: '$1200/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-5',
        name: 'Travel & Meeting Coordination',
        description: 'Complete travel planning and meeting coordination including itineraries, bookings, and logistics.',
        category: 'coordination',
        price: '$800/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-6',
        name: 'Customer Service Support',
        description: 'Professional customer service management including email/chat handling and FAQ management.',
        category: 'support',
        price: '$700/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      }
    ];
    
    res.json({
      success: true,
      data: adminServices,
      message: `Found ${adminServices.length} available services`
    });
  } catch (error) {
    console.error('Public services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public services',
      error: error.message
    });
  }
});

// Dashboard stats endpoint
app.get('/api/auth/dashboard-stats', (req, res) => {
  try {
    const stats = {
      totalUsers: users.length,
      totalServiceRequests: serviceRequests.length,
      pendingRequests: serviceRequests.filter(req => req.status === 'pending').length,
      completedRequests: serviceRequests.filter(req => req.status === 'completed').length,
      rejectedRequests: serviceRequests.filter(req => req.status === 'rejected').length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

// Admin services endpoint
app.get('/api/service-requests/admin-services', (req, res) => {
  try {
    console.log('Admin services request received');
    
    const adminServices = [
      {
        id: 'service-1',
        name: 'Email & Calendar Management',
        description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
        category: 'consulting',
        price: '$500/month',
        duration: 'Ongoing',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-2', 
        name: 'Data Entry & Reporting',
        description: 'Accurate data handling and comprehensive weekly/monthly reports for informed business decisions.',
        category: 'analytics',
        price: '$1200/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-3',
        name: 'Bookkeeping & Invoicing',
        description: 'Professional expense tracking, invoice management, and financial reconciliation services.',
        category: 'finance',
        price: '$600/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-4',
        name: 'Document Preparation',
        description: 'Professional document creation including contracts, presentations, and spreadsheets.',
        category: 'documentation',
        price: '$1200/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-5',
        name: 'Travel & Meeting Coordination',
        description: 'Complete travel planning and meeting coordination including itineraries, bookings, and logistics.',
        category: 'coordination',
        price: '$800/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'service-6',
        name: 'Customer Service Support',
        description: 'Professional customer service management including email/chat handling and FAQ management.',
        category: 'support',
        price: '$700/month',
        duration: 'Ongoing',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
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

// Client service requests endpoint
app.get('/api/service-requests/client-requests', (req, res) => {
  try {
    const clientRequests = serviceRequests.filter(req => req.clientId === currentUser?.id);
    res.json({
      success: true,
      data: clientRequests,
      message: `Found ${clientRequests.length} service requests`
    });
  } catch (error) {
    console.error('Client requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client requests',
      error: error.message
    });
  }
});

// Admin service requests endpoint
app.get('/api/service-requests/admin-requests', (req, res) => {
  try {
    console.log('Admin service requests request received');
    res.json({
      success: true,
      data: serviceRequests,
      message: `Found ${serviceRequests.length} service requests`
    });
  } catch (error) {
    console.error('Admin requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin requests',
      error: error.message
    });
  }
});

// Get all service requests
app.get('/api/service-requests', (req, res) => {
  try {
    res.json({
      success: true,
      data: serviceRequests,
      message: `Found ${serviceRequests.length} service requests`
    });
  } catch (error) {
    console.error('Service requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests',
      error: error.message
    });
  }
});

// Update service request endpoint
app.put('/api/service-requests/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, estimatedHours, actualHours, budget, deadline } = req.body;
    
    console.log(`Updating service request ${id} with status: ${status}`);
    
    // Find service request index
    const requestIndex = serviceRequests.findIndex(req => req.id === id);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }
    
    // Update service request
    const updatedRequest = {
      ...serviceRequests[requestIndex],
      status: status || serviceRequests[requestIndex].status,
      adminNotes: adminNotes || serviceRequests[requestIndex].adminNotes,
      estimatedHours: estimatedHours || serviceRequests[requestIndex].estimatedHours,
      actualHours: actualHours || serviceRequests[requestIndex].actualHours,
      budget: budget || serviceRequests[requestIndex].budget,
      deadline: deadline || serviceRequests[requestIndex].deadline,
      updatedAt: new Date().toISOString()
    };
    
    serviceRequests[requestIndex] = updatedRequest;
    
    // Save to file
    saveServiceRequests(serviceRequests);
    
    console.log(`✅ Service request ${id} updated successfully:`, updatedRequest);
    
    res.json({
      success: true,
      data: updatedRequest,
      message: `Service request ${id} updated successfully`
    });
    
  } catch (error) {
    console.error('Update service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service request',
      error: error.message
    });
  }
});

// Service request stats endpoint
app.get('/api/service-requests/stats/overview', (req, res) => {
  try {
    const stats = {
      total: serviceRequests.length,
      pending: serviceRequests.filter(req => req.status === 'pending').length,
      inProgress: serviceRequests.filter(req => req.status === 'in-progress').length,
      completed: serviceRequests.filter(req => req.status === 'completed').length,
      rejected: serviceRequests.filter(req => req.status === 'rejected').length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Service request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service request stats',
      error: error.message
    });
  }
});

// Create service request endpoint
app.post('/api/service-requests', (req, res) => {
  try {
    const { title, description, serviceType, priority, preferredStartDate } = req.body;
    
    console.log('Creating service request:', { title, description, serviceType, priority });
    
    // Create new service request
    const requestId = 'req-' + Date.now();
    const serviceRequest = {
      id: requestId,
      title: title.trim(),
      description: description.trim(),
      serviceType: serviceType || 'consulting',
      priority: priority || 'medium',
      status: 'pending',
      clientId: currentUser ? currentUser.id : 'anonymous',
      clientName: currentUser ? currentUser.name : 'Anonymous User',
      clientEmail: currentUser ? currentUser.email : 'anonymous@example.com',
      preferredStartDate: preferredStartDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminId: null,
      adminNotes: null,
      estimatedHours: null,
      actualHours: null,
      budget: null,
      deadline: null
    };
    
    // Add to service requests array
    serviceRequests.push(serviceRequest);
    
    // Save to file
    saveServiceRequests(serviceRequests);
    
    console.log('✅ Service request created successfully:', serviceRequest);
    
    res.json({
      success: true,
      data: serviceRequest,
      message: 'Service request created successfully'
    });
    
  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service request',
      error: error.message
    });
  }
});

// Available services endpoint
app.get('/api/services/available', (req, res) => {
  try {
    const availableServices = [
      {
        id: 'service-1',
        title: 'Email & Calendar Management',
        description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
        category: 'consulting',
        price: '$500/month',
        duration: 'Ongoing',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
          'Inbox triage and prioritization',
          'Email response drafting',
          'Calendar scheduling and management',
          'Meeting coordination',
          'Follow-up reminders',
          'Email template creation'
        ]
      },
      {
        id: 'service-2', 
        title: 'Data Entry & Reporting',
        description: 'Accurate data handling and comprehensive weekly/monthly reports for informed business decisions.',
        category: 'analytics',
        price: '$1200/month',
        duration: 'Ongoing',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
          'Data collection and validation',
          'Statistical analysis',
          'Report generation',
          'Trend identification',
          'Performance metrics',
          'Weekly and monthly summaries'
        ]
      },
      {
        id: 'service-3',
        title: 'Bookkeeping & Invoicing',
        description: 'Professional expense tracking, invoice management, and financial reconciliation services.',
        category: 'finance',
        price: '$600/month',
        duration: 'Ongoing',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
          'Expense tracking and categorization',
          'Invoice creation and management',
          'Financial reconciliation',
          'Payment processing',
          'Financial reporting',
          'Tax preparation support'
        ]
      },
      {
        id: 'service-4',
        title: 'Document Preparation',
        description: 'Professional document creation including contracts, presentations, and spreadsheets.',
        category: 'documentation',
        price: '$1200/month',
        duration: 'Ongoing',
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
          'Contract drafting and review',
          'Presentation creation',
          'Spreadsheet development',
          'Document formatting',
          'Template creation',
          'Document version control'
        ]
      },
      {
        id: 'service-5',
        title: 'Travel & Meeting Coordination',
        description: 'Complete travel planning and meeting coordination including itineraries, bookings, and logistics.',
        category: 'coordination',
        price: '$800/month',
        duration: 'Ongoing',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
          'Travel itinerary planning',
          'Flight and hotel bookings',
          'Meeting coordination',
          'Logistics management',
          'Expense tracking',
          'Travel documentation'
        ]
      },
      {
        id: 'service-6',
        title: 'Customer Service Support',
        description: 'Professional customer service management including email/chat handling and FAQ management.',
        category: 'support',
        price: '$700/month',
        duration: 'Ongoing',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
          'Customer inquiry handling',
          'Email and chat support',
          'FAQ management',
          'Support ticket management',
          'Client feedback collection',
          'Customer satisfaction surveys'
        ]
      }
    ];
    
    res.json({
      success: true,
      data: availableServices,
      message: `Found ${availableServices.length} available services`
    });
  } catch (error) {
    console.error('Available services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available services',
      error: error.message
    });
  }
});

// Messaging endpoints
app.get('/api/messaging/admin/conversations', (req, res) => {
  try {
    // Return all conversations for admin
    res.json({
      success: true,
      data: conversations,
      message: `Found ${conversations.length} conversations`
    });
  } catch (error) {
    console.error('Admin conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

app.get('/api/messaging/conversations', (req, res) => {
  try {
    // Return conversations for current user
    const userConversations = conversations.filter(conv => 
      conv.participants.some(p => p.userId === currentUser?.id)
    );
    
    res.json({
      success: true,
      data: userConversations,
      message: `Found ${userConversations.length} conversations`
    });
  } catch (error) {
    console.error('Conversations error:', error);
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
    const clientRequests = serviceRequests.filter(req => req.clientId === currentUser?.id);
    
    const stats = {
      activeServices: 6, // Total number of available services
      completedServices: clientRequests.filter(req => req.status === 'completed').length,
      pendingRequests: clientRequests.filter(req => req.status === 'pending').length,
      rejectedRequests: clientRequests.filter(req => req.status === 'rejected').length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Client dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client dashboard stats',
      error: error.message
    });
  }
});

app.get('/api/messaging/unread-count', (req, res) => {
  try {
    // Count unread messages for current user
    const unreadCount = messages.filter(msg => 
      msg.senderId !== currentUser?.id && !msg.isRead
    ).length;
    
    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

app.get('/api/messaging/status', (req, res) => {
  try {
    console.log('=== MESSAGING STATUS REQUEST ===');
    console.log('Returning online status');
    
    res.json({
      success: true,
      data: { status: 'online' }
    });
  } catch (error) {
    console.error('Messaging status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messaging status',
      error: error.message
    });
  }
});

app.post('/api/messaging/public/send', (req, res) => {
  try {
    console.log('Public message received:', req.body);
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: 'msg-' + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// In-memory storage for messages and conversations (with file persistence)
let conversations = loadConversations();

// If no conversations file exists, initialize with default conversation
if (conversations.length === 0) {
  conversations = [
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
      updatedAt: new Date().toISOString()
    }
  ];
  saveConversations(conversations);
}

let messages = loadMessages();

// If no messages file exists, initialize with default message
if (messages.length === 0) {
  messages = [
    {
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
    }
  ];
  
  // Update conversation with last message
  if (conversations.length > 0) {
    conversations[0].lastMessage = messages[0];
    conversations[0].lastMessageAt = messages[0].createdAt;
    saveConversations(conversations);
  }
  
  saveMessages(messages);
}

// Send message endpoint
app.post('/api/messaging/send', (req, res) => {
  try {
    console.log('Message send request:', req.body);
    
    const { content, conversationId, recipientId, messageType = 'text' } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Create or find conversation
    let conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      // Create new conversation
      conversation = {
        id: conversationId || `conv-${Date.now()}`,
        participants: [
          {
            userId: currentUser?.id || 'public-user',
            userName: currentUser?.name || 'Public User',
            userEmail: currentUser?.email || 'public@example.com',
            userRole: currentUser?.role || 'public',
            joinedAt: new Date().toISOString(),
            isActive: true
          }
        ],
        conversationType: currentUser?.role === 'admin' ? 'client-admin' : 'public-support',
        title: currentUser?.role === 'admin' ? 'Admin Support' : 'Client Support',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      conversations.push(conversation);
    }
    
    // Create message
    const message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'public-user',
      senderName: currentUser?.name || 'Public User',
      senderEmail: currentUser?.email || 'public@example.com',
      senderRole: currentUser?.role || 'public',
      content: content.trim(),
      messageType: messageType,
      conversationId: conversation.id,
      isRead: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    messages.push(message);
    
    // Update conversation with last message
    conversation.lastMessage = message;
    conversation.lastMessageAt = message.createdAt;
    conversation.updatedAt = new Date().toISOString();
    
    // Save to files
    saveMessages(messages);
    saveConversations(conversations);
    
    // Emit message via Socket.IO
    io.emit('new-message', message);
    
    // Send notification to admin if message is from client/public
    if (message.senderRole === 'client' || message.senderRole === 'public') {
      io.to('admin-room').emit('message-notification', {
        conversationId: conversation.id,
        message
      });
    }
    
    res.json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Get conversation messages
app.get('/api/messaging/conversations/:id/messages', (req, res) => {
  try {
    const { id } = req.params;
    const conversationMessages = messages.filter(msg => msg.conversationId === id);
    
    res.json({
      success: true,
      data: conversationMessages,
      message: `Found ${conversationMessages.length} messages`
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Mark conversation as read
app.put('/api/messaging/conversations/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    
    // Mark all messages in conversation as read
    messages.forEach(msg => {
      if (msg.conversationId === id && msg.senderId !== currentUser?.id) {
        msg.isRead = true;
      }
    });
    
    // Save to file
    saveMessages(messages);
    
    res.json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark conversation as read',
      error: error.message
    });
  }
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
  try {
    console.log('Contact form submission:', req.body);
    
    res.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: { 
        id: Date.now(), 
        ...req.body, 
        createdAt: new Date().toISOString()
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

// Socket.IO server implementation
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining their room
  socket.on('join-user-room', (data) => {
    const { userId, userRole } = data;
    const roomName = `user-${userId}`;
    socket.join(roomName);
    console.log(`User ${userId} (${userRole}) joined room: ${roomName}`);
    
    // Join admin room if user is admin
    if (userRole === 'admin') {
      socket.join('admin-room');
    }
    
    // Notify user is online
    socket.broadcast.emit('user-online', { userId, userRole });
  });

  // Handle joining conversation
  socket.on('join-conversation', (data) => {
    const { conversationId, userId } = data;
    socket.join(`conversation-${conversationId}`);
    console.log(`User ${userId} joined conversation: ${conversationId}`);
  });

  // Handle leaving conversation
  socket.on('leave-conversation', (data) => {
    const { conversationId, userId } = data;
    socket.leave(`conversation-${conversationId}`);
    console.log(`User ${userId} left conversation: ${conversationId}`);
  });

  // Handle user typing
  socket.on('user-typing', (data) => {
    const { conversationId, userId, isTyping } = data;
    socket.to(`conversation-${conversationId}`).emit('user-typing', {
      userId,
      isTyping
    });
  });

  // Handle new message
  socket.on('new-message', (message) => {
    console.log('New message received:', message);
    
    // Broadcast to conversation room
    socket.to(`conversation-${message.conversationId}`).emit('new-message', message);
    
    // Send notification to admin if message is from client/public
    if (message.senderRole === 'client' || message.senderRole === 'public') {
      socket.to('admin-room').emit('message-notification', {
        conversationId: message.conversationId,
        message
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 SIMPLE BACKEND - Running on port ${PORT}`);
  console.log('📊 In-Memory Storage Active');
  console.log('🔐 User Session Management Active');
  console.log('🔌 Socket.IO Server Active');
  console.log('✅ All endpoints working!');
});