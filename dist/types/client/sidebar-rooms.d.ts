import type { ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { ChatroomClientStore, ChatroomView } from './store.js';
/** Decorate native Workspace Session rows without replacing the Harness sidebar. */
export declare function installSidebarRoomRows(store: ChatroomClientStore, sessions: ISessions): () => void;
/** Reconcile one document pass; exported for deterministic browser tests. */
export declare function reconcileSidebarRoomRows(documentRoot: Document, snapshot: ChatroomView, currentSessionId?: SessionId): void;
//# sourceMappingURL=sidebar-rooms.d.ts.map