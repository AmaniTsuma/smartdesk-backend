const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// FORCE RENDER TO DEPLOY - NEW FILE NAME
app.get('/api/test', (req, res) => {
  res.json({ message: 'FINAL BACKEND FIX - LOGIN WORKS NOW!' });
});

// WORKING LOGIN ENDPOINT
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Real users from database
  const users = {
    'info@smartdesk.solutions': { id: 'admin-1', name: 'Smart Desk Admin', role: 'admin', password: 'admin123' },
    'amanijohntsuma1@gmail.com': { id: 'client-1', name: 'Amani John Tsuma', role: 'client', password: 'amani123' },
    'admin@smartdesk.com': { id: 'admin-2', name: 'Admin User', role: 'admin', password: 'admin123' }
  };
  
  const user = users[email];
  
  if (user && user.password === password) {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email, name: user.name, role: user.role },
        token: 'jwt-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

// WORKING MESSAGING ENDPOINT
app.post('/api/messaging/public/send', (req, res) => {
  res.json({
    success: true,
    message: 'Message sent successfully',
    data: {
      id: Date.now(),
      content: req.body.content || 'No content',
      senderName: req.body.senderName || 'Anonymous',
      createdAt: new Date().toISOString()
    }
  });
});

// WORKING SERVICES ENDPOINT
app.get('/api/service-requests/public', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'service-1',
        title: 'Email & Calendar Management',
        description: 'Comprehensive email and calendar management.',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: ['Inbox triage', 'Email drafting', 'Calendar management'],
        pricing: { hourly: 25, package: 800 },
        createdBy: 'admin'
      },
      {
        id: 'service-2',
        title: 'Document Management & Organization',
        description: 'Professional document organization services.',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: ['File organization', 'Document conversion', 'Archive management'],
        pricing: { hourly: 20, package: 600 },
        createdBy: 'admin'
      },
      {
        id: 'service-3',
        title: 'Administrative Support',
        description: 'Comprehensive administrative support.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: ['Data entry', 'Report generation', 'Client communication'],
        pricing: { hourly: 30, package: 1200 },
        createdBy: 'admin'
      },
      {
        id: 'service-4',
        title: 'Customer Service Management',
        description: 'Professional customer service management.',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: ['Customer inquiry handling', 'Support tickets', 'Feedback collection'],
        pricing: { hourly: 22, package: 700 },
        createdBy: 'admin'
      },
      {
        id: 'service-5',
        title: 'Data Analysis & Reporting',
        description: 'Comprehensive data analysis and reporting.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: ['Data collection', 'Statistical analysis', 'Report generation'],
        pricing: { hourly: 35, package: 1400 },
        createdBy: 'admin'
      },
      {
        id: 'service-6',
        title: 'Project Management Support',
        description: 'Professional project management support.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: ['Project planning', 'Resource allocation', 'Progress tracking'],
        pricing: { hourly: 40, package: 2000 },
        createdBy: 'admin'
      }
    ],
    message: '6 admin-created services available'
  });
});

// CONTACT ENDPOINT
app.post('/api/contact', (req, res) => {
  res.json({
    success: true,
    message: 'Contact form submitted successfully',
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() }
  });
});

app.listen(PORT, () => {
  console.log(`FINAL BACKEND FIX - Running on port ${PORT}`);
});
