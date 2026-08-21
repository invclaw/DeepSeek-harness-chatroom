import type { ChatroomClientStore, ChatroomView } from './store.js';
interface ChatroomShellProps {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    openRoom(): void;
    closeRoom(): void;
    join(displayName: string): Promise<void>;
    resetIdentity(): Promise<void>;
    send(text: string): Promise<boolean>;
    retry(): Promise<void>;
}
/** Frame-wide chatroom entry and full-screen one-to-many conversation surface. */
export declare function ChatroomShell(props: ChatroomShellProps): JSX.Element;
export type { ChatroomClientStore };
//# sourceMappingURL=ChatroomShell.d.ts.map