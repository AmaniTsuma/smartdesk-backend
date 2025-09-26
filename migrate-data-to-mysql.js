const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class DataMigration {
  constructor() {
    this.mysqlConnection = null;
  }

  async connect() {
    this.mysqlConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_NAME || 'smartdesk',
      user: process.env.DB_USER || 'mysql_user',
      password: process.env.DB_PASSWORD || 'password'
    });
    console.log('✅ Connected to MySQL database');
  }

  async migrateUsers() {
    try {
      console.log('🔄 Migrating users...');
      
      // Read users from JSON file
      const usersPath = path.join(__dirname, './data/users.json');
      if (fs.existsSync(usersPath)) {
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        
        for (const user of usersData) {
          await this.mysqlConnection.execute(`
            INSERT INTO users (id, email, password, first_name, last_name, role, is_active, company, phone, address, industry, website, bio, created_at, updated_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            email = VALUES(email),
            password = VALUES(password),
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            role = VALUES(role),
            is_active = VALUES(is_active),
            company = VALUES(company),
            phone = VALUES(phone),
            address = VALUES(address),
            industry = VALUES(industry),
            website = VALUES(website),
            bio = VALUES(bio),
            updated_at = VALUES(updated_at),
            last_login = VALUES(last_login)
          `, [
            user.id,
            user.email,
            user.password,
            user.firstName,
            user.lastName,
            user.role,
            user.isActive,
            user.company || null,
            user.phone || null,
            user.address || null,
            user.industry || null,
            user.website || null,
            user.bio || null,
            user.createdAt || new Date(),
            user.updatedAt || new Date(),
            user.lastLogin || null
          ]);
        }
        console.log(`✅ Migrated ${usersData.length} users`);
      } else {
        console.log('ℹ️ No users.json file found, skipping users migration');
      }
    } catch (error) {
      console.error('❌ Error migrating users:', error);
    }
  }

  async migrateClientProfiles() {
    try {
      console.log('🔄 Migrating client profiles...');
      
      const profilesPath = path.join(__dirname, './data/clientProfiles.json');
      if (fs.existsSync(profilesPath)) {
        const profilesData = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
        
        for (const profile of profilesData) {
          await this.mysqlConnection.execute(`
            INSERT INTO client_profiles (id, user_id, company, phone, address, industry, website, bio, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            user_id = VALUES(user_id),
            company = VALUES(company),
            phone = VALUES(phone),
            address = VALUES(address),
            industry = VALUES(industry),
            website = VALUES(website),
            bio = VALUES(bio),
            updated_at = VALUES(updated_at)
          `, [
            profile.id,
            profile.userId,
            profile.company || null,
            profile.phone || null,
            profile.address || null,
            profile.industry || null,
            profile.website || null,
            profile.bio || null,
            profile.createdAt || new Date(),
            profile.updatedAt || new Date()
          ]);
        }
        console.log(`✅ Migrated ${profilesData.length} client profiles`);
      } else {
        console.log('ℹ️ No clientProfiles.json file found, skipping client profiles migration');
      }
    } catch (error) {
      console.error('❌ Error migrating client profiles:', error);
    }
  }

  async migrateServiceRequests() {
    try {
      console.log('🔄 Migrating service requests...');
      
      const requestsPath = path.join(__dirname, './data/serviceRequests.json');
      if (fs.existsSync(requestsPath)) {
        const requestsData = JSON.parse(fs.readFileSync(requestsPath, 'utf8'));
        
        for (const request of requestsData) {
          // Check if client exists in users table
          let validClientId = request.clientId || null;
          if (validClientId) {
            const [userRows] = await this.mysqlConnection.execute(
              'SELECT id FROM users WHERE id = ?',
              [validClientId]
            );
            if (userRows.length === 0) {
              validClientId = null; // Set to null if client doesn't exist
            }
          }
          
          await this.mysqlConnection.execute(`
            INSERT INTO service_requests (id, client_id, title, description, service_type, priority, status, estimated_hours, actual_hours, created_by, client_name, client_email, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            client_id = VALUES(client_id),
            title = VALUES(title),
            description = VALUES(description),
            service_type = VALUES(service_type),
            priority = VALUES(priority),
            status = VALUES(status),
            estimated_hours = VALUES(estimated_hours),
            actual_hours = VALUES(actual_hours),
            created_by = VALUES(created_by),
            client_name = VALUES(client_name),
            client_email = VALUES(client_email),
            updated_at = VALUES(updated_at)
          `, [
            request.id,
            validClientId,
            request.title,
            request.description,
            request.serviceType,
            request.priority,
            request.status,
            request.estimatedHours || null,
            request.actualHours || null,
            request.createdBy || null,
            request.clientName || null,
            request.clientEmail || null,
            request.createdAt || new Date(),
            request.updatedAt || new Date()
          ]);
        }
        console.log(`✅ Migrated ${requestsData.length} service requests`);
      } else {
        console.log('ℹ️ No serviceRequests.json file found, skipping service requests migration');
      }
    } catch (error) {
      console.error('❌ Error migrating service requests:', error);
    }
  }

  async migrateConversations() {
    try {
      console.log('🔄 Migrating conversations...');
      
      const conversationsPath = path.join(__dirname, './data/conversations.json');
      if (fs.existsSync(conversationsPath)) {
        const conversationsData = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));
        
        for (const conversation of conversationsData) {
          await this.mysqlConnection.execute(`
            INSERT INTO conversations (id, client_id, admin_id, title, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            client_id = VALUES(client_id),
            admin_id = VALUES(admin_id),
            title = VALUES(title),
            status = VALUES(status),
            updated_at = VALUES(updated_at)
          `, [
            conversation.id,
            conversation.clientId || null,
            conversation.adminId || null,
            conversation.title || null,
            conversation.status || 'active',
            conversation.createdAt || new Date(),
            conversation.updatedAt || new Date()
          ]);
        }
        console.log(`✅ Migrated ${conversationsData.length} conversations`);
      } else {
        console.log('ℹ️ No conversations.json file found, skipping conversations migration');
      }
    } catch (error) {
      console.error('❌ Error migrating conversations:', error);
    }
  }

  async migrateMessages() {
    try {
      console.log('🔄 Migrating messages...');
      
      const messagesPath = path.join(__dirname, './data/messages.json');
      if (fs.existsSync(messagesPath)) {
        const messagesData = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
        
        for (const message of messagesData) {
          // Check if sender exists in users table
          const [userRows] = await this.mysqlConnection.execute(
            'SELECT id FROM users WHERE id = ?',
            [message.senderId]
          );
          
          const validSenderId = userRows.length > 0 ? message.senderId : null;
          
          await this.mysqlConnection.execute(`
            INSERT INTO messages (id, conversation_id, sender_id, sender_name, sender_email, sender_role, content, message_type, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            conversation_id = VALUES(conversation_id),
            sender_id = VALUES(sender_id),
            sender_name = VALUES(sender_name),
            sender_email = VALUES(sender_email),
            sender_role = VALUES(sender_role),
            content = VALUES(content),
            message_type = VALUES(message_type),
            is_read = VALUES(is_read)
          `, [
            message.id,
            message.conversationId,
            validSenderId,
            message.senderName,
            message.senderEmail,
            message.senderRole,
            message.content,
            message.messageType || 'text',
            message.isRead || false,
            message.createdAt || new Date()
          ]);
        }
        console.log(`✅ Migrated ${messagesData.length} messages`);
      } else {
        console.log('ℹ️ No messages.json file found, skipping messages migration');
      }
    } catch (error) {
      console.error('❌ Error migrating messages:', error);
    }
  }

  async runMigration() {
    try {
      console.log('🚀 Starting data migration from PostgreSQL to MySQL...');
      
      await this.connect();
      
      await this.migrateUsers();
      await this.migrateClientProfiles();
      await this.migrateServiceRequests();
      await this.migrateConversations();
      await this.migrateMessages();
      
      console.log('✅ Data migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
    } finally {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
      }
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const migration = new DataMigration();
  migration.runMigration();
}

module.exports = DataMigration;
