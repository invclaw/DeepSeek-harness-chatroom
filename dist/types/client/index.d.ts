import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client';
import { ChatroomClientStore } from './store.js';
export declare const inject: string[];
declare module '@deepseek-ai/cordis' {
    interface Context {
        chatroomClientCapabilities: {
            readonly canManage: boolean;
        };
    }
}
/** Start the native browser connection before installing its chatroom consumers. */
export declare function apply(ctx: ClientContext): Promise<void>;
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