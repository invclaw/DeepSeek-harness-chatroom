import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomReplyReference, ChatroomThreadRoot } from '../types.js';
import type { ChatroomView } from './store.js';
interface AssistantReplyInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    setReply(roomId: string, reply: ChatroomReplyReference): void;
    openThread(roomId: string, root: ChatroomThreadRoot): Promise<void>;
}
type AssistantReplyProps = PropsRuntime<'conversation.chat.assistant-actions'> & AssistantReplyInjected;
/** Reply action contributed to finalized AI messages in shared rooms. */
export declare function ChatroomAssistantReplyAction(props: AssistantReplyProps): JSX.Element | null;
export {};
//# sourceMappingURL=ChatroomAssistantReplyAction.d.ts.map