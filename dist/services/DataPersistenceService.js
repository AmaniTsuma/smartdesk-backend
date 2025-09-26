"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataPersistenceService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, '../../data');
const SERVICE_REQUESTS_FILE = path_1.default.join(DATA_DIR, 'serviceRequests.json');
class DataPersistenceService {
    constructor() {
        this.serviceRequests = [];
        this.ensureDataDirectory();
        this.loadServiceRequests();
    }
    static getInstance() {
        if (!DataPersistenceService.instance) {
            DataPersistenceService.instance = new DataPersistenceService();
        }
        return DataPersistenceService.instance;
    }
    ensureDataDirectory() {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
    }
    loadServiceRequests() {
        try {
            if (fs_1.default.existsSync(SERVICE_REQUESTS_FILE)) {
                const data = fs_1.default.readFileSync(SERVICE_REQUESTS_FILE, 'utf8');
                this.serviceRequests = JSON.parse(data);
                console.log(`Loaded ${this.serviceRequests.length} service requests from file`);
            }
            else {
                this.serviceRequests = this.getDefaultServiceRequests();
                this.saveServiceRequests();
                console.log('Created default service requests file');
            }
        }
        catch (error) {
            console.error('Error loading service requests:', error);
            this.serviceRequests = this.getDefaultServiceRequests();
        }
    }
    reloadServiceRequests() {
        this.loadServiceRequests();
        console.log('Service requests reloaded from file');
    }
    saveServiceRequests() {
        try {
            fs_1.default.writeFileSync(SERVICE_REQUESTS_FILE, JSON.stringify(this.serviceRequests, null, 2));
        }
        catch (error) {
            console.error('Error saving service requests:', error);
        }
    }
    getDefaultServiceRequests() {
        return [
            {
                id: 'service-1',
                clientId: 'client1',
                title: 'Email & Calendar Management',
                description: 'Comprehensive email and calendar management to keep your business organized and efficient.',
                serviceType: 'consulting',
                status: 'in-progress',
                priority: 'high',
                estimatedHours: 40,
                actualHours: 15,
                startDate: new Date('2024-01-15'),
                endDate: new Date('2024-02-15'),
                createdAt: new Date('2024-01-10'),
                updatedAt: new Date('2024-01-25'),
                clientName: 'Client',
                clientEmail: 'client@example.com',
                image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                features: [
                    'Inbox triage and prioritization',
                    'Email response drafting',
                    'Calendar scheduling and management',
                    'Meeting coordination',
                    'Reminder and follow-up systems',
                    'Email template creation'
                ],
                createdBy: 'admin',
                milestones: [
                    {
                        id: 'service-1-1',
                        serviceRequestId: 'service-1',
                        title: 'Inbox Setup & Organization',
                        description: 'Set up email organization system and filters',
                        status: 'completed',
                        dueDate: new Date('2024-01-20'),
                        completedDate: new Date('2024-01-18'),
                        createdAt: new Date('2024-01-10'),
                        updatedAt: new Date('2024-01-18')
                    },
                    {
                        id: 'service-1-2',
                        serviceRequestId: 'service-1',
                        title: 'Calendar Integration',
                        description: 'Integrate and optimize calendar management',
                        status: 'in-progress',
                        dueDate: new Date('2024-02-01'),
                        createdAt: new Date('2024-01-10'),
                        updatedAt: new Date('2024-01-25')
                    }
                ]
            },
            {
                id: 'service-2',
                clientId: 'client2',
                title: 'Data Entry & Reporting',
                description: 'Accurate data handling and comprehensive reporting to keep you informed about your business performance.',
                serviceType: 'consulting',
                status: 'pending',
                priority: 'medium',
                estimatedHours: 60,
                actualHours: 0,
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-03-01'),
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-15'),
                clientName: 'Client',
                clientEmail: 'client@example.com',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                features: [
                    'Data entry and validation',
                    'Weekly performance reports',
                    'Monthly business summaries',
                    'Custom report creation',
                    'Data analysis and insights',
                    'Dashboard maintenance'
                ],
                createdBy: 'admin',
                milestones: [
                    {
                        id: 'service-2-1',
                        serviceRequestId: 'service-2',
                        title: 'Data System Setup',
                        description: 'Set up data entry and reporting systems',
                        status: 'pending',
                        dueDate: new Date('2024-02-10'),
                        createdAt: new Date('2024-01-15'),
                        updatedAt: new Date('2024-01-15')
                    },
                    {
                        id: 'service-2-2',
                        serviceRequestId: 'service-2',
                        title: 'Report Template Creation',
                        description: 'Create custom report templates',
                        status: 'pending',
                        dueDate: new Date('2024-02-20'),
                        createdAt: new Date('2024-01-15'),
                        updatedAt: new Date('2024-01-15')
                    }
                ]
            },
            {
                id: 'service-3',
                clientId: 'client3',
                title: 'Bookkeeping & Invoicing',
                description: 'Professional financial management to keep your books organized and your cash flow healthy.',
                serviceType: 'consulting',
                status: 'completed',
                priority: 'high',
                estimatedHours: 80,
                actualHours: 75,
                startDate: new Date('2023-12-01'),
                endDate: new Date('2024-01-15'),
                createdAt: new Date('2023-11-15'),
                updatedAt: new Date('2024-01-10'),
                clientName: 'Client',
                clientEmail: 'client@example.com',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                features: [
                    'Expense tracking and categorization',
                    'Invoice creation and management',
                    'Payment reconciliation',
                    'Financial record keeping',
                    'Tax preparation support',
                    'Budget monitoring'
                ],
                createdBy: 'admin',
                milestones: [
                    {
                        id: 'service-3-1',
                        serviceRequestId: 'service-3',
                        title: 'Financial System Setup',
                        description: 'Set up bookkeeping and invoicing systems',
                        status: 'completed',
                        dueDate: new Date('2023-12-15'),
                        completedDate: new Date('2023-12-12'),
                        createdAt: new Date('2023-11-15'),
                        updatedAt: new Date('2023-12-12')
                    },
                    {
                        id: 'service-3-2',
                        serviceRequestId: 'service-3',
                        title: 'Process Implementation',
                        description: 'Implement financial management processes',
                        status: 'completed',
                        dueDate: new Date('2024-01-01'),
                        completedDate: new Date('2023-12-28'),
                        createdAt: new Date('2023-11-15'),
                        updatedAt: new Date('2023-12-28')
                    }
                ]
            },
            {
                id: 'service-4',
                clientId: 'client4',
                title: 'Document Preparation',
                description: 'Professional document creation and management to support your business operations.',
                serviceType: 'consulting',
                status: 'in-progress',
                priority: 'medium',
                estimatedHours: 50,
                actualHours: 20,
                startDate: new Date('2024-01-20'),
                endDate: new Date('2024-02-20'),
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-30'),
                clientName: 'Client',
                clientEmail: 'client@example.com',
                image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                features: [
                    'Contract drafting and review',
                    'Presentation creation',
                    'Spreadsheet development',
                    'Proposal writing',
                    'Document formatting',
                    'Template creation'
                ],
                createdBy: 'admin',
                milestones: [
                    {
                        id: 'service-4-1',
                        serviceRequestId: 'service-4',
                        title: 'Template Creation',
                        description: 'Create document templates and standards',
                        status: 'completed',
                        dueDate: new Date('2024-01-25'),
                        completedDate: new Date('2024-01-23'),
                        createdAt: new Date('2024-01-15'),
                        updatedAt: new Date('2024-01-23')
                    },
                    {
                        id: 'service-4-2',
                        serviceRequestId: 'service-4',
                        title: 'Process Documentation',
                        description: 'Document preparation processes and workflows',
                        status: 'in-progress',
                        dueDate: new Date('2024-02-10'),
                        createdAt: new Date('2024-01-15'),
                        updatedAt: new Date('2024-01-30')
                    }
                ]
            },
            {
                id: 'service-5',
                clientId: 'client5',
                title: 'Travel & Meeting Coordination',
                description: 'Seamless travel and meeting coordination to ensure smooth business operations.',
                serviceType: 'consulting',
                status: 'pending',
                priority: 'low',
                estimatedHours: 30,
                actualHours: 0,
                startDate: new Date('2024-02-15'),
                endDate: new Date('2024-03-15'),
                createdAt: new Date('2024-01-20'),
                updatedAt: new Date('2024-01-20'),
                clientName: 'Client',
                clientEmail: 'client@example.com',
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                features: [
                    'Travel itinerary planning',
                    'Hotel and flight bookings',
                    'Meeting room reservations',
                    'Event coordination',
                    'Logistics management',
                    'Travel expense tracking'
                ],
                createdBy: 'admin',
                milestones: [
                    {
                        id: 'service-5-1',
                        serviceRequestId: 'service-5',
                        title: 'Travel System Setup',
                        description: 'Set up travel booking and coordination systems',
                        status: 'pending',
                        dueDate: new Date('2024-02-20'),
                        createdAt: new Date('2024-01-20'),
                        updatedAt: new Date('2024-01-20')
                    },
                    {
                        id: 'service-5-2',
                        serviceRequestId: 'service-5',
                        title: 'Meeting Coordination',
                        description: 'Establish meeting coordination processes',
                        status: 'pending',
                        dueDate: new Date('2024-03-01'),
                        createdAt: new Date('2024-01-20'),
                        updatedAt: new Date('2024-01-20')
                    }
                ]
            },
            {
                id: 'service-6',
                clientId: 'client6',
                title: 'Customer Service Support',
                description: 'Professional customer service to maintain excellent client relationships.',
                serviceType: 'consulting',
                status: 'review',
                priority: 'high',
                estimatedHours: 70,
                actualHours: 65,
                startDate: new Date('2023-11-01'),
                endDate: new Date('2024-01-31'),
                createdAt: new Date('2023-10-15'),
                updatedAt: new Date('2024-01-25'),
                clientName: 'Client',
                clientEmail: 'client@example.com',
                image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                features: [
                    'Email and chat support',
                    'FAQ management',
                    'Customer inquiry handling',
                    'Support ticket management',
                    'Client communication',
                    'Customer satisfaction surveys'
                ],
                createdBy: 'admin',
                milestones: [
                    {
                        id: 'service-6-1',
                        serviceRequestId: 'service-6',
                        title: 'Support System Setup',
                        description: 'Set up customer service support systems',
                        status: 'completed',
                        dueDate: new Date('2023-11-15'),
                        completedDate: new Date('2023-11-12'),
                        createdAt: new Date('2023-10-15'),
                        updatedAt: new Date('2023-11-12')
                    },
                    {
                        id: 'service-6-2',
                        serviceRequestId: 'service-6',
                        title: 'Training & Documentation',
                        description: 'Train staff and create support documentation',
                        status: 'completed',
                        dueDate: new Date('2023-12-01'),
                        completedDate: new Date('2023-11-28'),
                        createdAt: new Date('2023-10-15'),
                        updatedAt: new Date('2023-11-28')
                    },
                    {
                        id: 'service-6-3',
                        serviceRequestId: 'service-6',
                        title: 'Process Optimization',
                        description: 'Optimize customer service processes',
                        status: 'in-progress',
                        dueDate: new Date('2024-01-31'),
                        createdAt: new Date('2023-10-15'),
                        updatedAt: new Date('2024-01-25')
                    }
                ]
            }
        ];
    }
    getAllServiceRequests() {
        return [...this.serviceRequests];
    }
    getServiceRequestById(id) {
        return this.serviceRequests.find(request => request.id === id);
    }
    updateServiceRequest(id, updateData) {
        const index = this.serviceRequests.findIndex(request => request.id === id);
        if (index === -1) {
            return null;
        }
        const updatedRequest = {
            ...this.serviceRequests[index],
            ...updateData,
            updatedAt: new Date()
        };
        this.serviceRequests[index] = updatedRequest;
        this.saveServiceRequests();
        return updatedRequest;
    }
    createServiceRequest(requestData) {
        const newRequest = {
            ...requestData,
            id: `service-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.serviceRequests.push(newRequest);
        this.saveServiceRequests();
        return newRequest;
    }
    deleteServiceRequest(id) {
        const index = this.serviceRequests.findIndex(request => request.id === id);
        if (index === -1) {
            return false;
        }
        this.serviceRequests.splice(index, 1);
        this.saveServiceRequests();
        return true;
    }
    getClientServiceRequests(clientId) {
        return this.serviceRequests.filter(request => request.clientId === clientId);
    }
}
exports.DataPersistenceService = DataPersistenceService;
//# sourceMappingURL=DataPersistenceService.js.map