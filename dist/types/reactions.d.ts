/** Reactions offered by the room message menu. */
export declare const CHATROOM_REACTION_EMOJIS: readonly ["👍", "❤️", "😂", "😮", "😢", "🎉"];
export type ChatroomReactionEmoji = typeof CHATROOM_REACTION_EMOJIS[number];
/** Whether one browser value is an admitted room reaction. */
export declare function isChatroomReactionEmoji(value: unknown): value is ChatroomReactionEmoji;
//# sourceMappingURL=reactions.d.ts.map