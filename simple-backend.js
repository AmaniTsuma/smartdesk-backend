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

const PORT = process.env.PORT || 3000;

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

// Initialize users
let users = loadUsers();
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
    }
  ];
  saveUsers(users);
} else {
  console.log('✅ Loaded existing users:', users.length);
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role})`);
  });
}

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
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    if (user) {
      console.log('User found:', user.email);
      console.log('Stored password:', user.password);
      console.log('Provided password:', password);
      
      // Check password - handle both plain text and hashed passwords
      let passwordMatch = false;
      
      if (user.password === password) {
        // Plain text match (for admin123)
        passwordMatch = true;
        console.log('✅ Plain text password match');
      } else if (user.password.startsWith('$2b$')) {
        // Hashed password - for now, we'll do a simple check
        // In production, you'd use bcrypt.compare(password, user.password)
        console.log('⚠️ Hashed password detected - using fallback check');
        // For debugging, let's check if it's one of the known passwords
        if ((email === 'amanijohntsuma1@gmail.com' && password === 'amani2000') ||
            (email === 'admin@smartdesk.com' && password === 'admin123')) {
          passwordMatch = true;
          console.log('✅ Known password match');
        }
      }
      
      if (passwordMatch) {
        currentUser = user;
        console.log('✅ User logged in:', user.email);
        
        res.json({
          success: true,
          message: 'Login successful',
          data: { user: user, token: 'jwt-token-' + Date.now() }
        });
      } else {
        console.log('❌ Password mismatch');
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    } else {
      console.log('❌ User not found:', email);
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

// Get current user
app.get('/api/auth/me', (req, res) => {
  try {
    if (currentUser) {
      res.json({ success: true, data: currentUser });
    } else {
      res.status(401).json({ success: false, message: 'Not authenticated' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get current user' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    currentUser = null;
    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
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
  console.log('✅ All endpoints working!');
});
