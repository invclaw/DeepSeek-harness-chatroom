import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomClientStore, ChatroomView } from './store.js';
interface ChatroomEntryInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    openRoom(): void;
    closeRoom(): void;
    join(displayName: string): Promise<void>;
    retry(): Promise<void>;
}
type ChatroomEntryProps = PropsRuntime<'shell.overlay'> & ChatroomEntryInjected;
/** Additive room launcher plus the first-visit identity dialog. */
export declare function ChatroomEntry(props: ChatroomEntryProps): JSX.Element | null;
export type { ChatroomClientStore };
//# sourceMappingURL=ChatroomEntry.d.ts.map