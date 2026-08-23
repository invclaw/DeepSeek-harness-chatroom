/** Model-request compatibility helpers for shared chatroom Sessions. */
import type { GenerateOptions, Message, StreamChunk } from '@deepseek-ai/dsh-llm';
/** Replace image blocks with a deterministic text marker while preserving every message id and source. */
export declare function textCompatibleMessages(messages: readonly Message[]): Message[];
/** Whether any message, including a tool result, contains an image block. */
export declare function messagesContainImages(messages: readonly Message[]): boolean;
/** Build a lazy stream that removes chat-history images only when the selected model is text-only. */
export declare function textCompatibleStream(options: GenerateOptions, next: () => AsyncIterable<StreamChunk>, ownsSession: (sessionId: string) => boolean, resolveModelInfo: (provider: string, model: string, signal?: AbortSignal) => Promise<{
    readonly inputModalities?: readonly string[];
}>, stream: (options: GenerateOptions) => AsyncIterable<StreamChunk>): AsyncIterable<StreamChunk>;
//# sourceMappingURL=model-history.d.ts.map