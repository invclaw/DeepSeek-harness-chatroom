import type { ComponentType } from 'react';
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomAgentTarget, ChatroomClientStore, ChatroomView } from './store.js';
interface ChatroomComposerBaseInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    resolveTarget(sessionId: string): ChatroomAgentTarget | undefined;
}
interface ChatroomFileInjected extends ChatroomComposerBaseInjected {
    addFiles(roomId: string, files: readonly File[]): void;
    removeFile(roomId: string, fileId: string): void;
    clearReply(roomId: string): void;
    sendFiles(roomId: string): Promise<void>;
}
interface ChatroomSessionInjected extends ChatroomComposerBaseInjected {
    stopRoomSession(roomId: string): Promise<boolean>;
    newRoomSession(roomId: string): Promise<boolean>;
    quickMeeting(roomId: string): Promise<boolean>;
    quickThreadMeeting(threadId: string): Promise<boolean>;
}
type FileActionProps = PropsRuntime<'conversation.input.left'> & ChatroomFileInjected;
type ComposerDockProps = PropsRuntime<'conversation.input.dock'> & ChatroomFileInjected;
type ComposerRightProps = PropsRuntime<'conversation.input.right'> & ChatroomSessionInjected;
type ComposerAttachmentsInjected = ChatroomComposerBaseInjected & Pick<ChatroomFileInjected, 'clearReply'> & {
    nativeAttachmentsView: ComponentType<ComposerAttachmentsProps>;
};
export type ChatroomComposerAttachmentsProps = ComposerAttachmentsProps & ComposerAttachmentsInjected;
/** Small file chooser inside the native composer tool row. */
export declare function ChatroomFileAction(props: FileActionProps): JSX.Element | null;
/** Native-composer controls for stopping work or rotating the room Session. */
export declare function ChatroomSessionControls(props: ComposerRightProps): JSX.Element | null;
/** Pending file rail above the native composer. */
export declare function ChatroomComposerDock(props: ComposerDockProps): JSX.Element | null;
/** Persistent visual boundary between retained room history and a fresh AI context. */
export declare function ChatroomContextResetDivider(): JSX.Element;
/** Native attachment renderer plus an in-card reply preview for shared sessions. */
export declare function ChatroomComposerAttachments(props: ChatroomComposerAttachmentsProps): JSX.Element;
export type { ChatroomClientStore };
//# sourceMappingURL=ChatroomComposer.d.ts.map