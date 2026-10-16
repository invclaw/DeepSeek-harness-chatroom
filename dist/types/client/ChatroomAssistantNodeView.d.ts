import type { ComponentType } from 'react';
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { ChatroomAgentTarget } from './store.js';
import type { ChatroomView } from './store.js';
import type { ChatroomForwardItem, ChatroomReplyReference, ChatroomThreadRoot } from '../types.js';
import type { ChatroomReactionEmoji } from '../reactions.js';
export interface ChatroomAssistantNodeViewProps extends ChatNodeViewProps<'assistant-step'> {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    nativeMessageView: ComponentType<ChatNodeViewProps<'assistant-step'>>;
    resolveTarget?(sessionId: string): ChatroomAgentTarget | undefined;
    setReply(roomId: string, reply: ChatroomReplyReference): void;
    openThread(roomId: string, root: ChatroomThreadRoot): Promise<void>;
    toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>;
    openForward(roomId: string, message: ChatroomForwardItem): void;
    toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void;
    recallMessage(roomId: string, messageId: string): Promise<boolean>;
    updateQueuedPrompt(target: {
        readonly roomId: string;
    } | {
        readonly threadId: string;
    }, messageId: string, action: 'guide' | 'delete' | 'edit'): Promise<string | undefined>;
}
/** Keep a completed shared-room turn compact while preserving its native process rows. */
export declare function ChatroomAssistantNodeView(props: ChatroomAssistantNodeViewProps): JSX.Element;
//# sourceMappingURL=ChatroomAssistantNodeView.d.ts.map