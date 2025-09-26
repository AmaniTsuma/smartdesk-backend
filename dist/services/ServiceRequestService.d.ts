import { ServiceRequest } from '../models/User';
export declare class ServiceRequestService {
    private dataService;
    getAllServiceRequests(): ServiceRequest[];
    getClientServiceRequests(clientId: string): ServiceRequest[];
    getAdminServices(): ServiceRequest[];
    getClientRequests(): ServiceRequest[];
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
    updateServiceRequest(requestId: string, updateData: Partial<ServiceRequest>): ServiceRequest | null;
    deleteServiceRequest(requestId: string): boolean;
    getServiceRequestStats(): {
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        cancelled: number;
        review: number;
        disabled: number;
    };
}
export declare const serviceRequestService: ServiceRequestService;
//# sourceMappingURL=ServiceRequestService.d.ts.map