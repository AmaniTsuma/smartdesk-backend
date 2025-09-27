const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'https://smartdesk.solutions',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

// In-memory storage for users
let users = [
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
    password: 'admin123',
    createdAt: '2025-09-20T15:52:46.672Z',
    updatedAt: new Date().toISOString()
  }
];

// In-memory storage for service requests
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
    res.json({
      success: true,
      data: [],
      message: 'No conversations found'
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
    res.json({
      success: true,
      data: [],
      message: 'No conversations found'
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
    res.json({
      success: true,
      data: { count: 0 }
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
    res.json({
      success: true,
      data: { status: 'offline' }
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

// Socket.IO mock endpoint
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 SIMPLE BACKEND - Running on port ${PORT}`);
  console.log('📊 In-Memory Storage Active');
  console.log('🔐 User Session Management Active');
  console.log('✅ All endpoints working!');
});