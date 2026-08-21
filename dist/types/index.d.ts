/** Multi-user AI chatroom bundle for DeepSeek Harness Web. */
import type { Context } from '@deepseek-ai/cordis';
import { Config, type Config as ChatroomConfig } from './config.js';
import { ChatroomHttpController } from './http.js';
import { ChatroomRuntime } from './room.js';
export declare const name = "deepseek-harness-chatroom";
export declare const inject: string[];
export { Config, ChatroomHttpController, ChatroomRuntime };
export type { ChatroomConfig as ConfigType };
export type * from './types.js';
/** Register the room API immediately and initialize storage/Agent work in the background. */
export declare function apply(ctx: Context, config: ChatroomConfig): void;
declare const _default: {
    name: string;
    inject: string[];
    Config: import("@deepseek-ai/schemastery").default<Config>;
    apply: typeof apply;
};
export default _default;
//# sourceMappingURL=index.d.ts.map