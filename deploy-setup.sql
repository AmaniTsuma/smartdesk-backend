-- Smart Desk Database Setup Script for Hostinger PostgreSQL
-- Run this script in your PostgreSQL database to set up the schema

-- Create database (if not exists)
-- CREATE DATABASE smartdesk;

-- Connect to smartdesk database and run the following:

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'client')),
  is_active BOOLEAN DEFAULT true,
  company VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  industry VARCHAR(100),
  website VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Client profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  industry VARCHAR(100),
  website VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('web-development', 'mobile-development', 'consulting', 'maintenance', 'other')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled', 'rejected')),
  estimated_hours INTEGER,
  actual_hours INTEGER,
  created_by VARCHAR(20) NOT NULL CHECK (created_by IN ('admin', 'client')),
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  admin_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('admin', 'client', 'public')),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service updates table
CREATE TABLE IF NOT EXISTS service_updates (
  id VARCHAR(255) PRIMARY KEY,
  service_request_id VARCHAR(255) REFERENCES service_requests(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('progress', 'milestone', 'issue', 'completion')),
  is_internal BOOLEAN DEFAULT false,
  created_by VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Insert default admin user
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, company, created_at, updated_at)
VALUES (
  'admin-1',
  'admin@smartdesk.com',
  '$2b$12$9RyQoSuTwzRbg43UZAaJVuM/282i0WKVs5JsbMHdDnS2puKVArePG', -- admin123
  'Admin',
  'User',
  'admin',
  true,
  'Smart Desk',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Smart Desk database setup completed successfully!' as message;
