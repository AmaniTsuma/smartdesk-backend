export interface ContactFormData {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    service?: string;
    message: string;
    submittedAt: Date;
}
export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    company: string;
    phone: string;
    service: string;
    message: string;
    submittedAt: Date;
    status: 'new' | 'in-progress' | 'completed';
}
export declare class ContactService {
    private submissions;
    private serviceRequestService;
    constructor();
    submitContactForm(data: ContactFormData): Promise<{
        id: string;
        submittedAt: Date;
    }>;
    getContactSubmissions(): Promise<ContactSubmission[]>;
    getSubmissionById(id: string): Promise<ContactSubmission | null>;
    updateSubmissionStatus(id: string, status: 'new' | 'in-progress' | 'completed'): Promise<boolean>;
}
//# sourceMappingURL=ContactService.d.ts.map