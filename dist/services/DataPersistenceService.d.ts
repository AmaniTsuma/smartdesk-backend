import { ServiceRequest } from '../models/User';
export declare class DataPersistenceService {
    private static instance;
    private serviceRequests;
    private constructor();
    static getInstance(): DataPersistenceService;
    private ensureDataDirectory;
    private loadServiceRequests;
    reloadServiceRequests(): void;
    private saveServiceRequests;
    private getDefaultServiceRequests;
    getAllServiceRequests(): ServiceRequest[];
    getServiceRequestById(id: string): ServiceRequest | undefined;
    updateServiceRequest(id: string, updateData: Partial<ServiceRequest>): ServiceRequest | null;
    createServiceRequest(requestData: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>): ServiceRequest;
    deleteServiceRequest(id: string): boolean;
    getClientServiceRequests(clientId: string): ServiceRequest[];
}
//# sourceMappingURL=DataPersistenceService.d.ts.map