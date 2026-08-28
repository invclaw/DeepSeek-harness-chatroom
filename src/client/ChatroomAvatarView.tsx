import { useEffect, useState } from 'react'
import { chatroomAvatar, type ChatroomAvatarId } from '../avatars.js'

interface ChatroomAvatarViewProps {
  readonly participantId: string
  readonly avatarId: ChatroomAvatarId
  readonly avatarUrl?: string
  readonly className: string
  readonly title?: string
}

/** Render a verified enterprise profile image with the deterministic cartoon avatar as its load fallback. */
export function ChatroomAvatarView(props: ChatroomAvatarViewProps): JSX.Element {
  const [failed, setFailed] = useState(false)
  const fallback = chatroomAvatar(props.avatarId, props.participantId)
  useEffect(() => { setFailed(false) }, [props.avatarUrl])
  return <span
    className={props.className}
    data-avatar={fallback.id}
    data-avatar-source={props.avatarUrl === undefined || failed ? 'fallback' : 'enterprise'}
    title={props.title ?? fallback.label}
    aria-hidden
  >
    {props.avatarUrl !== undefined && !failed
      ? <img src={props.avatarUrl} alt="" referrerPolicy="no-referrer" onError={() => { setFailed(true) }} />
      : fallback.emoji}
  </span>
}
