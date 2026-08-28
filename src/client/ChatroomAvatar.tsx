import { useEffect, useState } from 'react'
import { chatroomAvatar } from '../avatars.js'

export interface ChatroomAvatarProps {
  readonly avatarId?: string | undefined
  readonly avatarUrl?: string | undefined
  readonly seed: string
  readonly className?: string
  readonly title?: string
}

/** One safe avatar surface shared by members, contacts, identities, and messages. */
export function ChatroomAvatar({ avatarId, avatarUrl, seed, className = 'dsh-chatroom-avatar', title }: ChatroomAvatarProps): JSX.Element {
  const [failed, setFailed] = useState(false)
  const fallback = chatroomAvatar(avatarId, seed)
  const remoteUrl = safeAvatarUrl(avatarUrl) ? avatarUrl : undefined
  useEffect(() => { setFailed(false) }, [remoteUrl])
  return <span
    className={className}
    data-avatar={fallback.id}
    title={title ?? fallback.label}
    aria-label={title ?? fallback.label}
  >
    {remoteUrl !== undefined && !failed && <img
      src={remoteUrl}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => { setFailed(true) }}
    />}
    <span aria-hidden>{fallback.emoji}</span>
  </span>
}

function safeAvatarUrl(value: string | undefined): value is string {
  if (value === undefined) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.username === '' && url.password === '' && url.hash === ''
  } catch {
    return false
  }
}
