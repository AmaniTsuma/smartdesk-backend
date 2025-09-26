import { Message, Conversation, ConversationParticipant, MessageAttachment } from '../models/User';
export declare class MessagingService {
    private conversations;
    private messages;
    constructor();
    private ensureDataDirectory;
    private loadData;
    private saveConversations;
    private saveMessages;
    migrateExistingConversations(): void;
    createConversation(participants: ConversationParticipant[], conversationType: 'client-admin' | 'public-support' | 'group', title?: string): Conversation;
    getUserConversations(userId: string, userRole: 'admin' | 'client' | 'public'): Conversation[];
    getAllConversations(): Conversation[];
    getOrCreateConversation(senderId: string, senderName: string, senderEmail: string, senderRole: 'admin' | 'client' | 'public', recipientId?: string, recipientName?: string, recipientEmail?: string, recipientRole?: 'admin' | 'client' | 'public'): Conversation;
    sendMessage(senderId: string, senderName: string, senderEmail: string, senderRole: 'admin' | 'client' | 'public', content: string, conversationId?: string, recipientId?: string, recipientName?: string, recipientEmail?: string, recipientRole?: 'admin' | 'client' | 'public', messageType?: 'text' | 'file' | 'image' | 'system', attachments?: MessageAttachment[]): Message;
    getConversationMessages(conversationId: string, limit?: number, offset?: number): Message[];
    markMessagesAsRead(conversationId: string, userId: string): void;
    getUnreadMessageCount(userId: string): number;
    getConversationById(conversationId: string): Conversation | null;
    private updateConversation;
    private generateId;
    deleteMessage(messageId: string, userId: string): boolean;
    getOnlineUsers(): string[];
    updateUserLastSeen(userId: string, conversationId: string): void;
}
//# sourceMappingURL=MessagingService.d.ts.map