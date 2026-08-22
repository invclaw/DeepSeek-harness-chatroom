import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomClientStore, ChatroomView } from './store.js';
interface ChatroomEntryInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    openRoom(): void;
    closeRoom(): void;
    join(displayName: string, avatarId: string): Promise<void>;
    selectRoom(roomId: string): Promise<void>;
    createRoom(title: string): Promise<void>;
    resetIdentity(): Promise<void>;
    retry(): Promise<void>;
    closeMembers(): void;
    closeThread(): void;
    sendThreadMessage(text: string): Promise<boolean>;
    enableSystemNotifications(): Promise<void>;
    dismissToast(id: string): void;
}
type ChatroomEntryProps = PropsRuntime<'shell.overlay'> & ChatroomEntryInjected;
/** Additive shared-session launcher, identity setup, and room directory. */
export declare function ChatroomEntry(props: ChatroomEntryProps): JSX.Element | null;
export type { ChatroomClientStore };
//# sourceMappingURL=ChatroomEntry.d.ts.map