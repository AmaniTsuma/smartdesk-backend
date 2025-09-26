const databaseService = require('./mysql-database-service');

class DatabaseSchema {
  static async createTables() {
    try {
      console.log('🏗️ Creating MySQL database tables...');

      // Users table
      await databaseService.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role ENUM('admin', 'client') NOT NULL,
          is_active BOOLEAN DEFAULT true,
          company VARCHAR(255),
          phone VARCHAR(50),
          address TEXT,
          industry VARCHAR(100),
          website VARCHAR(255),
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          last_login TIMESTAMP NULL
        )
      `);

      // Client profiles table
      await databaseService.query(`
        CREATE TABLE IF NOT EXISTS client_profiles (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255),
          company VARCHAR(255),
          phone VARCHAR(50),
          address TEXT,
          industry VARCHAR(100),
          website VARCHAR(255),
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Service requests table
      await databaseService.query(`
        CREATE TABLE IF NOT EXISTS service_requests (
          id VARCHAR(255) PRIMARY KEY,
          client_id VARCHAR(255),
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          service_type ENUM('web-development', 'mobile-development', 'consulting', 'maintenance', 'other') NOT NULL,
          priority ENUM('low', 'medium', 'high') NOT NULL,
          status ENUM('pending', 'in-progress', 'completed', 'cancelled', 'rejected') NOT NULL,
          estimated_hours INT,
          actual_hours INT,
          created_by ENUM('admin', 'client') NOT NULL,
          client_name VARCHAR(255),
          client_email VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Conversations table
      await databaseService.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id VARCHAR(255) PRIMARY KEY,
          client_id VARCHAR(255),
          admin_id VARCHAR(255),
          title VARCHAR(255),
          status ENUM('active', 'closed', 'archived') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Messages table
      await databaseService.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id VARCHAR(255) PRIMARY KEY,
          conversation_id VARCHAR(255),
          sender_id VARCHAR(255),
          sender_name VARCHAR(255) NOT NULL,
          sender_email VARCHAR(255) NOT NULL,
          sender_role ENUM('admin', 'client', 'public') NOT NULL,
          content TEXT NOT NULL,
          message_type ENUM('text', 'file', 'image', 'system') DEFAULT 'text',
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Service updates table
      await databaseService.query(`
        CREATE TABLE IF NOT EXISTS service_updates (
          id VARCHAR(255) PRIMARY KEY,
          service_request_id VARCHAR(255),
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          type ENUM('progress', 'milestone', 'issue', 'completion') NOT NULL,
          is_internal BOOLEAN DEFAULT false,
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better performance
      await databaseService.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      await databaseService.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
      await databaseService.query(`CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id)`);
      await databaseService.query(`CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)`);
      await databaseService.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`);
      await databaseService.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`);

      console.log('✅ MySQL database tables created successfully!');
    } catch (error) {
      console.error('❌ Error creating MySQL database tables:', error);
      throw error;
    }
  }

  static async seedDefaultData() {
    try {
      console.log('🌱 Seeding default data...');

      // Check if admin user already exists
      const existingAdmin = await databaseService.query(
        'SELECT id FROM users WHERE email = ?',
        ['admin@smartdesk.com']
      );

      if (existingAdmin.rows.length === 0) {
        // Insert default admin user
        const hashedPassword = '$2b$12$9RyQoSuTwzRbg43UZAaJVuM/282i0WKVs5JsbMHdDnS2puKVArePG'; // admin123
        
        await databaseService.query(`
          INSERT INTO users (id, email, password, first_name, last_name, role, is_active, company, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          'admin-1',
          'admin@smartdesk.com',
          hashedPassword,
          'Admin',
          'User',
          'admin',
          true,
          'Smart Desk'
        ]);

        console.log('✅ Default admin user created');
      } else {
        console.log('ℹ️ Admin user already exists');
      }

      console.log('✅ Default data seeded successfully!');
    } catch (error) {
      console.error('❌ Error seeding default data:', error);
      throw error;
    }
  }
}

module.exports = DatabaseSchema;
