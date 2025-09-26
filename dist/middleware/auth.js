"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientOnly = exports.adminOnly = exports.authorize = exports.authenticate = void 0;
const AuthService_1 = require("../services/AuthService");
const authService = new AuthService_1.AuthService();
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = authService.verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        console.log('Authorization check - User:', req.user, 'Required roles:', roles);
        if (!req.user) {
            console.log('No user found in request');
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            console.log('User role', req.user.role, 'not in required roles', roles);
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }
        console.log('Authorization passed for role:', req.user.role);
        next();
    };
};
exports.authorize = authorize;
exports.adminOnly = (0, exports.authorize)('admin');
exports.clientOnly = (0, exports.authorize)('client');
//# sourceMappingURL=auth.js.map