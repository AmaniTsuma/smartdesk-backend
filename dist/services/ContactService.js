"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const uuid_1 = require("uuid");
const ServiceRequestService_1 = require("./ServiceRequestService");
class ContactService {
    constructor() {
        this.submissions = [];
        this.serviceRequestService = new ServiceRequestService_1.ServiceRequestService();
    }
    async submitContactForm(data) {
        const submission = {
            id: (0, uuid_1.v4)(),
            name: data.name,
            email: data.email,
            company: data.company || '',
            phone: data.phone || '',
            service: data.service || '',
            message: data.message,
            submittedAt: data.submittedAt,
            status: 'new'
        };
        this.submissions.push(submission);
        try {
            const serviceRequest = this.serviceRequestService.createServiceRequest({
                clientId: 'contact-form',
                title: `${data.service ? data.service + ' - ' : ''}Contact Form Inquiry`,
                description: `Contact Form Submission:\n\nName: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || 'Not provided'}\nPhone: ${data.phone || 'Not provided'}\nService Interest: ${data.service || 'Not specified'}\n\nMessage:\n${data.message}`,
                serviceType: 'consulting',
                priority: 'medium',
                estimatedHours: 1,
                createdBy: 'client',
                clientName: data.name,
                clientEmail: data.email
            });
            console.log('Contact form submission converted to service request:', {
                contactId: submission.id,
                serviceRequestId: serviceRequest.id,
                name: submission.name,
                email: submission.email,
                service: submission.service
            });
        }
        catch (error) {
            console.error('Failed to create service request from contact form:', error);
        }
        console.log('New contact form submission:', {
            id: submission.id,
            name: submission.name,
            email: submission.email,
            company: submission.company,
            service: submission.service,
            submittedAt: submission.submittedAt
        });
        return {
            id: submission.id,
            submittedAt: submission.submittedAt
        };
    }
    async getContactSubmissions() {
        return this.submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
    async getSubmissionById(id) {
        return this.submissions.find(submission => submission.id === id) || null;
    }
    async updateSubmissionStatus(id, status) {
        const submission = this.submissions.find(submission => submission.id === id);
        if (submission) {
            submission.status = status;
            return true;
        }
        return false;
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=ContactService.js.map