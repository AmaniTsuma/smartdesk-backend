"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const ServiceRequestService_1 = require("./ServiceRequestService");
const UserPersistenceService_1 = require("./UserPersistenceService");
const EmailService_1 = require("./EmailService");
const serviceUpdates = [];
const passwordResetTokens = [];
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = '30m';
const RESET_TOKEN_EXPIRES_IN = '1h';
class AuthService {
    constructor() {
        this.emailService = new EmailService_1.EmailService();
    }
    async registerUser(userData) {
        const existingUser = UserPersistenceService_1.userPersistenceService.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, saltRounds);
        const user = {
            id: (0, uuid_1.v4)(),
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        UserPersistenceService_1.userPersistenceService.addUser(user);
        if (userData.role === 'client') {
            const clientProfile = {
                id: (0, uuid_1.v4)(),
                userId: user.id,
                company: userData.company || '',
                phone: userData.phone || '',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            UserPersistenceService_1.userPersistenceService.addClientProfile(clientProfile);
        }
        try {
            await this.emailService.sendWelcomeEmail(`${userData.firstName} ${userData.lastName}`, userData.email, userData.role);
            console.log(`Welcome email sent to ${userData.email}`);
        }
        catch (error) {
            console.error('Failed to send welcome email:', error);
        }
        const token = this.generateToken(user.id, user.email, user.role);
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    async loginUser(email, password) {
        const user = UserPersistenceService_1.userPersistenceService.getUserByEmail(email);
        if (!user || !user.isActive) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        UserPersistenceService_1.userPersistenceService.updateUser(user.id, { lastLogin: new Date() });
        const token = this.generateToken(user.id, user.email, user.role);
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    generateToken(userId, email, role) {
        return jsonwebtoken_1.default.sign({
            userId,
            email,
            role
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    getUserById(userId) {
        const user = UserPersistenceService_1.userPersistenceService.getUserById(userId);
        if (!user)
            return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    getAllUsers() {
        return UserPersistenceService_1.userPersistenceService.getAllUsers().map(({ password, ...user }) => user);
    }
    async updateUser(userId, updateData) {
        const updatedUser = UserPersistenceService_1.userPersistenceService.updateUser(userId, updateData);
        if (!updatedUser)
            return null;
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    deleteUser(userId) {
        return UserPersistenceService_1.userPersistenceService.deleteUser(userId);
    }
    createServiceRequest(requestData) {
        return ServiceRequestService_1.serviceRequestService.createServiceRequest(requestData);
    }
    getClientServiceRequests(clientId) {
        return ServiceRequestService_1.serviceRequestService.getClientServiceRequests(clientId);
    }
    getAdminServices() {
        return ServiceRequestService_1.serviceRequestService.getAdminServices();
    }
    getClientRequests() {
        return ServiceRequestService_1.serviceRequestService.getClientRequests();
    }
    getAllServiceRequests() {
        return ServiceRequestService_1.serviceRequestService.getAllServiceRequests();
    }
    updateServiceRequestStatus(requestId, status) {
        return ServiceRequestService_1.serviceRequestService.updateServiceRequest(requestId, { status });
    }
    addServiceUpdate(updateData) {
        const serviceUpdate = {
            id: (0, uuid_1.v4)(),
            serviceRequestId: updateData.serviceRequestId,
            title: updateData.title,
            description: updateData.description,
            type: updateData.type,
            isInternal: updateData.isInternal,
            createdAt: new Date(),
            createdBy: updateData.createdBy
        };
        serviceUpdates.push(serviceUpdate);
        return serviceUpdate;
    }
    getServiceUpdates(serviceRequestId, includeInternal = false) {
        return serviceUpdates.filter(su => su.serviceRequestId === serviceRequestId &&
            (includeInternal || !su.isInternal));
    }
    async forgotPassword(email) {
        const user = UserPersistenceService_1.userPersistenceService.getUserByEmail(email);
        if (!user || !user.isActive) {
            return true;
        }
        const resetToken = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        passwordResetTokens.push({
            token: resetToken,
            userId: user.id,
            email: user.email,
            expiresAt
        });
        this.cleanupExpiredTokens();
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        const subject = '🔐 Password Reset Request - Smart Desk Solutions';
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .reset-icon { font-size: 48px; color: #2563eb; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Smart Desk Solutions</h1>
            <p>Administrative Excellence</p>
          </div>
          <div class="content">
            <div class="reset-icon">🔐</div>
            <h2>Password Reset Request</h2>
            <p>Dear ${user.firstName} ${user.lastName},</p>
            <p>We received a request to reset your password for your Smart Desk Solutions account.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing Smart Desk Solutions!</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const text = `
      Password Reset Request - Smart Desk Solutions
      
      Dear ${user.firstName} ${user.lastName},
      
      We received a request to reset your password for your Smart Desk Solutions account.
      
      To reset your password, please click the following link:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this password reset, please ignore this email.
      Your password will remain unchanged until you create a new one.
      
      If you have any questions, please contact our support team.
      
      Thank you for choosing Smart Desk Solutions!
    `;
        return await this.emailService.sendEmail({
            to: user.email,
            subject,
            html,
            text
        });
    }
    async resetPassword(token, newPassword) {
        const resetTokenData = passwordResetTokens.find(t => t.token === token);
        if (!resetTokenData) {
            throw new Error('Invalid or expired reset token');
        }
        if (resetTokenData.expiresAt < new Date()) {
            const index = passwordResetTokens.findIndex(t => t.token === token);
            if (index > -1) {
                passwordResetTokens.splice(index, 1);
            }
            throw new Error('Reset token has expired');
        }
        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        const updated = UserPersistenceService_1.userPersistenceService.updateUser(resetTokenData.userId, {
            password: hashedPassword
        });
        if (!updated) {
            throw new Error('Failed to update password');
        }
        const index = passwordResetTokens.findIndex(t => t.token === token);
        if (index > -1) {
            passwordResetTokens.splice(index, 1);
        }
        return true;
    }
    validateResetToken(token) {
        const resetTokenData = passwordResetTokens.find(t => t.token === token);
        if (!resetTokenData) {
            return { valid: false };
        }
        if (resetTokenData.expiresAt < new Date()) {
            const index = passwordResetTokens.findIndex(t => t.token === token);
            if (index > -1) {
                passwordResetTokens.splice(index, 1);
            }
            return { valid: false };
        }
        return { valid: true, email: resetTokenData.email };
    }
    cleanupExpiredTokens() {
        const now = new Date();
        for (let i = passwordResetTokens.length - 1; i >= 0; i--) {
            if (passwordResetTokens[i].expiresAt < now) {
                passwordResetTokens.splice(i, 1);
            }
        }
    }
    async createDefaultAdmin() {
        const adminExists = UserPersistenceService_1.userPersistenceService.getUserByEmail('admin@smartdesk.com');
        if (adminExists)
            return;
        try {
            await this.registerUser({
                email: 'admin@smartdesk.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin'
            });
            console.log('Default admin user created: admin@smartdesk.com / admin123');
        }
        catch (error) {
            console.log('Admin user already exists or error creating admin:', error);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map