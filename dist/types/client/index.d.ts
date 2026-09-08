/** Browser half of the AI chatroom plugin. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client';
import { ChatroomClientStore } from './store.js';
export declare const inject: string[];
/** Consume the native connection and UI services materialized by the host. */
export declare function apply(ctx: ClientContext): void;
/** Let RC8's shared settings mirror use the authenticated plugin carrier in a remote browser. */
export declare function activateRemoteSettingsMirror(settingsScope: unknown): () => void;
/** Mount one wrapper only after its native renderer exists, independent of client-plugin load order. */
export declare function mountAfterNativeMessageView<T>(readNative: () => T | undefined, subscribe: (listener: () => void) => () => void, mount: (native: T) => () => void): () => void;
/** Build the room-scoped AI source contributed to RC7's native @ menu. */
export declare function createChatroomAiSource(store: ChatroomClientStore): InputTriggerSource;
/** Build the room-scoped human member source contributed to RC7's native @ menu. */
export declare function createChatroomMemberSource(store: ChatroomClientStore): InputTriggerSource;
declare const _default: {
    inject: string[];
    apply: typeof apply;
};
export default _default;
//# sourceMappingURL=index.d.ts.map