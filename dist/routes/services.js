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
const serviceRequestValidation = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage('Description must be between 20 and 2000 characters'),
    (0, express_validator_1.body)('serviceType')
        .isIn(['web-development', 'mobile-development', 'consulting', 'maintenance', 'other'])
        .withMessage('Invalid service type'),
    (0, express_validator_1.body)('priority')
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
    (0, express_validator_1.body)('estimatedHours')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Estimated hours must be between 1 and 1000')
];
router.post('/request', auth_1.authenticate, auth_1.clientOnly, serviceRequestValidation, async (req, res) => {
    try {
        console.log('Service request received:', req.body);
        console.log('User making request:', req.user);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const fullUser = authService.getUserById(req.user.userId);
        if (!fullUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const serviceRequest = authService.createServiceRequest({
            clientId: req.user.userId,
            title: req.body.title,
            description: req.body.description,
            serviceType: req.body.serviceType,
            priority: req.body.priority,
            estimatedHours: req.body.estimatedHours,
            createdBy: 'client',
            clientName: `${fullUser.firstName} ${fullUser.lastName}`,
            clientEmail: req.user.email
        });
        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            data: serviceRequest
        });
    }
    catch (error) {
        console.error('Create service request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create service request'
        });
    }
});
router.get('/my-requests', auth_1.authenticate, auth_1.clientOnly, async (req, res) => {
    try {
        const serviceRequests = authService.getClientServiceRequests(req.user.userId);
        res.json({
            success: true,
            data: serviceRequests
        });
    }
    catch (error) {
        console.error('Get service requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get service requests'
        });
    }
});
router.get('/all', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const serviceRequests = authService.getAllServiceRequests();
        res.json({
            success: true,
            data: serviceRequests
        });
    }
    catch (error) {
        console.error('Get all service requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get service requests'
        });
    }
});
router.get('/available', async (req, res) => {
    try {
        const adminServices = authService.getAdminServices();
        const availableServices = adminServices.map((service) => ({
            id: service.id,
            serviceType: service.serviceType,
            title: service.title,
            description: service.description,
            icon: service.icon,
            features: service.features,
            image: service.image
        }));
        res.json({
            success: true,
            data: availableServices
        });
    }
    catch (error) {
        console.error('Get available services error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get available services'
        });
    }
});
router.put('/:id/status', auth_1.authenticate, auth_1.adminOnly, [
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'in-progress', 'review', 'completed', 'cancelled'])
        .withMessage('Invalid status')
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
        const { id } = req.params;
        const { status } = req.body;
        const updatedRequest = authService.updateServiceRequestStatus(id, status);
        if (!updatedRequest) {
            res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Service request status updated successfully',
            data: updatedRequest
        });
    }
    catch (error) {
        console.error('Update service request status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update service request status'
        });
    }
});
router.post('/:id/updates', auth_1.authenticate, [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['progress', 'milestone', 'issue', 'completion'])
        .withMessage('Invalid update type'),
    (0, express_validator_1.body)('isInternal')
        .optional()
        .isBoolean()
        .withMessage('isInternal must be a boolean')
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
        const { id } = req.params;
        const { title, description, type, isInternal = false } = req.body;
        const canCreateInternal = req.user.role === 'admin';
        const finalIsInternal = canCreateInternal ? isInternal : false;
        const serviceUpdate = authService.addServiceUpdate({
            serviceRequestId: id,
            title,
            description,
            type,
            isInternal: finalIsInternal,
            createdBy: req.user.userId
        });
        res.status(201).json({
            success: true,
            message: 'Service update added successfully',
            data: serviceUpdate
        });
    }
    catch (error) {
        console.error('Add service update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add service update'
        });
    }
});
router.get('/:id/updates', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const includeInternal = req.user.role === 'admin';
        const updates = authService.getServiceUpdates(id, includeInternal);
        res.json({
            success: true,
            data: updates
        });
    }
    catch (error) {
        console.error('Get service updates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get service updates'
        });
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map