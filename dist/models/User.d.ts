export interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'client';
    isActive: boolean;
    company?: string;
    phone?: string;
    address?: string;
    industry?: string;
    website?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
}
export interface ClientProfile {
    id: string;
    userId: string;
    company?: string;
    phone?: string;
    address?: string;
    industry?: string;
    website?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ServiceRequest {
    id: string;
    clientId: string;
    title: string;
    description: string;
    serviceType: 'web-development' | 'mobile-development' | 'consulting' | 'maintenance' | 'other';
    status: 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled' | 'disabled' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    estimatedHours?: number;
    actualHours?: number;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    milestones: ServiceMilestone[];
    clientName?: string;
    clientEmail?: string;
    image?: string;
    features?: string[];
    createdBy: 'admin' | 'client';
}
export interface ServiceMilestone {
    id: string;
    serviceRequestId: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate?: Date;
    completedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ServiceUpdate {
    id: string;
    serviceRequestId: string;
    title: string;
    description: string;
    type: 'progress' | 'milestone' | 'issue' | 'completion';
    isInternal: boolean;
    createdAt: Date;
    createdBy: string;
}
export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderEmail: string;
    senderRole: 'admin' | 'client' | 'public';
    recipientId?: string;
    recipientName?: string;
    recipientEmail?: string;
    recipientRole?: 'admin' | 'client' | 'public';
    content: string;
    messageType: 'text' | 'file' | 'image' | 'system';
    conversationId: string;
    isRead: boolean;
    isDeleted: boolean;
    replyToMessageId?: string;
    attachments?: MessageAttachment[];
    createdAt: Date;
    updatedAt: Date;
}
export interface MessageAttachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    uploadedAt: Date;
}
export interface Conversation {
    id: string;
    participants: ConversationParticipant[];
    lastMessage?: Message;
    lastMessageAt?: Date;
    isActive: boolean;
    conversationType: 'client-admin' | 'public-support' | 'group';
    title?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ConversationParticipant {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: 'admin' | 'client' | 'public';
    joinedAt: Date;
    lastSeenAt?: Date;
    isActive: boolean;
}
//# sourceMappingURL=User.d.ts.map