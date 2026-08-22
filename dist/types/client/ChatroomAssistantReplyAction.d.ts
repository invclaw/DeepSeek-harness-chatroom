import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomForwardItem, ChatroomReplyReference, ChatroomThreadRoot } from '../types.js';
import type { ChatroomReactionEmoji } from '../reactions.js';
import type { ChatroomView } from './store.js';
interface AssistantReplyInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    setReply(roomId: string, reply: ChatroomReplyReference): void;
    openThread(roomId: string, root: ChatroomThreadRoot): Promise<void>;
    toggleReaction(roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void>;
    openForward(roomId: string, message: ChatroomForwardItem): void;
    toggleMessageSelection(roomId: string, message: ChatroomForwardItem): void;
}
type AssistantReplyProps = PropsRuntime<'conversation.chat.assistant-actions'> & AssistantReplyInjected;
/** Reply action contributed to finalized AI messages in shared rooms. */
export declare function ChatroomAssistantReplyAction(props: AssistantReplyProps): JSX.Element | null;
export {};
//# sourceMappingURL=ChatroomAssistantReplyAction.d.ts.map