export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private transporter;
    constructor();
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendServiceRequestApprovalEmail(clientName: string, clientEmail: string, requestTitle: string, requestDescription: string): Promise<boolean>;
    sendServiceRequestStatusUpdateEmail(clientName: string, clientEmail: string, requestTitle: string, requestDescription: string, status: string, reason?: string): Promise<boolean>;
    sendServiceRequestRejectionEmail(clientName: string, clientEmail: string, requestTitle: string, requestDescription: string, reason?: string): Promise<boolean>;
    sendWelcomeEmail(clientName: string, clientEmail: string, clientRole: 'admin' | 'client'): Promise<boolean>;
}
//# sourceMappingURL=EmailService.d.ts.map