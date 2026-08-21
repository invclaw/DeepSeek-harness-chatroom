import type { ChatroomMessageRole } from './types.js';
export interface IdentityRecord {
    readonly participantId: string;
    readonly displayName: string;
    readonly createdAt: number;
    readonly lastSeenAt: number;
}
export interface MessageRecord {
    readonly id: string;
    readonly sequence: number;
    readonly role: ChatroomMessageRole;
    readonly participantId: string;
    readonly displayName: string;
    readonly text: string;
    readonly createdAt: number;
    readonly inReplyTo?: string;
    readonly aiProcessed?: boolean;
}
/** Durable browser identities and room messages. */
export declare const chatroomDomainSpec: {
    name: string;
    version: number;
    tables: {
        identities: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, IdentityRecord>;
        messages: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, MessageRecord>;
    };
};
//# sourceMappingURL=domain.d.ts.map