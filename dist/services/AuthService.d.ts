import { User, ServiceRequest, ServiceUpdate } from '../models/User';
export declare class AuthService {
    private emailService;
    constructor();
    registerUser(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: 'admin' | 'client';
        company?: string;
        phone?: string;
    }): Promise<{
        user: Omit<User, 'password'>;
        token: string;
    }>;
    loginUser(email: string, password: string): Promise<{
        user: Omit<User, 'password'>;
        token: string;
    }>;
    verifyToken(token: string): {
        userId: string;
        email: string;
        role: string;
    };
    generateToken(userId: string, email: string, role: string): string;
    getUserById(userId: string): Omit<User, 'password'> | null;
    getAllUsers(): Omit<User, 'password'>[];
    updateUser(userId: string, updateData: Partial<Omit<User, 'id' | 'password' | 'createdAt'>>): Promise<Omit<User, 'password'> | null>;
    deleteUser(userId: string): boolean;
    createServiceRequest(requestData: {
        clientId: string;
        title: string;
        description: string;
        serviceType: 'web-development' | 'mobile-development' | 'consulting' | 'maintenance' | 'other';
        priority: 'low' | 'medium' | 'high';
        estimatedHours?: number;
        createdBy?: 'admin' | 'client';
        clientName?: string;
        clientEmail?: string;
    }): ServiceRequest;
    getClientServiceRequests(clientId: string): ServiceRequest[];
    getAdminServices(): ServiceRequest[];
    getClientRequests(): ServiceRequest[];
    getAllServiceRequests(): ServiceRequest[];
    updateServiceRequestStatus(requestId: string, status: ServiceRequest['status']): ServiceRequest | null;
    addServiceUpdate(updateData: {
        serviceRequestId: string;
        title: string;
        description: string;
        type: 'progress' | 'milestone' | 'issue' | 'completion';
        isInternal: boolean;
        createdBy: string;
    }): ServiceUpdate;
    getServiceUpdates(serviceRequestId: string, includeInternal?: boolean): ServiceUpdate[];
    forgotPassword(email: string): Promise<boolean>;
    resetPassword(token: string, newPassword: string): Promise<boolean>;
    validateResetToken(token: string): {
        valid: boolean;
        email?: string;
    };
    private cleanupExpiredTokens;
    createDefaultAdmin(): Promise<void>;
}
//# sourceMappingURL=AuthService.d.ts.map