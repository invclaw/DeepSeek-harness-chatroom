/** Visual position of one message inside a consecutive sender group. */
export type ChatroomMessageGroupPosition = 'single' | 'start' | 'middle' | 'end';
/** Compute a message's position among adjacent messages from the same sender. */
export declare function chatroomMessageGroupPosition<T>(messages: readonly T[], index: number, sender: (message: T) => string, createdAt: (message: T) => number): ChatroomMessageGroupPosition;
/** Stable identifier shared by adjacent messages in one visual sender group. */
export declare function chatroomMessageActionGroup<T>(messages: readonly T[], index: number, sender: (message: T) => string, createdAt: (message: T) => number): string;
/** Move the group's one visible action rail to the hovered message. */
export declare function activateGroupedMessageActions(message: HTMLElement): void;
/** Restore the group's one visible action rail to its final message. */
export declare function restoreGroupedMessageActions(message: HTMLElement): void;
/** Reconcile native conversation rows after one participant message mounts or unmounts. */
export declare function reconcileNativeMessageGroups(message: HTMLElement, sender: string, createdAt: number): () => void;
//# sourceMappingURL=message-grouping.d.ts.map