/** Ask the mounted native composer for one Session to restore editable text. */
export declare function restoreChatroomDraft(sessionId: string, text: string): void;
/** Subscribe a native composer to draft restorations initiated from message controls. */
export declare function subscribeChatroomDraftRestore(sessionId: string, restore: (text: string) => void): () => void;
//# sourceMappingURL=draft-restore.d.ts.map