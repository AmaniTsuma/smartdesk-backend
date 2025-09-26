"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteDataMigrator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SQLiteDatabaseService_1 = require("../services/SQLiteDatabaseService");
const SQLiteSchema_1 = require("../services/SQLiteSchema");
class SQLiteDataMigrator {
    constructor() {
        this.dataDir = path_1.default.join(__dirname, '../../data');
    }
    async migrateAllData() {
        try {
            console.log('🚀 Starting data migration from JSON to SQLite...');
            const connected = await SQLiteDatabaseService_1.sqliteDatabaseService.testConnection();
            if (!connected) {
                throw new Error('Cannot connect to SQLite database');
            }
            await SQLiteSchema_1.SQLiteSchema.createTables();
            console.log('✅ Database tables verified/created');
            await this.migrateUsers();
            await this.migrateClientProfiles();
            await this.migrateServiceRequests();
            await this.migrateConversations();
            await this.migrateMessages();
            console.log('🎉 Data migration completed successfully!');
        }
        catch (error) {
            console.error('❌ Data migration failed:', error);
            throw error;
        }
    }
    async migrateUsers() {
        console.log('📊 Migrating users...');
        const usersFile = path_1.default.join(this.dataDir, 'users.json');
        if (!fs_1.default.existsSync(usersFile)) {
            console.log('ℹ️ No users.json file found, skipping users migration');
            return;
        }
        const usersData = JSON.parse(fs_1.default.readFileSync(usersFile, 'utf8'));
        for (const userData of usersData) {
            try {
                const existingUser = await SQLiteDatabaseService_1.sqliteDatabaseService.query('SELECT id FROM users WHERE id = ?', [userData.id]);
                if (existingUser.rows.length > 0) {
                    console.log(`ℹ️ User ${userData.email} already exists, skipping`);
                    continue;
                }
                await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
          INSERT INTO users (
            id, email, password, first_name, last_name, role, is_active, 
            company, phone, address, industry, website, bio,
            created_at, updated_at, last_login
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    userData.id,
                    userData.email,
                    userData.password,
                    userData.firstName,
                    userData.lastName,
                    userData.role,
                    userData.isActive ? 1 : 0,
                    userData.company || null,
                    userData.phone || null,
                    userData.address || null,
                    userData.industry || null,
                    userData.website || null,
                    userData.bio || null,
                    userData.createdAt,
                    userData.updatedAt,
                    userData.lastLogin || null
                ]);
                console.log(`✅ Migrated user: ${userData.email}`);
            }
            catch (error) {
                console.error(`❌ Failed to migrate user ${userData.email}:`, error);
            }
        }
    }
    async migrateClientProfiles() {
        console.log('👤 Migrating client profiles...');
        const profilesFile = path_1.default.join(this.dataDir, 'clientProfiles.json');
        if (!fs_1.default.existsSync(profilesFile)) {
            console.log('ℹ️ No clientProfiles.json file found, skipping profiles migration');
            return;
        }
        const profilesData = JSON.parse(fs_1.default.readFileSync(profilesFile, 'utf8'));
        for (const profileData of profilesData) {
            try {
                const existingProfile = await SQLiteDatabaseService_1.sqliteDatabaseService.query('SELECT id FROM client_profiles WHERE user_id = ?', [profileData.userId]);
                if (existingProfile.rows.length > 0) {
                    console.log(`ℹ️ Profile for user ${profileData.userId} already exists, skipping`);
                    continue;
                }
                await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
          INSERT INTO client_profiles (
            id, user_id, company, phone, address, industry, website, bio,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    profileData.id,
                    profileData.userId,
                    profileData.company || null,
                    profileData.phone || null,
                    profileData.address || null,
                    profileData.industry || null,
                    profileData.website || null,
                    profileData.bio || null,
                    profileData.createdAt,
                    profileData.updatedAt
                ]);
                console.log(`✅ Migrated client profile: ${profileData.userId}`);
            }
            catch (error) {
                console.error(`❌ Failed to migrate profile ${profileData.userId}:`, error);
            }
        }
    }
    async migrateServiceRequests() {
        console.log('📋 Migrating service requests...');
        const requestsFile = path_1.default.join(this.dataDir, 'serviceRequests.json');
        if (!fs_1.default.existsSync(requestsFile)) {
            console.log('ℹ️ No serviceRequests.json file found, skipping service requests migration');
            return;
        }
        const requestsData = JSON.parse(fs_1.default.readFileSync(requestsFile, 'utf8'));
        for (const requestData of requestsData) {
            try {
                const existingRequest = await SQLiteDatabaseService_1.sqliteDatabaseService.query('SELECT id FROM service_requests WHERE id = ?', [requestData.id]);
                if (existingRequest.rows.length > 0) {
                    console.log(`ℹ️ Service request ${requestData.id} already exists, skipping`);
                    continue;
                }
                await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
          INSERT INTO service_requests (
            id, client_id, title, description, service_type, priority, status,
            estimated_hours, actual_hours, created_by, client_name, client_email,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    requestData.id,
                    requestData.clientId,
                    requestData.title,
                    requestData.description,
                    requestData.serviceType,
                    requestData.priority,
                    requestData.status,
                    requestData.estimatedHours || null,
                    requestData.actualHours || null,
                    requestData.createdBy,
                    requestData.clientName || null,
                    requestData.clientEmail || null,
                    requestData.createdAt,
                    requestData.updatedAt
                ]);
                console.log(`✅ Migrated service request: ${requestData.title}`);
            }
            catch (error) {
                console.error(`❌ Failed to migrate service request ${requestData.id}:`, error);
            }
        }
    }
    async migrateConversations() {
        console.log('💬 Migrating conversations...');
        const conversationsFile = path_1.default.join(this.dataDir, 'conversations.json');
        if (!fs_1.default.existsSync(conversationsFile)) {
            console.log('ℹ️ No conversations.json file found, skipping conversations migration');
            return;
        }
        const conversationsData = JSON.parse(fs_1.default.readFileSync(conversationsFile, 'utf8'));
        for (const conversationData of conversationsData) {
            try {
                const existingConversation = await SQLiteDatabaseService_1.sqliteDatabaseService.query('SELECT id FROM conversations WHERE id = ?', [conversationData.id]);
                if (existingConversation.rows.length > 0) {
                    console.log(`ℹ️ Conversation ${conversationData.id} already exists, skipping`);
                    continue;
                }
                await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
          INSERT INTO conversations (
            id, client_id, admin_id, title, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
                    conversationData.id,
                    conversationData.clientId,
                    conversationData.adminId,
                    conversationData.title || null,
                    conversationData.status,
                    conversationData.createdAt,
                    conversationData.updatedAt
                ]);
                console.log(`✅ Migrated conversation: ${conversationData.id}`);
            }
            catch (error) {
                console.error(`❌ Failed to migrate conversation ${conversationData.id}:`, error);
            }
        }
    }
    async migrateMessages() {
        console.log('📨 Migrating messages...');
        const messagesFile = path_1.default.join(this.dataDir, 'messages.json');
        if (!fs_1.default.existsSync(messagesFile)) {
            console.log('ℹ️ No messages.json file found, skipping messages migration');
            return;
        }
        const messagesData = JSON.parse(fs_1.default.readFileSync(messagesFile, 'utf8'));
        for (const messageData of messagesData) {
            try {
                const existingMessage = await SQLiteDatabaseService_1.sqliteDatabaseService.query('SELECT id FROM messages WHERE id = ?', [messageData.id]);
                if (existingMessage.rows.length > 0) {
                    console.log(`ℹ️ Message ${messageData.id} already exists, skipping`);
                    continue;
                }
                await SQLiteDatabaseService_1.sqliteDatabaseService.run(`
          INSERT INTO messages (
            id, conversation_id, sender_id, sender_name, sender_email, sender_role,
            content, message_type, is_read, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    messageData.id,
                    messageData.conversationId,
                    messageData.senderId,
                    messageData.senderName,
                    messageData.senderEmail,
                    messageData.senderRole,
                    messageData.content,
                    messageData.messageType || 'text',
                    messageData.isRead ? 1 : 0,
                    messageData.createdAt
                ]);
                console.log(`✅ Migrated message: ${messageData.id}`);
            }
            catch (error) {
                console.error(`❌ Failed to migrate message ${messageData.id}:`, error);
            }
        }
    }
    async backupJsonFiles() {
        console.log('💾 Creating backup of JSON files...');
        const backupDir = path_1.default.join(this.dataDir, 'backup');
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        const files = ['users.json', 'clientProfiles.json', 'serviceRequests.json', 'conversations.json', 'messages.json'];
        for (const file of files) {
            const sourceFile = path_1.default.join(this.dataDir, file);
            const backupFile = path_1.default.join(backupDir, `${file}.backup.${Date.now()}`);
            if (fs_1.default.existsSync(sourceFile)) {
                fs_1.default.copyFileSync(sourceFile, backupFile);
                console.log(`✅ Backed up ${file}`);
            }
        }
    }
}
exports.SQLiteDataMigrator = SQLiteDataMigrator;
async function runMigration() {
    const migrator = new SQLiteDataMigrator();
    try {
        await migrator.backupJsonFiles();
        await migrator.migrateAllData();
        console.log('\n🎉 Migration completed successfully!');
        console.log('📁 JSON files have been backed up to backend/data/backup/');
        console.log('🗄️ All data is now in SQLite database: backend/data/smartdesk.db');
    }
    catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
    finally {
        await SQLiteDatabaseService_1.sqliteDatabaseService.close();
    }
}
if (require.main === module) {
    runMigration();
}
//# sourceMappingURL=migrateToSQLite.js.map