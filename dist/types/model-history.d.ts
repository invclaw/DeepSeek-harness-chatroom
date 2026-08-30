/** Model-request compatibility helpers for shared chatroom Sessions. */
import type { GenerateOptions, Message, StreamChunk } from '@deepseek-ai/dsh-llm';
/** Replace image blocks with a deterministic text marker while preserving every message id and source. */
export declare function textCompatibleMessages(messages: readonly Message[]): Message[];
/** Whether any message, including a tool result, contains an image block. */
export declare function messagesContainImages(messages: readonly Message[]): boolean;
/** Remove recalled messages by their stable model ids while preserving the remaining immutable values. */
export declare function visibleMessages(messages: readonly Message[], recalledIds: ReadonlySet<string>): Message[];
/** Restore provider-required tool-call/result adjacency in Sessions written by older plugin builds. */
export declare function protocolCompatibleMessages(messages: readonly Message[]): Message[];
/** Build a lazy stream that removes chat-history images only when the selected model is text-only. */
export declare function textCompatibleStream(options: GenerateOptions, next: () => AsyncIterable<StreamChunk>, ownsSession: (sessionId: string) => boolean, recalledMessageIds: (sessionId: string) => ReadonlySet<string>, resolveModelInfo: (provider: string, model: string, signal?: AbortSignal) => Promise<{
    readonly inputModalities?: readonly string[];
}>, stream: (options: GenerateOptions) => AsyncIterable<StreamChunk>): AsyncIterable<StreamChunk>;
//# sourceMappingURL=model-history.d.ts.map