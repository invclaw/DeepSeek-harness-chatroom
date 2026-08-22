/** Reactions offered by the room message menu. */
export const CHATROOM_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'] as const

export type ChatroomReactionEmoji = typeof CHATROOM_REACTION_EMOJIS[number]

/** Whether one browser value is an admitted room reaction. */
export function isChatroomReactionEmoji(value: unknown): value is ChatroomReactionEmoji {
  return typeof value === 'string' && (CHATROOM_REACTION_EMOJIS as readonly string[]).includes(value)
}
