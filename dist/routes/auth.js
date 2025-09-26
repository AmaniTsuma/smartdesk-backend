"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const AuthService_1 = require("../services/AuthService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const authService = new AuthService_1.AuthService();
const registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('role')
        .isIn(['admin', 'client'])
        .withMessage('Role must be either admin or client'),
    (0, express_validator_1.body)('company')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('phone')
        .trim()
        .isLength({ min: 10, max: 20 })
        .withMessage('Phone number must be between 10 and 20 characters')
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const result = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Registration failed'
        });
    }
});
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : 'Login failed'
        });
    }
});
router.post('/logout', auth_1.authenticate, async (req, res) => {
    try {
        console.log(`User ${req.user.userId} logged out`);
        res.json({
            success: true,
            message: 'Logout successful'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});
router.post('/refresh', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = authService.getUserById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const newToken = authService.generateToken(userId, user.email, user.role);
        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: { token: newToken }
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
});
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = authService.getUserById(req.user.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile'
        });
    }
});
router.put('/profile', auth_1.authenticate, [
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const updatedUser = await authService.updateUser(req.user.userId, req.body);
        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});
router.put('/users/:id', auth_1.authenticate, auth_1.adminOnly, [
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'client'])
        .withMessage('Role must be either admin or client'),
    (0, express_validator_1.body)('company')
        .optional()
        .trim()
        .custom((value) => {
        if (value && value.length > 0 && value.length < 2) {
            throw new Error('Company name must be at least 2 characters long');
        }
        if (value && value.length > 100) {
            throw new Error('Company name must be no more than 100 characters long');
        }
        return true;
    }),
    (0, express_validator_1.body)('phone')
        .optional()
        .trim()
        .custom((value) => {
        if (value && value.length > 0 && value.length < 5) {
            throw new Error('Phone number must be at least 5 characters long');
        }
        if (value && value.length > 25) {
            throw new Error('Phone number must be no more than 25 characters long');
        }
        return true;
    }),
    (0, express_validator_1.body)('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean value')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('User update validation errors:', errors.array());
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const userId = req.params.id;
        const updatedUser = await authService.updateUser(userId, req.body);
        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});
router.get('/users', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const users = authService.getAllUsers();
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users'
        });
    }
});
router.delete('/users/:id', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const userId = req.params.id;
        if (userId === req.user.userId) {
            res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
            return;
        }
        const deleted = authService.deleteUser(userId);
        if (deleted) {
            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});
router.get('/dashboard-stats', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const users = authService.getAllUsers();
        const adminServices = authService.getAdminServices();
        const totalUsers = users.length;
        const activeUsers = users.filter(user => user.isActive !== false).length;
        const totalServices = adminServices.length;
        const pendingServices = adminServices.filter(req => req.status === 'pending').length;
        const inProgressServices = adminServices.filter(req => req.status === 'in-progress').length;
        const completedServices = adminServices.filter(req => req.status === 'completed').length;
        const cancelledServices = adminServices.filter(req => req.status === 'cancelled').length;
        const stats = {
            totalUsers,
            activeUsers,
            totalServices,
            pendingServices,
            inProgressServices,
            completedServices,
            cancelledServices
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard statistics'
        });
    }
});
router.get('/client-dashboard-stats', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRequests = authService.getClientRequests().filter(req => req.clientId === userId);
        const adminServices = authService.getAdminServices();
        const activeServices = adminServices.length;
        const completedServices = userRequests.filter(req => req.status === 'completed').length;
        const pendingRequests = userRequests.filter(req => req.status === 'pending').length;
        const rejectedRequests = userRequests.filter(req => req.status === 'rejected').length;
        const stats = {
            activeServices,
            completedServices,
            pendingRequests,
            rejectedRequests
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Get client dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get client dashboard statistics'
        });
    }
});
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email } = req.body;
        const success = await authService.forgotPassword(email);
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request'
        });
    }
});
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { token, password } = req.body;
        const success = await authService.resetPassword(token, password);
        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to reset password'
        });
    }
});
router.get('/validate-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const validation = authService.validateResetToken(token);
        if (validation.valid) {
            res.json({
                success: true,
                message: 'Token is valid',
                data: { email: validation.email }
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }
    catch (error) {
        console.error('Validate reset token error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate token'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map