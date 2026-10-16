import type { Session } from '@deepseek-ai/dsh-session';
/** Replace hidden surface messages without deleting their append-origin transcript. */
export declare function hideChatroomMessages(session: Session, hiddenIds: ReadonlySet<string>): void;
/** Hide passive chat until the current AI turn ends, preserving its transcript position. */
export declare function deferChatroomMessage(session: Session, messageId: string): void;
/** Restore only live placeholders: recalled/reset/compacted chat must never reappear. */
export declare function restoreDeferredChatroomMessages(session: Session, hiddenIds: ReadonlySet<string>, idle?: boolean): void;
/** A new AI conversation retains the complete native human transcript. */
export declare function resetChatroomContext(session: Session): void;
//# sourceMappingURL=model-history.d.ts.map