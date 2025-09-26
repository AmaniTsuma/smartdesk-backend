"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const ContactService_1 = require("../services/ContactService");
const router = express_1.default.Router();
const contactService = new ContactService_1.ContactService();
const contactValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('company')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Company name must be less than 200 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone number must be less than 20 characters'),
    (0, express_validator_1.body)('service')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Service selection must be less than 100 characters'),
    (0, express_validator_1.body)('message')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Message must be between 1 and 2000 characters')
];
router.post('/', contactValidation, async (req, res) => {
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
        const contactData = {
            name: req.body.name,
            email: req.body.email,
            company: req.body.company || '',
            phone: req.body.phone || '',
            service: req.body.service || '',
            message: req.body.message,
            submittedAt: new Date()
        };
        const result = await contactService.submitContactForm(contactData);
        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            data: {
                id: result.id,
                submittedAt: result.submittedAt
            }
        });
    }
    catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});
router.get('/', async (req, res) => {
    try {
        const submissions = await contactService.getContactSubmissions();
        res.json({
            success: true,
            data: submissions
        });
    }
    catch (error) {
        console.error('Error fetching contact submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map