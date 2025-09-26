"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const contact_1 = __importDefault(require("./routes/contact"));
const auth_1 = __importDefault(require("./routes/auth"));
const services_1 = __importDefault(require("./routes/services"));
const serviceRequests_1 = __importDefault(require("./routes/serviceRequests"));
const messaging_1 = __importDefault(require("./routes/messaging"));
const AuthService_1 = require("./services/AuthService");
const MessagingService_1 = require("./services/MessagingService");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const DatabaseService_1 = require("./services/DatabaseService");
const DatabaseSchema_1 = require("./services/DatabaseSchema");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://192.168.0.101:5173',
            /^http:\/\/192\.168\.\d+\.\d+:5173$/,
            /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,
            /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:5173$/
        ],
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true
    }
});
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://192.168.0.101:5173',
        /^http:\/\/192\.168\.\d+\.\d+:5173$/,
        /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,
        /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:5173$/
    ],
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Smart Desk API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.use('/api/contact', contact_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/services', services_1.default);
app.use('/api/service-requests', serviceRequests_1.default);
app.use('/api/messaging', messaging_1.default);
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
async function initializeApp() {
    try {
        console.log('🚀 Initializing Smart Desk application...');
        const connected = await DatabaseService_1.databaseService.testConnection();
        if (!connected) {
            console.error('❌ Database connection failed. Please check your PostgreSQL configuration.');
            process.exit(1);
        }
        await DatabaseSchema_1.DatabaseSchema.createTables();
        await DatabaseSchema_1.DatabaseSchema.seedDefaultData();
        const authService = new AuthService_1.AuthService();
        const messagingService = new MessagingService_1.MessagingService();
        console.log('✅ Application initialized successfully!');
        return { authService, messagingService };
    }
    catch (error) {
        console.error('❌ Application initialization failed:', error);
        process.exit(1);
    }
}
async function startServer() {
    try {
        const { authService, messagingService } = await initializeApp();
        app.set('io', io);
        io.on('connection', (socket) => {
            console.log(`🔌 User connected: ${socket.id}`);
            socket.on('error', (error) => {
                console.error(`❌ Socket error for ${socket.id}:`, error);
            });
            socket.on('connect_timeout', (timeout) => {
                console.error(`⏰ Connection timeout for ${socket.id}:`, timeout);
            });
            socket.on('join-user-room', (data) => {
                try {
                    const roomName = `user_${data.userId}`;
                    socket.join(roomName);
                    console.log(`👤 User ${data.userId} joined room: ${roomName}`);
                    socket.data.userId = data.userId;
                    socket.data.userRole = data.userRole;
                }
                catch (error) {
                    console.error(`❌ Error joining user room:`, error);
                }
            });
            socket.on('join-conversation', (data) => {
                const roomName = `conversation_${data.conversationId}`;
                socket.join(roomName);
                socket.to(roomName).emit('user-joined', { userId: data.userId });
                console.log(`💬 User ${data.userId} joined conversation: ${data.conversationId}`);
            });
            socket.on('leave-conversation', (data) => {
                const roomName = `conversation_${data.conversationId}`;
                socket.leave(roomName);
                socket.to(roomName).emit('user-left', { userId: data.userId });
                console.log(`👋 User ${data.userId} left conversation: ${data.conversationId}`);
            });
            socket.on('send-message', async (data) => {
                try {
                    const message = messagingService.sendMessage(data.senderId, data.senderName, data.senderEmail, data.senderRole, data.content, data.conversationId, data.recipientId);
                    const roomName = `conversation_${data.conversationId}`;
                    io.to(roomName).emit('new-message', message);
                    if (data.recipientId) {
                        const recipientRoom = `user_${data.recipientId}`;
                        socket.to(recipientRoom).emit('message-notification', {
                            conversationId: data.conversationId,
                            message: message
                        });
                    }
                    console.log(`📨 Message sent in conversation ${data.conversationId}`);
                }
                catch (error) {
                    console.error('Error sending message:', error);
                    socket.emit('message-error', { error: 'Failed to send message' });
                }
            });
            socket.on('typing-start', (data) => {
                const roomName = `conversation_${data.conversationId}`;
                socket.to(roomName).emit('user-typing', {
                    userId: data.userId,
                    userName: data.userName,
                    isTyping: true
                });
            });
            socket.on('typing-stop', (data) => {
                const roomName = `conversation_${data.conversationId}`;
                socket.to(roomName).emit('user-typing', {
                    userId: data.userId,
                    isTyping: false
                });
            });
            socket.on('user-online', (data) => {
                socket.broadcast.emit('user-status', {
                    userId: data.userId,
                    status: 'online'
                });
            });
            socket.on('disconnect', (reason) => {
                console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
                if (socket.data.userId) {
                    console.log(`🧹 Cleaning up user ${socket.data.userId}`);
                }
            });
        });
        server.listen(Number(PORT), HOST, () => {
            console.log(`🚀 Smart Desk API server running on ${HOST}:${PORT}`);
            console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔐 Default admin: admin@smartdesk.com / admin123`);
            console.log(`🔌 WebSocket server ready for real-time messaging`);
            console.log(`📱 Mobile access: http://[YOUR_IP]:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map