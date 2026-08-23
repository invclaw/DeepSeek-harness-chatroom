import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomAgentTarget, ChatroomClientStore, ChatroomView } from './store.js';
interface ChatroomComposerInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    addFiles(roomId: string, files: readonly File[]): void;
    removeFile(roomId: string, fileId: string): void;
    clearReply(roomId: string): void;
    sendFiles(roomId: string): Promise<void>;
    resolveTarget(sessionId: string): ChatroomAgentTarget | undefined;
}
type FileActionProps = PropsRuntime<'conversation.input.left'> & ChatroomComposerInjected;
type ComposerDockProps = PropsRuntime<'conversation.input.dock'> & ChatroomComposerInjected;
/** Small file chooser inside the native composer tool row. */
export declare function ChatroomFileAction(props: FileActionProps): JSX.Element | null;
/** Reply quote and pending file rail above the native composer. */
export declare function ChatroomComposerDock(props: ComposerDockProps): JSX.Element | null;
export type { ChatroomClientStore };
//# sourceMappingURL=ChatroomComposer.d.ts.map