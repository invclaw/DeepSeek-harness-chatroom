import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { ChatroomView } from './store.js';
interface RoomIdentityActionInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    openMembers(): void;
}
type RoomIdentityActionProps = {
    readonly sessionId: SessionId;
} & RoomIdentityActionInjected;
/** Show the current room identity and presence inside the native session header. */
export declare function RoomIdentityAction(props: RoomIdentityActionProps): JSX.Element | null;
export {};
//# sourceMappingURL=RoomIdentityAction.d.ts.map