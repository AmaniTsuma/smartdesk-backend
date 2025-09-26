# Smart Desk Solutions - Backend API

Node.js backend API for Smart Desk Solutions platform.

## Features

- User authentication and authorization
- Service request management
- Real-time messaging
- Contact form handling
- MySQL database integration

## Tech Stack

- Node.js
- Express.js
- MySQL
- JWT Authentication
- WebSocket support

## Environment Variables

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
DB_HOST=your_mysql_host
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
FRONTEND_URL=https://smartdesk.solutions

# CORS Configuration
CORS_ORIGIN=https://smartdesk.solutions
```

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

## API Endpoints

- `/api/auth/*` - Authentication endpoints
- `/api/service-requests/*` - Service request management
- `/api/messaging/*` - Real-time messaging
- `/api/contact` - Contact form
- `/health` - Health check
