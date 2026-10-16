import type { Context } from '@deepseek-ai/cordis';
import type { ChatroomExternalCard } from './types.js';
import { type WecomCliClient, type WecomService } from './wecom.js';
/** A tool call captures its credential owner and card writer before starting external work. */
export interface WecomInvocation {
    readonly client: WecomCliClient;
    readonly prepareCard?: (card: ChatroomExternalCard, operation: {
        service: WecomService;
        method: string;
        parameters: unknown;
        result: unknown;
    }) => Promise<ChatroomExternalCard>;
}
/** Register schema-driven official Enterprise WeChat tools on one Agent context. */
export declare function registerWecomAgentTools(ctx: Context, resolveInvocation: () => WecomInvocation): () => void;
//# sourceMappingURL=wecom-tools.d.ts.map