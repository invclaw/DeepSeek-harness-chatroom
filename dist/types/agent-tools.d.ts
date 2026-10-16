import type { Context } from '@deepseek-ai/cordis';
import { type ChatroomReactionEmoji } from './reactions.js';
export declare const CHATROOM_AGENT_ACTIONS: readonly ["send_message", "send_file", "react", "reply", "start_branch", "invite_members", "recall_message"];
export type ChatroomAgentAction = typeof CHATROOM_AGENT_ACTIONS[number];
/** Validated arguments passed from the model-facing action tool to the room runtime. */
export interface ChatroomAgentActionInput {
    readonly action: ChatroomAgentAction;
    readonly text?: string;
    readonly messageId?: string;
    readonly emoji?: ChatroomReactionEmoji;
    readonly participantIds?: readonly string[];
    readonly path?: string;
    readonly caption?: string;
}
/** Small runtime surface consumed by Agent-scoped chatroom tools. */
export interface ChatroomAgentToolsHost {
    agentCapabilities(sessionId: string): Promise<{
        readonly room: string;
        readonly scope: 'room' | 'branch';
        readonly members: string[];
        readonly inviteCandidates: string[];
        readonly recentMessages: Array<{
            readonly messageId: string;
            readonly role: 'human' | 'ai';
            readonly displayName: string;
            readonly text: string;
            readonly sourceSessionId?: string;
            readonly sourceSeq?: number;
        }>;
        readonly actions: ChatroomAgentAction[];
    }>;
    agentAction(sessionId: string, input: ChatroomAgentActionInput, signal?: AbortSignal): Promise<{
        readonly action: ChatroomAgentAction;
        readonly summary: string;
        readonly followupText?: string;
    }>;
}
/** Register room-aware collaboration tools on one room or branch Agent context. */
export declare function registerChatroomAgentTools(ctx: Context, host: ChatroomAgentToolsHost, sessionId: string): () => void;
//# sourceMappingURL=agent-tools.d.ts.map