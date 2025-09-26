"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MessagingService_1 = require("../services/MessagingService");
const AuthService_1 = require("../services/AuthService");
const UserPersistenceService_1 = require("../services/UserPersistenceService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const messagingService = new MessagingService_1.MessagingService();
const authService = new AuthService_1.AuthService();
router.get('/conversations', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const conversations = messagingService.getUserConversations(userId, userRole);
        res.json({
            success: true,
            data: conversations
        });
    }
    catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversations'
        });
    }
});
router.get('/conversations/:id/messages', auth_1.authenticate, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const conversation = messagingService.getConversationById(conversationId);
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
            return;
        }
        const hasAccess = conversation.participants.some(p => p.userId === userId && p.isActive);
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: 'Access denied to this conversation'
            });
            return;
        }
        const messages = messagingService.getConversationMessages(conversationId, limit, offset);
        messagingService.markMessagesAsRead(conversationId, userId);
        res.json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages'
        });
    }
});
router.post('/send', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { content, conversationId, recipientId, messageType = 'text' } = req.body;
        if (!content || content.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
            return;
        }
        const user = authService.getUserById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        let recipient = null;
        if (recipientId) {
            recipient = authService.getUserById(recipientId);
        }
        let adminRecipient = null;
        if (userRole === 'client' && !recipientId) {
            adminRecipient = UserPersistenceService_1.userPersistenceService.getUserByEmail('admin@smartdesk.com');
        }
        const message = messagingService.sendMessage(userId, `${user.firstName} ${user.lastName}`, user.email, userRole, content.trim(), conversationId, recipientId || (adminRecipient ? adminRecipient.id : undefined), recipient ? `${recipient.firstName} ${recipient.lastName}` : (adminRecipient ? `${adminRecipient.firstName} ${adminRecipient.lastName}` : undefined), recipient?.email || adminRecipient?.email, recipient?.role || (adminRecipient ? adminRecipient.role : undefined), messageType);
        const io = req.app.get('io');
        if (io) {
            try {
                const conversation = messagingService.getConversationById(message.conversationId);
                if (conversation) {
                    console.log(`📨 Broadcasting message in conversation ${message.conversationId}`);
                    console.log(`👥 Participants:`, conversation.participants.map(p => `${p.userName} (${p.userRole})`));
                    const roomName = `conversation_${message.conversationId}`;
                    io.to(roomName).emit('new-message', message);
                    conversation.participants.forEach(participant => {
                        if (participant.userId !== userId) {
                            const participantRoom = `user_${participant.userId}`;
                            console.log(`📢 Notifying ${participant.userName} in room ${participantRoom}`);
                            io.to(participantRoom).emit('message-notification', {
                                conversationId: message.conversationId,
                                message: message
                            });
                        }
                    });
                    console.log(`📨 Message broadcasted in conversation ${message.conversationId}`);
                }
            }
            catch (error) {
                console.error('❌ Error broadcasting message via WebSocket:', error);
            }
        }
        res.json({
            success: true,
            data: message
        });
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});
router.post('/public/send', async (req, res) => {
    try {
        const { content, senderName, senderEmail, messageType = 'text' } = req.body;
        if (!content || content.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
            return;
        }
        if (!senderName || !senderEmail) {
            res.status(400).json({
                success: false,
                message: 'Sender name and email are required'
            });
            return;
        }
        const publicUserId = `public_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const message = messagingService.sendMessage(publicUserId, senderName, senderEmail, 'public', content.trim(), undefined, undefined, undefined, undefined, undefined, messageType);
        const io = req.app.get('io');
        if (io) {
            const conversation = messagingService.getConversationById(message.conversationId);
            if (conversation) {
                console.log(`📨 Broadcasting public message to conversation ${message.conversationId}`);
                console.log(`👥 Conversation participants:`, conversation.participants.map(p => `${p.userName} (${p.userRole})`));
                const roomName = `conversation_${message.conversationId}`;
                io.to(roomName).emit('new-message', message);
                const adminParticipants = conversation.participants.filter(p => p.userRole === 'admin');
                console.log(`👤 Found ${adminParticipants.length} admin participants`);
                adminParticipants.forEach(admin => {
                    const adminRoom = `user_${admin.userId}`;
                    console.log(`📢 Notifying admin ${admin.userName} in room ${adminRoom}`);
                    io.to(adminRoom).emit('message-notification', {
                        conversationId: message.conversationId,
                        message: message
                    });
                });
                console.log(`📨 Public message broadcasted to admins in conversation ${message.conversationId}`);
            }
            else {
                console.error(`❌ Conversation ${message.conversationId} not found for broadcasting`);
            }
        }
        else {
            console.error('❌ WebSocket server not available for broadcasting');
        }
        res.json({
            success: true,
            data: message
        });
    }
    catch (error) {
        console.error('Send public message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});
router.delete('/messages/:id', auth_1.authenticate, async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.user.userId;
        const deleted = messagingService.deleteMessage(messageId, userId);
        if (deleted) {
            res.json({
                success: true,
                message: 'Message deleted successfully'
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'Message not found or access denied'
            });
        }
    }
    catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
});
router.get('/unread-count', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const unreadCount = messagingService.getUnreadMessageCount(userId);
        res.json({
            success: true,
            data: { unreadCount }
        });
    }
    catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
});
router.post('/conversations/:id/read', auth_1.authenticate, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.userId;
        const conversation = messagingService.getConversationById(conversationId);
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
            return;
        }
        const hasAccess = conversation.participants.some(p => p.userId === userId && p.isActive);
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: 'Access denied to this conversation'
            });
            return;
        }
        messagingService.markMessagesAsRead(conversationId, userId);
        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    }
    catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read'
        });
    }
});
router.get('/admin/conversations', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const userId = req.user.userId;
        try {
            messagingService.migrateExistingConversations();
        }
        catch (migrationError) {
            console.error('Migration failed:', migrationError);
        }
        const conversations = messagingService.getUserConversations(userId, 'admin');
        const allConversations = messagingService.getAllConversations();
        const adminConversations = allConversations.filter(conv => conv.isActive &&
            conv.participants.some(p => p.userRole === 'admin' && p.isActive));
        const combinedConversations = [...conversations, ...adminConversations];
        const uniqueConversations = combinedConversations.filter((conv, index, self) => index === self.findIndex(c => c.id === conv.id)).sort((a, b) => {
            const aTime = a.lastMessageAt || a.createdAt;
            const bTime = b.lastMessageAt || b.createdAt;
            return bTime.getTime() - aTime.getTime();
        });
        res.json({
            success: true,
            data: uniqueConversations
        });
    }
    catch (error) {
        console.error('Get admin conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversations',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=messaging.js.map