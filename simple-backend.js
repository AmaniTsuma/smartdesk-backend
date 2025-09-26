const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Simple backend is working!' });
});

app.get('/api/service-requests/public', (req, res) => {
  // These are the admin-created services that clients can see and book
  const adminServices = [
    {
      id: 'service-1',
      title: 'Email & Calendar Management',
      description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
      serviceType: 'consulting',
      status: 'available',
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
        'Follow-up reminders',
        'Email template creation'
      ],
      pricing: {
        hourly: 25,
        package: 800
      },
      createdBy: 'admin'
    },
    {
      id: 'service-2',
      title: 'Document Management & Organization',
      description: 'Professional document organization and management services to streamline your business operations.',
      serviceType: 'consulting',
      status: 'available',
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
      },
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
      },
      createdBy: 'admin'
    },
    {
      id: 'service-4',
      title: 'Customer Service Management',
      description: 'Professional customer service management to enhance your client relationships and satisfaction.',
      serviceType: 'consulting',
      status: 'available',
      priority: 'high',
      estimatedHours: 35,
      actualHours: 18,
      startDate: '2024-02-01T00:00:00.000Z',
      endDate: '2024-03-01T00:00:00.000Z',
      createdAt: '2024-01-25T00:00:00.000Z',
      updatedAt: '2025-09-20T19:33:29.642Z',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      icon: '🎧',
      features: [
        'Customer inquiry handling',
        'Support ticket management',
        'Client feedback collection',
        'Service quality monitoring',
        'Customer satisfaction surveys'
      ],
      pricing: {
        hourly: 22,
        package: 700
      },
      createdBy: 'admin'
    },
    {
      id: 'service-5',
      title: 'Data Analysis & Reporting',
      description: 'Comprehensive data analysis and reporting services to help you make informed business decisions.',
      serviceType: 'consulting',
      status: 'available',
      priority: 'medium',
      estimatedHours: 45,
      actualHours: 25,
      startDate: '2024-02-10T00:00:00.000Z',
      endDate: '2024-03-10T00:00:00.000Z',
      createdAt: '2024-01-30T00:00:00.000Z',
      updatedAt: '2025-09-20T19:33:29.642Z',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      icon: '📊',
      features: [
        'Data collection and validation',
        'Statistical analysis',
        'Report generation',
        'Trend identification',
        'Performance metrics'
      ],
      pricing: {
        hourly: 35,
        package: 1400
      },
      createdBy: 'admin'
    },
    {
      id: 'service-6',
      title: 'Project Management Support',
      description: 'Professional project management support to ensure your projects are delivered on time and within budget.',
      serviceType: 'consulting',
      status: 'available',
      priority: 'high',
      estimatedHours: 60,
      actualHours: 30,
      startDate: '2024-02-15T00:00:00.000Z',
      endDate: '2024-04-15T00:00:00.000Z',
      createdAt: '2024-02-01T00:00:00.000Z',
      updatedAt: '2025-09-20T19:33:29.642Z',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      icon: '📋',
      features: [
        'Project planning and scheduling',
        'Resource allocation',
        'Progress tracking',
        'Risk management',
        'Stakeholder communication'
      ],
      pricing: {
        hourly: 40,
        package: 2000
      },
      createdBy: 'admin'
    }
  ];
  
  res.json({ 
    success: true, 
    data: adminServices, 
    message: '6 admin-created services available for booking' 
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple backend server running on port ${PORT}`);
});
