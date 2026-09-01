import type { ComponentType, ReactNode } from 'react';
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomReplyReference } from '../types.js';
import type { ChatroomAgentTarget, ChatroomClientStore, ChatroomView } from './store.js';
interface ChatroomComposerBaseInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    resolveTarget(sessionId: string): ChatroomAgentTarget | undefined;
}
interface ChatroomQueueInjected {
    updateQueuedPrompt(target: {
        readonly roomId: string;
    } | {
        readonly threadId: string;
    }, messageId: string, action: 'guide' | 'delete' | 'edit'): Promise<string | undefined>;
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
type ComposerDockProps = PropsRuntime<'conversation.input.dock'> & ChatroomFileInjected & ChatroomQueueInjected;
type ComposerRightProps = PropsRuntime<'conversation.input.right'> & ChatroomSessionInjected;
type ComposerAttachmentsInjected = ChatroomComposerBaseInjected & Pick<ChatroomFileInjected, 'clearReply'> & {
    nativeAttachmentsView: ComponentType<ComposerAttachmentsProps>;
};
export type ChatroomComposerAttachmentsProps = ComposerAttachmentsProps & ComposerAttachmentsInjected;
/** Shared emoji chooser used by native room/thread and private composers. */
export declare function ChatroomEmojiPicker({ open, toggle, close, pick, }: {
    readonly open: boolean;
    toggle(): void;
    close(): void;
    pick(emoji: string): void;
}): JSX.Element;
/** Shared reply preview used by native room/thread and private composers. */
export declare function ChatroomReplyPreview({ reply, clear, cancelLabel, }: {
    readonly reply: ChatroomReplyReference;
    readonly cancelLabel?: string;
    clear(): void;
}): JSX.Element;
/** Shared pending-file rail used by native room/thread and private composers. */
export declare function ChatroomPendingFiles({ files, remove, trailing }: {
    readonly files: readonly {
        readonly id: string;
        readonly file: File;
    }[];
    remove(id: string): void;
    readonly trailing?: ReactNode;
}): JSX.Element;
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