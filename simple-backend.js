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
  res.json({ 
    success: true, 
    data: [
      {
        id: 'service-1',
        title: 'Email Management',
        description: 'Professional email management services',
        status: 'pending'
      },
      {
        id: 'service-2', 
        title: 'Document Organization',
        description: 'Document organization and management',
        status: 'pending'
      }
    ], 
    message: 'Services loaded successfully' 
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
