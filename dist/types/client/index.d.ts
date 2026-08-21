/** Browser half of the AI chatroom plugin. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client';
import { ChatroomClientStore } from './store.js';
export declare const inject: string[];
/** Add room identity and navigation around the existing Harness conversation UI. */
export declare function apply(ctx: ClientContext): void;
/** Build the room-scoped source contributed to RC7's native @ menu. */
export declare function createChatroomAiSource(store: ChatroomClientStore): InputTriggerSource;
declare const _default: {
    inject: string[];
    apply: typeof apply;
};
export default _default;
//# sourceMappingURL=index.d.ts.map