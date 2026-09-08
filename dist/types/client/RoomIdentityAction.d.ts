import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { ChatroomView } from './store.js';
interface RoomIdentityActionInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    openMembers(): void;
    openAgents?(): void;
    sessions?: ISessions;
}
type RoomIdentityActionProps = {
    readonly sessionId: SessionId;
} & RoomIdentityActionInjected;
/** Show the current room identity and presence inside the native session header. */
export declare function RoomIdentityAction(props: RoomIdentityActionProps): JSX.Element | null;
/** Expose the existing native child catalog; never turn a session reference into a fake bot. */
export declare function RoomAgentRoster({ sessions, parentSessionId, mainName }: {
    sessions: ISessions;
    parentSessionId: SessionId;
    mainName: string;
}): JSX.Element;
export {};
//# sourceMappingURL=RoomIdentityAction.d.ts.map