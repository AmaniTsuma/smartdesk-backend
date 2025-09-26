const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'NEW BACKEND - 6 SERVICES READY!' });
});

app.get('/api/service-requests/public', (req, res) => {
  res.json({ 
    success: true, 
    data: [
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
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
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
    ], 
    message: '6 admin-created services available for booking' 
  });
});

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`NEW BACKEND server running on port ${PORT}`);
});
