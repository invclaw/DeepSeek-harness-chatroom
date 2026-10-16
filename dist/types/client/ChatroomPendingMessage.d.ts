import type { ChatroomPendingMessage } from '../types.js';
export interface ChatroomPendingMessageProps {
    readonly message: ChatroomPendingMessage;
    readonly own: boolean;
    readonly sessionId: string;
    update(target: {
        readonly roomId: string;
    }, messageId: string, action: 'guide' | 'delete' | 'edit'): Promise<string | undefined>;
}
/** Immediately shared participant bubble whose AI admission is still mutable. */
export declare function ChatroomPendingMessageView(props: ChatroomPendingMessageProps): JSX.Element;
//# sourceMappingURL=ChatroomPendingMessage.d.ts.map