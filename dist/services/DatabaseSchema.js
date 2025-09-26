"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSchema = void 0;
const DatabaseService_1 = require("./DatabaseService");
class DatabaseSchema {
    static async createTables() {
        try {
            console.log('🏗️ Creating database tables...');
            await DatabaseService_1.databaseService.query(`
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
        )
      `);
            await DatabaseService_1.databaseService.query(`
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
        )
      `);
            await DatabaseService_1.databaseService.query(`
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
        )
      `);
            await DatabaseService_1.databaseService.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id VARCHAR(255) PRIMARY KEY,
          client_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          admin_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
            await DatabaseService_1.databaseService.query(`
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
        )
      `);
            await DatabaseService_1.databaseService.query(`
        CREATE TABLE IF NOT EXISTS service_updates (
          id VARCHAR(255) PRIMARY KEY,
          service_request_id VARCHAR(255) REFERENCES service_requests(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('progress', 'milestone', 'issue', 'completion')),
          is_internal BOOLEAN DEFAULT false,
          created_by VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
            await DatabaseService_1.databaseService.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `);
            await DatabaseService_1.databaseService.query(`
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
      `);
            await DatabaseService_1.databaseService.query(`
        CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id)
      `);
            await DatabaseService_1.databaseService.query(`
        CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)
      `);
            await DatabaseService_1.databaseService.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)
      `);
            await DatabaseService_1.databaseService.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)
      `);
            console.log('✅ Database tables created successfully!');
        }
        catch (error) {
            console.error('❌ Error creating database tables:', error);
            throw error;
        }
    }
    static async dropTables() {
        try {
            console.log('🗑️ Dropping database tables...');
            const tables = [
                'service_updates',
                'messages',
                'conversations',
                'service_requests',
                'client_profiles',
                'users'
            ];
            for (const table of tables) {
                await DatabaseService_1.databaseService.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
            }
            console.log('✅ Database tables dropped successfully!');
        }
        catch (error) {
            console.error('❌ Error dropping database tables:', error);
            throw error;
        }
    }
    static async seedDefaultData() {
        try {
            console.log('🌱 Seeding default data...');
            const existingAdmin = await DatabaseService_1.databaseService.query('SELECT id FROM users WHERE email = $1', ['admin@smartdesk.com']);
            if (existingAdmin.rows.length === 0) {
                const hashedPassword = '$2b$12$9RyQoSuTwzRbg43UZAaJVuM/282i0WKVs5JsbMHdDnS2puKVArePG';
                await DatabaseService_1.databaseService.query(`
          INSERT INTO users (id, email, password, first_name, last_name, role, is_active, company, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
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
            }
            else {
                console.log('ℹ️ Admin user already exists');
            }
            console.log('✅ Default data seeded successfully!');
        }
        catch (error) {
            console.error('❌ Error seeding default data:', error);
            throw error;
        }
    }
}
exports.DatabaseSchema = DatabaseSchema;
//# sourceMappingURL=DatabaseSchema.js.map