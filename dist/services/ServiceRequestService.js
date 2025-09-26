"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRequestService = exports.ServiceRequestService = void 0;
const DataPersistenceService_1 = require("./DataPersistenceService");
class ServiceRequestService {
    constructor() {
        this.dataService = DataPersistenceService_1.DataPersistenceService.getInstance();
    }
    getAllServiceRequests() {
        return this.dataService.getAllServiceRequests();
    }
    getClientServiceRequests(clientId) {
        return this.dataService.getClientServiceRequests(clientId);
    }
    getAdminServices() {
        return this.dataService.getAllServiceRequests().filter(service => service.createdBy === 'admin');
    }
    getClientRequests() {
        return this.dataService.getAllServiceRequests().filter(service => service.createdBy === 'client');
    }
    createServiceRequest(requestData) {
        const serviceRequestData = {
            clientId: requestData.clientId,
            title: requestData.title,
            description: requestData.description,
            serviceType: requestData.serviceType,
            status: 'pending',
            priority: requestData.priority,
            estimatedHours: requestData.estimatedHours,
            milestones: [],
            createdBy: requestData.createdBy || 'client',
            clientName: requestData.clientName,
            clientEmail: requestData.clientEmail
        };
        return this.dataService.createServiceRequest(serviceRequestData);
    }
    updateServiceRequest(requestId, updateData) {
        return this.dataService.updateServiceRequest(requestId, updateData);
    }
    deleteServiceRequest(requestId) {
        return this.dataService.deleteServiceRequest(requestId);
    }
    getServiceRequestStats() {
        const serviceRequests = this.dataService.getAllServiceRequests();
        return {
            total: serviceRequests.length,
            pending: serviceRequests.filter(request => request.status === 'pending').length,
            inProgress: serviceRequests.filter(request => request.status === 'in-progress').length,
            completed: serviceRequests.filter(request => request.status === 'completed').length,
            cancelled: serviceRequests.filter(request => request.status === 'cancelled').length,
            review: serviceRequests.filter(request => request.status === 'review').length,
            disabled: serviceRequests.filter(request => request.status === 'disabled').length
        };
    }
}
exports.ServiceRequestService = ServiceRequestService;
exports.serviceRequestService = new ServiceRequestService();
//# sourceMappingURL=ServiceRequestService.js.map