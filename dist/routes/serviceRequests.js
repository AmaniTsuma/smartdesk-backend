"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const ServiceRequestService_1 = require("../services/ServiceRequestService");
const DataPersistenceService_1 = require("../services/DataPersistenceService");
const AuthService_1 = require("../services/AuthService");
const EmailService_1 = require("../services/EmailService");
const authService = new AuthService_1.AuthService();
const emailService = new EmailService_1.EmailService();
const router = express_1.default.Router();
const createServiceRequestValidation = [
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
        .withMessage('Invalid priority level'),
    (0, express_validator_1.body)('estimatedBudget')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Estimated budget must be between 1 and 100 characters'),
    (0, express_validator_1.body)('preferredStartDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
    (0, express_validator_1.body)('additionalRequirements')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Additional requirements must not exceed 1000 characters'),
    (0, express_validator_1.body)('estimatedHours')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Estimated hours must be between 1 and 1000')
];
const updateServiceRequestValidation = [
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['pending', 'approved', 'rejected', 'in-progress', 'review', 'completed', 'cancelled', 'disabled'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority'),
    (0, express_validator_1.body)('actualHours')
        .optional()
        .isNumeric()
        .withMessage('Actual hours must be a number'),
    (0, express_validator_1.body)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),
    (0, express_validator_1.body)('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format')
];
router.get('/public', async (req, res) => {
    try {
        const adminServices = ServiceRequestService_1.serviceRequestService.getAdminServices();
        const publicServices = adminServices
            .filter(service => service.status !== 'disabled')
            .map(service => ({
            id: service.id,
            title: service.title,
            description: service.description,
            image: service.image,
            features: service.features || []
        }));
        res.json({
            success: true,
            data: publicServices
        });
    }
    catch (error) {
        console.error('Get public services error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get public services'
        });
    }
});
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        let userRequests;
        if (req.user.role === 'client') {
            const allClientRequests = ServiceRequestService_1.serviceRequestService.getClientRequests();
            userRequests = allClientRequests.filter(request => request.clientId === req.user.userId);
        }
        else {
            userRequests = ServiceRequestService_1.serviceRequestService.getAllServiceRequests();
        }
        res.json({
            success: true,
            data: userRequests
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
router.get('/admin-services', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const adminServices = ServiceRequestService_1.serviceRequestService.getAdminServices();
        res.json({
            success: true,
            data: adminServices
        });
    }
    catch (error) {
        console.error('Get admin services error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin services'
        });
    }
});
router.get('/client-requests', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const clientRequests = ServiceRequestService_1.serviceRequestService.getClientRequests();
        res.json({
            success: true,
            data: clientRequests
        });
    }
    catch (error) {
        console.error('Get client requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get client requests'
        });
    }
});
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const request = ServiceRequestService_1.serviceRequestService.getAllServiceRequests().find(request => request.id === req.params.id);
        if (!request) {
            res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
            return;
        }
        if (req.user.role === 'client' && request.clientId !== req.user.userId) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }
        res.json({
            success: true,
            data: request
        });
    }
    catch (error) {
        console.error('Get service request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get service request'
        });
    }
});
router.post('/', auth_1.authenticate, auth_1.clientOnly, createServiceRequestValidation, async (req, res) => {
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
        const fullUser = authService.getUserById(req.user.userId);
        if (!fullUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const newRequest = ServiceRequestService_1.serviceRequestService.createServiceRequest({
            clientId: req.user.userId,
            title: req.body.title,
            description: req.body.description,
            serviceType: req.body.serviceType,
            priority: req.body.priority,
            estimatedHours: req.body.estimatedHours || 40,
            createdBy: 'client',
            clientName: `${fullUser.firstName} ${fullUser.lastName}`,
            clientEmail: req.user.email
        });
        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            data: newRequest
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
router.put('/:id', auth_1.authenticate, updateServiceRequestValidation, async (req, res) => {
    console.log('=== UPDATE ROUTE CALLED ===');
    console.log('Route params:', req.params);
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    try {
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
        const request = ServiceRequestService_1.serviceRequestService.getAllServiceRequests().find(request => request.id === req.params.id);
        if (!request) {
            res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
            return;
        }
        if (req.user.role === 'client' && request.clientId !== req.user.userId) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }
        console.log('=== BACKEND UPDATE DEBUG ===');
        console.log('Updating service request:', req.params.id);
        console.log('Request body:', req.body);
        console.log('Current service before update:', request);
        const updatedService = ServiceRequestService_1.serviceRequestService.updateServiceRequest(req.params.id, req.body);
        if (!updatedService) {
            res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
            return;
        }
        console.log('Updated service after assignment:', updatedService);
        console.log('=== END BACKEND UPDATE DEBUG ===');
        if (req.body.status && req.body.status !== request.status) {
            const clientName = updatedService.clientName || 'Valued Client';
            const clientEmail = updatedService.clientEmail;
            if (clientEmail) {
                if (req.body.status === 'approved') {
                    try {
                        await emailService.sendServiceRequestApprovalEmail(clientName, clientEmail, updatedService.title, updatedService.description);
                        console.log(`Approval email sent to ${clientEmail}`);
                    }
                    catch (error) {
                        console.error('Failed to send approval email:', error);
                    }
                }
                else if (req.body.status === 'rejected') {
                    try {
                        await emailService.sendServiceRequestRejectionEmail(clientName, clientEmail, updatedService.title, updatedService.description, req.body.rejectionReason);
                        console.log(`Rejection email sent to ${clientEmail}`);
                    }
                    catch (error) {
                        console.error('Failed to send rejection email:', error);
                    }
                }
            }
            else {
                console.log('No client email found, skipping email notification');
            }
        }
        res.json({
            success: true,
            message: 'Service request updated successfully',
            data: updatedService
        });
    }
    catch (error) {
        console.error('Update service request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update service request'
        });
    }
});
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const request = ServiceRequestService_1.serviceRequestService.getAllServiceRequests().find(request => request.id === req.params.id);
        if (!request) {
            res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
            return;
        }
        if (req.user.role === 'client' && request.clientId !== req.user.userId) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }
        const deleted = ServiceRequestService_1.serviceRequestService.deleteServiceRequest(req.params.id);
        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Service request deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete service request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete service request'
        });
    }
});
router.get('/stats/overview', auth_1.authenticate, async (req, res) => {
    try {
        let stats;
        if (req.user.role === 'client') {
            const userRequests = ServiceRequestService_1.serviceRequestService.getClientServiceRequests(req.user.userId);
            stats = {
                total: userRequests.length,
                pending: userRequests.filter(request => request.status === 'pending').length,
                inProgress: userRequests.filter(request => request.status === 'in-progress').length,
                completed: userRequests.filter(request => request.status === 'completed').length,
                cancelled: userRequests.filter(request => request.status === 'cancelled').length
            };
        }
        else {
            const adminServices = ServiceRequestService_1.serviceRequestService.getAdminServices();
            const clientRequests = ServiceRequestService_1.serviceRequestService.getClientRequests();
            stats = {
                totalServices: adminServices.length,
                totalRequests: clientRequests.length,
                total: adminServices.length + clientRequests.length,
                servicesPending: adminServices.filter(service => service.status === 'pending').length,
                servicesInProgress: adminServices.filter(service => service.status === 'in-progress').length,
                servicesCompleted: adminServices.filter(service => service.status === 'completed').length,
                requestsPending: clientRequests.filter(request => request.status === 'pending').length,
                requestsInProgress: clientRequests.filter(request => request.status === 'in-progress').length,
                requestsCompleted: clientRequests.filter(request => request.status === 'completed').length
            };
        }
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics'
        });
    }
});
router.post('/admin-create', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const newService = ServiceRequestService_1.serviceRequestService.createServiceRequest({
            clientId: 'admin',
            title: req.body.title,
            description: req.body.description,
            serviceType: req.body.serviceType || 'consulting',
            priority: req.body.priority || 'medium',
            estimatedHours: req.body.estimatedHours || 0,
            createdBy: 'admin'
        });
        if (req.body.image || req.body.features || req.body.clientName || req.body.clientEmail) {
            const updatedService = {
                ...newService,
                image: req.body.image,
                features: req.body.features || [],
                clientName: req.body.clientName || 'Admin',
                clientEmail: req.body.clientEmail || 'admin@smartdesk.com',
                actualHours: req.body.actualHours || 0
            };
            ServiceRequestService_1.serviceRequestService.updateServiceRequest(newService.id, updatedService);
            res.status(201).json({
                success: true,
                message: 'Service created successfully',
                data: updatedService
            });
            return;
        }
        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: newService
        });
    }
    catch (error) {
        console.error('Admin create service error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create service'
        });
    }
});
router.post('/test-email', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const { email, type, status } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
            return;
        }
        let emailSent = false;
        if (type === 'approval') {
            emailSent = await emailService.sendServiceRequestApprovalEmail('Test Client', email, 'Test Service Request', 'This is a test service request for email functionality testing.');
        }
        else if (type === 'rejection') {
            emailSent = await emailService.sendServiceRequestRejectionEmail('Test Client', email, 'Test Service Request', 'This is a test service request for email functionality testing.', 'This is a test rejection reason.');
        }
        else if (status && ['in-progress', 'review', 'completed', 'cancelled'].includes(status)) {
            emailSent = await emailService.sendServiceRequestStatusUpdateEmail('Test Client', email, 'Test Service Request', 'This is a test service request for email functionality testing.', status, 'This is a test status update.');
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Type must be "approval", "rejection", or provide a valid status'
            });
            return;
        }
        res.json({
            success: emailSent,
            message: emailSent ? 'Test email sent successfully' : 'Failed to send test email'
        });
    }
    catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email'
        });
    }
});
router.post('/reload', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const dataService = DataPersistenceService_1.DataPersistenceService.getInstance();
        dataService.reloadServiceRequests();
        res.json({
            success: true,
            message: 'Service requests reloaded successfully'
        });
    }
    catch (error) {
        console.error('Reload service requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reload service requests'
        });
    }
});
router.post('/populate-sample', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const sampleServices = [
            {
                id: 'sample-1',
                clientId: 'sample-client-1',
                title: 'Email & Calendar Management',
                description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
                serviceType: 'consulting',
                status: 'in-progress',
                priority: 'high',
                estimatedHours: 40,
                actualHours: 15,
                startDate: '2024-01-15',
                endDate: '2024-02-15',
                createdAt: '2024-01-10',
                updatedAt: '2024-01-20',
                image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                icon: '📧',
                features: [
                    'Inbox triage and prioritization',
                    'Email response drafting',
                    'Calendar scheduling and management',
                    'Meeting coordination',
                    'Reminder and follow-up systems',
                    'Email template creation'
                ],
                milestones: [
                    {
                        id: 'sample-1-1',
                        title: 'Email Setup & Configuration',
                        description: 'Configure email accounts and calendar integration',
                        status: 'completed',
                        dueDate: '2024-01-20',
                        completedDate: '2024-01-18'
                    },
                    {
                        id: 'sample-1-2',
                        title: 'Calendar Management Setup',
                        description: 'Set up calendar management systems and workflows',
                        status: 'in-progress',
                        dueDate: '2024-02-05'
                    }
                ]
            },
            {
                id: 'sample-2',
                clientId: 'sample-client-2',
                title: 'Data Entry & Reporting',
                description: 'Accurate data handling and comprehensive reporting to keep you informed about your business performance.',
                serviceType: 'consulting',
                status: 'pending',
                priority: 'medium',
                estimatedHours: 60,
                actualHours: 0,
                startDate: '2024-01-25',
                endDate: '2024-03-25',
                createdAt: '2024-01-18',
                updatedAt: '2024-01-18',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                icon: '📊',
                features: [
                    'Data entry and validation',
                    'Weekly performance reports',
                    'Monthly business summaries',
                    'Custom report creation',
                    'Data analysis and insights',
                    'Dashboard maintenance'
                ],
                milestones: [
                    {
                        id: 'sample-2-1',
                        title: 'Data Analysis & Planning',
                        description: 'Analyze current data structure and plan reporting system',
                        status: 'pending',
                        dueDate: '2024-02-01'
                    }
                ]
            },
            {
                id: 'sample-3',
                clientId: 'sample-client-3',
                title: 'Bookkeeping & Invoicing',
                description: 'Professional financial management to keep your books organized and your cash flow healthy.',
                serviceType: 'consulting',
                status: 'completed',
                priority: 'high',
                estimatedHours: 80,
                actualHours: 75,
                startDate: '2023-12-01',
                endDate: '2024-01-15',
                createdAt: '2023-11-25',
                updatedAt: '2024-01-15',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                icon: '💰',
                features: [
                    'Expense tracking and categorization',
                    'Invoice creation and management',
                    'Payment reconciliation',
                    'Financial record keeping',
                    'Tax preparation support',
                    'Budget monitoring'
                ],
                milestones: [
                    {
                        id: 'sample-3-1',
                        title: 'Financial System Setup',
                        description: 'Set up bookkeeping and invoicing systems',
                        status: 'completed',
                        dueDate: '2023-12-15',
                        completedDate: '2023-12-12'
                    },
                    {
                        id: 'sample-3-2',
                        title: 'Monthly Reporting',
                        description: 'Implement monthly financial reporting',
                        status: 'completed',
                        dueDate: '2024-01-10',
                        completedDate: '2024-01-08'
                    }
                ]
            },
            {
                id: 'sample-4',
                clientId: 'sample-client-4',
                title: 'Document Preparation',
                description: 'Professional document creation and management to support your business operations.',
                serviceType: 'consulting',
                status: 'in-progress',
                priority: 'medium',
                estimatedHours: 30,
                actualHours: 12,
                startDate: '2024-01-20',
                endDate: '2024-02-20',
                createdAt: '2024-01-15',
                updatedAt: '2024-01-25',
                image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                icon: '📄',
                features: [
                    'Contract drafting and review',
                    'Presentation creation',
                    'Spreadsheet development',
                    'Proposal writing',
                    'Document formatting',
                    'Template creation'
                ],
                milestones: [
                    {
                        id: 'sample-4-1',
                        title: 'Document Templates',
                        description: 'Create standardized document templates',
                        status: 'completed',
                        dueDate: '2024-01-25',
                        completedDate: '2024-01-23'
                    },
                    {
                        id: 'sample-4-2',
                        title: 'Workflow Implementation',
                        description: 'Implement document workflow processes',
                        status: 'in-progress',
                        dueDate: '2024-02-10'
                    }
                ]
            },
            {
                id: 'sample-5',
                clientId: 'sample-client-5',
                title: 'Travel & Meeting Coordination',
                description: 'Seamless travel and meeting coordination to ensure smooth business operations.',
                serviceType: 'consulting',
                status: 'pending',
                priority: 'low',
                estimatedHours: 25,
                actualHours: 0,
                startDate: '2024-02-01',
                endDate: '2024-03-01',
                createdAt: '2024-01-22',
                updatedAt: '2024-01-22',
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                icon: '✈️',
                features: [
                    'Travel itinerary planning',
                    'Hotel and flight bookings',
                    'Meeting room reservations',
                    'Event coordination',
                    'Logistics management',
                    'Travel expense tracking'
                ],
                milestones: [
                    {
                        id: 'sample-5-1',
                        title: 'Travel Planning Setup',
                        description: 'Set up travel booking and coordination systems',
                        status: 'pending',
                        dueDate: '2024-02-05'
                    }
                ]
            },
            {
                id: 'sample-6',
                clientId: 'sample-client-6',
                title: 'Customer Service Support',
                description: 'Professional customer service to maintain excellent client relationships.',
                serviceType: 'consulting',
                status: 'completed',
                priority: 'high',
                estimatedHours: 50,
                actualHours: 48,
                startDate: '2023-11-01',
                endDate: '2024-01-10',
                createdAt: '2023-10-25',
                updatedAt: '2024-01-10',
                image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                icon: '💬',
                features: [
                    'Email and chat support',
                    'FAQ management',
                    'Customer inquiry handling',
                    'Support ticket management',
                    'Client communication',
                    'Customer satisfaction surveys'
                ],
                milestones: [
                    {
                        id: 'sample-6-1',
                        title: 'Support System Setup',
                        description: 'Implement customer support ticketing system',
                        status: 'completed',
                        dueDate: '2023-11-15',
                        completedDate: '2023-11-12'
                    },
                    {
                        id: 'sample-6-2',
                        title: 'Training & Documentation',
                        description: 'Train staff and create support documentation',
                        status: 'completed',
                        dueDate: '2023-12-01',
                        completedDate: '2023-11-28'
                    }
                ]
            }
        ];
        for (const sampleService of sampleServices) {
            ServiceRequestService_1.serviceRequestService.createServiceRequest({
                clientId: sampleService.clientId,
                title: sampleService.title,
                description: sampleService.description,
                serviceType: sampleService.serviceType,
                priority: sampleService.priority,
                estimatedHours: sampleService.estimatedHours,
                createdBy: 'admin'
            });
        }
        const totalServices = ServiceRequestService_1.serviceRequestService.getAllServiceRequests().length;
        res.json({
            success: true,
            message: 'Sample services added successfully',
            data: {
                added: sampleServices.length,
                total: totalServices
            }
        });
    }
    catch (error) {
        console.error('Populate sample services error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to populate sample services'
        });
    }
});
exports.default = router;
//# sourceMappingURL=serviceRequests.js.map