import type { ChatroomClientStore, ChatroomView } from './store.js';
/** Decorate native Workspace Session rows without replacing the Harness sidebar. */
export declare function installSidebarRoomRows(store: ChatroomClientStore): () => void;
/** Reconcile one document pass; exported for deterministic browser tests. */
export declare function reconcileSidebarRoomRows(documentRoot: Document, snapshot: ChatroomView): void;
//# sourceMappingURL=sidebar-rooms.d.ts.map