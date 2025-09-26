"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMigrator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PostgreSQLUserService_1 = require("../services/PostgreSQLUserService");
const DatabaseService_1 = require("../services/DatabaseService");
const DatabaseSchema_1 = require("../services/DatabaseSchema");
class DataMigrator {
    constructor() {
        this.dataDir = path_1.default.join(__dirname, '../../data');
    }
    async migrateAllData() {
        try {
            console.log('🚀 Starting data migration from JSON to PostgreSQL...');
            const connected = await DatabaseService_1.databaseService.testConnection();
            if (!connected) {
                throw new Error('Cannot connect to PostgreSQL database');
            }
            await DatabaseSchema_1.DatabaseSchema.createTables();
            console.log('✅ Database tables verified/created');
            await this.migrateUsers();
            await this.migrateClientProfiles();
            await this.migrateServiceRequests();
            await this.migrateConversations();
            await this.migrateMessages();
            await this.migrateServiceUpdates();
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
                const existingUser = await PostgreSQLUserService_1.postgreSQLUserService.getUserById(userData.id);
                if (existingUser) {
                    console.log(`ℹ️ User ${userData.email} already exists, skipping`);
                    continue;
                }
                const user = {
                    ...userData,
                    createdAt: new Date(userData.createdAt),
                    updatedAt: new Date(userData.updatedAt),
                    lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined
                };
                await PostgreSQLUserService_1.postgreSQLUserService.addUser(user);
                console.log(`✅ Migrated user: ${user.email}`);
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
                const existingProfile = await PostgreSQLUserService_1.postgreSQLUserService.getClientProfileByUserId(profileData.userId);
                if (existingProfile) {
                    console.log(`ℹ️ Profile for user ${profileData.userId} already exists, skipping`);
                    continue;
                }
                const profile = {
                    ...profileData,
                    createdAt: new Date(profileData.createdAt),
                    updatedAt: new Date(profileData.updatedAt)
                };
                await PostgreSQLUserService_1.postgreSQLUserService.addClientProfile(profile);
                console.log(`✅ Migrated client profile: ${profile.userId}`);
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
                const existingRequest = await DatabaseService_1.databaseService.query('SELECT id FROM service_requests WHERE id = $1', [requestData.id]);
                if (existingRequest.rows.length > 0) {
                    console.log(`ℹ️ Service request ${requestData.id} already exists, skipping`);
                    continue;
                }
                await DatabaseService_1.databaseService.query(`
          INSERT INTO service_requests (
            id, client_id, title, description, service_type, priority, status,
            estimated_hours, actual_hours, created_by, client_name, client_email,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
                    new Date(requestData.createdAt),
                    new Date(requestData.updatedAt)
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
                const existingConversation = await DatabaseService_1.databaseService.query('SELECT id FROM conversations WHERE id = $1', [conversationData.id]);
                if (existingConversation.rows.length > 0) {
                    console.log(`ℹ️ Conversation ${conversationData.id} already exists, skipping`);
                    continue;
                }
                await DatabaseService_1.databaseService.query(`
          INSERT INTO conversations (
            id, client_id, admin_id, title, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
                    conversationData.id,
                    conversationData.clientId,
                    conversationData.adminId,
                    conversationData.title || null,
                    conversationData.status,
                    new Date(conversationData.createdAt),
                    new Date(conversationData.updatedAt)
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
                const existingMessage = await DatabaseService_1.databaseService.query('SELECT id FROM messages WHERE id = $1', [messageData.id]);
                if (existingMessage.rows.length > 0) {
                    console.log(`ℹ️ Message ${messageData.id} already exists, skipping`);
                    continue;
                }
                await DatabaseService_1.databaseService.query(`
          INSERT INTO messages (
            id, conversation_id, sender_id, sender_name, sender_email, sender_role,
            content, message_type, is_read, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
                    messageData.id,
                    messageData.conversationId,
                    messageData.senderId,
                    messageData.senderName,
                    messageData.senderEmail,
                    messageData.senderRole,
                    messageData.content,
                    messageData.messageType || 'text',
                    messageData.isRead || false,
                    new Date(messageData.createdAt)
                ]);
                console.log(`✅ Migrated message: ${messageData.id}`);
            }
            catch (error) {
                console.error(`❌ Failed to migrate message ${messageData.id}:`, error);
            }
        }
    }
    async migrateServiceUpdates() {
        console.log('📝 Migrating service updates...');
        console.log('ℹ️ Service updates are not persisted in JSON files, skipping');
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
exports.DataMigrator = DataMigrator;
async function runMigration() {
    const migrator = new DataMigrator();
    try {
        await migrator.backupJsonFiles();
        await migrator.migrateAllData();
        console.log('\n🎉 Migration completed successfully!');
        console.log('📁 JSON files have been backed up to backend/data/backup/');
        console.log('🗄️ All data is now in PostgreSQL database');
    }
    catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
    finally {
        await DatabaseService_1.databaseService.close();
    }
}
if (require.main === module) {
    runMigration();
}
//# sourceMappingURL=migrateData.js.map