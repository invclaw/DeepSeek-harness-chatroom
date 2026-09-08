import type { ISessions, SessionListState } from '@deepseek-ai/dsh-api-session-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ChatroomClientStore, ChatroomView } from './store.js';
type SidebarSessionList = Pick<SessionListState, 'byId'>;
/** Decorate native Workspace Session rows without replacing the Harness sidebar. */
export declare function installSidebarRoomRows(store: ChatroomClientStore, sessions: ISessions): () => void;
/** Reconcile one document pass; exported for deterministic browser tests. */
export declare function reconcileSidebarRoomRows(documentRoot: Document, snapshot: ChatroomView, currentSessionId?: SessionId, setPinned?: (roomId: string, pinned: boolean) => Promise<boolean>, openDirect?: (peerId?: string) => Promise<void>, closeDirect?: () => void, sessionList?: SidebarSessionList): void;
export {};
//# sourceMappingURL=sidebar-rooms.d.ts.map