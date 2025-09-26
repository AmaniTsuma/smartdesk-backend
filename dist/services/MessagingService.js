"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UserPersistenceService_1 = require("./UserPersistenceService");
const DATA_DIR = path_1.default.join(__dirname, '../../data');
const CONVERSATIONS_FILE = path_1.default.join(DATA_DIR, 'conversations.json');
const MESSAGES_FILE = path_1.default.join(DATA_DIR, 'messages.json');
class MessagingService {
    constructor() {
        this.conversations = [];
        this.messages = [];
        this.ensureDataDirectory();
        this.loadData();
    }
    ensureDataDirectory() {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
    }
    loadData() {
        try {
            if (fs_1.default.existsSync(CONVERSATIONS_FILE)) {
                const data = fs_1.default.readFileSync(CONVERSATIONS_FILE, 'utf8');
                this.conversations = JSON.parse(data);
                this.conversations = this.conversations.map(conv => ({
                    ...conv,
                    createdAt: new Date(conv.createdAt),
                    updatedAt: new Date(conv.updatedAt),
                    lastMessageAt: conv.lastMessageAt ? new Date(conv.lastMessageAt) : undefined,
                    participants: conv.participants.map(p => ({
                        ...p,
                        joinedAt: new Date(p.joinedAt),
                        lastSeenAt: p.lastSeenAt ? new Date(p.lastSeenAt) : undefined
                    })),
                    lastMessage: conv.lastMessage ? {
                        ...conv.lastMessage,
                        createdAt: new Date(conv.lastMessage.createdAt),
                        updatedAt: new Date(conv.lastMessage.updatedAt)
                    } : undefined
                }));
            }
            else {
                this.conversations = [];
                this.saveConversations();
            }
            if (fs_1.default.existsSync(MESSAGES_FILE)) {
                const data = fs_1.default.readFileSync(MESSAGES_FILE, 'utf8');
                this.messages = JSON.parse(data);
                this.messages = this.messages.map(msg => ({
                    ...msg,
                    createdAt: new Date(msg.createdAt),
                    updatedAt: new Date(msg.updatedAt)
                }));
            }
            else {
                this.messages = [];
                this.saveMessages();
            }
        }
        catch (error) {
            console.error('Error loading messaging data:', error);
            this.conversations = [];
            this.messages = [];
        }
    }
    saveConversations() {
        try {
            fs_1.default.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(this.conversations, null, 2));
        }
        catch (error) {
            console.error('Error saving conversations:', error);
        }
    }
    saveMessages() {
        try {
            fs_1.default.writeFileSync(MESSAGES_FILE, JSON.stringify(this.messages, null, 2));
        }
        catch (error) {
            console.error('Error saving messages:', error);
        }
    }
    migrateExistingConversations() {
        try {
            console.log('🔄 Starting conversation migration...');
            const allUsers = UserPersistenceService_1.UserPersistenceService.getInstance().getAllUsers();
            console.log(`👥 Found ${allUsers.length} total users`);
            const allAdmins = allUsers.filter(user => user.role === 'admin');
            console.log(`👤 Found ${allAdmins.length} admin users:`, allAdmins.map(a => `${a.email} (${a.id})`));
            if (allAdmins.length === 0) {
                console.log('⚠️ No admin users found, skipping migration');
                return;
            }
            let hasChanges = false;
            console.log(`📋 Checking ${this.conversations.length} conversations for migration`);
            this.conversations.forEach(conversation => {
                const adminParticipants = conversation.participants.filter(p => p.userRole === 'admin');
                const adminIds = adminParticipants.map(p => p.userId);
                const missingAdmins = allAdmins.filter(admin => !adminIds.includes(admin.id));
                if (missingAdmins.length > 0) {
                    console.log(`🔄 Migrating conversation ${conversation.id} to include ${missingAdmins.length} missing admins`);
                    missingAdmins.forEach(admin => {
                        conversation.participants.push({
                            userId: admin.id,
                            userName: `${admin.firstName} ${admin.lastName}`,
                            userEmail: admin.email,
                            userRole: 'admin',
                            joinedAt: new Date(),
                            isActive: true
                        });
                        console.log(`👤 Added admin ${admin.email} to existing conversation`);
                    });
                    hasChanges = true;
                }
            });
            if (hasChanges) {
                console.log('💾 Saving migrated conversations...');
                this.saveConversations();
                console.log('✅ Migration completed successfully');
            }
            else {
                console.log('✅ No migration needed - all conversations already have all admins');
            }
        }
        catch (error) {
            console.error('❌ Error migrating conversations:', error);
            console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
        }
    }
    createConversation(participants, conversationType, title) {
        const conversation = {
            id: this.generateId(),
            participants,
            isActive: true,
            conversationType,
            title,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.conversations.push(conversation);
        this.saveConversations();
        return conversation;
    }
    getUserConversations(userId, userRole) {
        return this.conversations.filter(conv => conv.isActive &&
            conv.participants.some(p => p.userId === userId && p.isActive)).sort((a, b) => {
            const aTime = a.lastMessageAt || a.createdAt;
            const bTime = b.lastMessageAt || b.createdAt;
            return bTime.getTime() - aTime.getTime();
        });
    }
    getAllConversations() {
        return this.conversations.filter(conv => conv.isActive);
    }
    getOrCreateConversation(senderId, senderName, senderEmail, senderRole, recipientId, recipientName, recipientEmail, recipientRole) {
        if (senderRole === 'public') {
            const existingConv = this.conversations.find(conv => conv.conversationType === 'public-support' &&
                conv.participants.some(p => p.userEmail === senderEmail && p.userRole === 'public') &&
                conv.isActive);
            if (existingConv) {
                console.log(`📞 Found existing public conversation for ${senderEmail}`);
                return existingConv;
            }
            console.log(`📞 Creating new public conversation for ${senderEmail}`);
            const participants = [
                {
                    userId: senderId,
                    userName: senderName,
                    userEmail: senderEmail,
                    userRole: senderRole,
                    joinedAt: new Date(),
                    isActive: true
                }
            ];
            const allAdmins = UserPersistenceService_1.UserPersistenceService.getInstance().getAllUsers().filter(user => user.role === 'admin');
            allAdmins.forEach(admin => {
                participants.push({
                    userId: admin.id,
                    userName: `${admin.firstName} ${admin.lastName}`,
                    userEmail: admin.email,
                    userRole: 'admin',
                    joinedAt: new Date(),
                    isActive: true
                });
                console.log(`👤 Added admin ${admin.email} to public conversation`);
            });
            if (allAdmins.length === 0) {
                console.error('❌ No admin users found!');
            }
            if (recipientId && recipientRole === 'admin') {
                const alreadyAdded = participants.some(p => p.userId === recipientId);
                if (!alreadyAdded) {
                    participants.push({
                        userId: recipientId,
                        userName: recipientName || 'Admin',
                        userEmail: recipientEmail || 'admin@smartdesk.com',
                        userRole: recipientRole,
                        joinedAt: new Date(),
                        isActive: true
                    });
                }
            }
            return this.createConversation(participants, 'public-support', `Public Support - ${senderName}`);
        }
        if (senderRole === 'client' && (recipientRole === 'admin' || !recipientRole)) {
            let adminId = recipientId;
            let adminName = recipientName;
            let adminEmail = recipientEmail;
            let adminRole = recipientRole;
            if (!adminId) {
                const allAdmins = UserPersistenceService_1.UserPersistenceService.getInstance().getAllUsers().filter(user => user.role === 'admin');
                if (allAdmins.length > 0) {
                    const primaryAdmin = allAdmins[0];
                    adminId = primaryAdmin.id;
                    adminName = `${primaryAdmin.firstName} ${primaryAdmin.lastName}`;
                    adminEmail = primaryAdmin.email;
                    adminRole = 'admin';
                }
            }
            if (!adminId) {
                throw new Error('No admin recipient found');
            }
            const existingConv = this.conversations.find(conv => conv.conversationType === 'client-admin' &&
                conv.participants.some(p => p.userId === senderId) &&
                conv.participants.some(p => p.userId === adminId) &&
                conv.isActive);
            if (existingConv)
                return existingConv;
            const participants = [
                {
                    userId: senderId,
                    userName: senderName,
                    userEmail: senderEmail,
                    userRole: senderRole,
                    joinedAt: new Date(),
                    isActive: true
                }
            ];
            const allAdmins = UserPersistenceService_1.UserPersistenceService.getInstance().getAllUsers().filter(user => user.role === 'admin');
            allAdmins.forEach(admin => {
                participants.push({
                    userId: admin.id,
                    userName: `${admin.firstName} ${admin.lastName}`,
                    userEmail: admin.email,
                    userRole: 'admin',
                    joinedAt: new Date(),
                    isActive: true
                });
                console.log(`👤 Added admin ${admin.email} to client-admin conversation`);
            });
            return this.createConversation(participants, 'client-admin', `Client Chat - ${senderName}`);
        }
        throw new Error('Invalid conversation type');
    }
    sendMessage(senderId, senderName, senderEmail, senderRole, content, conversationId, recipientId, recipientName, recipientEmail, recipientRole, messageType = 'text', attachments) {
        let conversation;
        if (conversationId) {
            const foundConversation = this.getConversationById(conversationId);
            if (!foundConversation) {
                throw new Error('Conversation not found');
            }
            conversation = foundConversation;
        }
        else {
            conversation = this.getOrCreateConversation(senderId, senderName, senderEmail, senderRole, recipientId, recipientName, recipientEmail, recipientRole);
        }
        const message = {
            id: this.generateId(),
            senderId,
            senderName,
            senderEmail,
            senderRole,
            recipientId,
            recipientName,
            recipientEmail,
            recipientRole,
            content,
            messageType,
            conversationId: conversation.id,
            isRead: false,
            isDeleted: false,
            attachments,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.messages.push(message);
        conversation.lastMessage = message;
        conversation.lastMessageAt = message.createdAt;
        conversation.updatedAt = new Date();
        this.saveMessages();
        this.updateConversation(conversation);
        return message;
    }
    getConversationMessages(conversationId, limit = 50, offset = 0) {
        return this.messages
            .filter(msg => msg.conversationId === conversationId && !msg.isDeleted)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .slice(offset, offset + limit);
    }
    markMessagesAsRead(conversationId, userId) {
        const updatedMessages = this.messages.map(msg => {
            if (msg.conversationId === conversationId &&
                msg.recipientId === userId &&
                !msg.isRead) {
                return { ...msg, isRead: true, updatedAt: new Date() };
            }
            return msg;
        });
        this.messages = updatedMessages;
        this.saveMessages();
    }
    getUnreadMessageCount(userId) {
        return this.messages.filter(msg => msg.recipientId === userId &&
            !msg.isRead &&
            !msg.isDeleted).length;
    }
    getConversationById(conversationId) {
        return this.conversations.find(conv => conv.id === conversationId) || null;
    }
    updateConversation(conversation) {
        const index = this.conversations.findIndex(conv => conv.id === conversation.id);
        if (index !== -1) {
            this.conversations[index] = conversation;
            this.saveConversations();
        }
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    deleteMessage(messageId, userId) {
        const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1)
            return false;
        const message = this.messages[messageIndex];
        if (message.senderId !== userId)
            return false;
        this.messages[messageIndex] = { ...message, isDeleted: true, updatedAt: new Date() };
        this.saveMessages();
        return true;
    }
    getOnlineUsers() {
        return [];
    }
    updateUserLastSeen(userId, conversationId) {
        const conversation = this.conversations.find((conv) => conv.id === conversationId);
        if (conversation) {
            const participant = conversation.participants.find((p) => p.userId === userId);
            if (participant) {
                participant.lastSeenAt = new Date();
                this.updateConversation(conversation);
            }
        }
    }
}
exports.MessagingService = MessagingService;
//# sourceMappingURL=MessagingService.js.map