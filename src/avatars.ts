/** Fixed avatar choices shared by the Host identity validator and browser picker. */
export const CHATROOM_AVATARS = [
  { id: 'whale', emoji: '🐳', label: '鲸鱼' },
  { id: 'panda', emoji: '🐼', label: '熊猫' },
  { id: 'fox', emoji: '🦊', label: '狐狸' },
  { id: 'cat', emoji: '🐱', label: '猫咪' },
  { id: 'dog', emoji: '🐶', label: '狗狗' },
  { id: 'rabbit', emoji: '🐰', label: '兔子' },
  { id: 'octopus', emoji: '🐙', label: '章鱼' },
  { id: 'unicorn', emoji: '🦄', label: '独角兽' },
] as const

/** Stable id of one built-in chatroom avatar. */
export type ChatroomAvatarId = (typeof CHATROOM_AVATARS)[number]['id']

/** Whether an untrusted string names one built-in avatar. */
export function isChatroomAvatarId(value: unknown): value is ChatroomAvatarId {
  return typeof value === 'string' && CHATROOM_AVATARS.some(avatar => avatar.id === value)
}

/** Deterministic fallback for identities and old transcript markers without an avatar. */
export function fallbackAvatarId(seed: string): ChatroomAvatarId {
  let hash = 0
  for (const character of seed) hash = (hash * 31 + character.codePointAt(0)!) >>> 0
  return CHATROOM_AVATARS[hash % CHATROOM_AVATARS.length]!.id
}

/** Display metadata for one validated or historical avatar id. */
export function chatroomAvatar(value: string | undefined, seed: string) {
  const id = isChatroomAvatarId(value) ? value : fallbackAvatarId(seed)
  return CHATROOM_AVATARS.find(avatar => avatar.id === id)!
}
