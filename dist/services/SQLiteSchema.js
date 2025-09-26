"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteSchema = void 0;
const SQLiteDatabaseService_1 = require("./SQLiteDatabaseService");
class SQLiteSchema {
    static async createTables() {
        try {
            console.log('🏗️ Creating SQLite database tables...');
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
          is_active INTEGER DEFAULT 1,
          company TEXT,
          phone TEXT,
          address TEXT,
          industry TEXT,
          website TEXT,
          bio TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        )
      `);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
        CREATE TABLE IF NOT EXISTS client_profiles (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          company TEXT,
          phone TEXT,
          address TEXT,
          industry TEXT,
          website TEXT,
          bio TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
        CREATE TABLE IF NOT EXISTS service_requests (
          id TEXT PRIMARY KEY,
          client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          service_type TEXT NOT NULL CHECK (service_type IN ('web-development', 'mobile-development', 'consulting', 'maintenance', 'other')),
          priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
          status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled', 'rejected')),
          estimated_hours INTEGER,
          actual_hours INTEGER,
          created_by TEXT NOT NULL CHECK (created_by IN ('admin', 'client')),
          client_name TEXT,
          client_email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          admin_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          title TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
          sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          sender_name TEXT NOT NULL,
          sender_email TEXT NOT NULL,
          sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'client', 'public')),
          content TEXT NOT NULL,
          message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
          is_read INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
        CREATE TABLE IF NOT EXISTS service_updates (
          id TEXT PRIMARY KEY,
          service_request_id TEXT REFERENCES service_requests(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('progress', 'milestone', 'issue', 'completion')),
          is_internal INTEGER DEFAULT 0,
          created_by TEXT REFERENCES users(id) ON DELETE CASCADE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id)`);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)`);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`);
            await SQLiteDatabaseService_1.sqliteDatabaseService.run(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`);
            console.log('✅ SQLite database tables created successfully!');
        }
        catch (error) {
            console.error('❌ Error creating SQLite database tables:', error);
            throw error;
        }
    }
    static async seedDefaultData() {
        try {
            console.log('🌱 Seeding default data...');
            const existingAdmin = await SQLiteDatabaseService_1.sqliteDatabaseService.query('SELECT id FROM users WHERE email = ?', ['admin@smartdesk.com']);
            if (existingAdmin.rows.length === 0) {
                const hashedPassword = '$2b$12$9RyQoSuTwzRbg43UZAaJVuM/282i0WKVs5JsbMHdDnS2puKVArePG';
                await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
          INSERT INTO users (id, email, password, first_name, last_name, role, is_active, company, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
                    'admin-1',
                    'admin@smartdesk.com',
                    hashedPassword,
                    'Admin',
                    'User',
                    'admin',
                    1,
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
exports.SQLiteSchema = SQLiteSchema;
//# sourceMappingURL=SQLiteSchema.js.map