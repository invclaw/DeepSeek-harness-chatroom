import type { ChatroomClientStore, ChatroomView } from './store.js'
import { newGroupMentionName } from './store.js'

const MEMBER_OPTION_SELECTOR = 'button[id^="dsh-slash-option-群聊成员-"]'
const AVATAR_CLASS = 'dsh-chatroom-native-mention-avatar'

/** Replace native member-menu emoji with authenticated account avatars when available. */
export function installNativeMentionAvatarImages(store: ChatroomClientStore): () => void {
  const reconcile = (): void => {
    const avatars = mentionAvatarUrls(store.getSnapshot())
    for (const option of document.querySelectorAll<HTMLButtonElement>(MEMBER_OPTION_SELECTOR)) {
      const icon = option.firstElementChild
      const name = icon?.nextElementSibling?.textContent?.trim()
      if (!(icon instanceof HTMLElement) || name === undefined || name === '') continue
      const avatarUrl = avatars.get(name)
      const existing = icon.querySelector<HTMLImageElement>(`:scope > img.${AVATAR_CLASS}`)
      if (avatarUrl === undefined) {
        existing?.remove()
        icon.classList.remove(AVATAR_CLASS)
        delete icon.dataset.dshChatroomAvatarFailed
        continue
      }
      if (existing?.src === avatarUrl) continue
      existing?.remove()
      if (icon.dataset.dshChatroomAvatarFailed === avatarUrl) continue
      icon.classList.add(AVATAR_CLASS)
      const image = document.createElement('img')
      image.alt = ''
      image.referrerPolicy = 'no-referrer'
      image.src = avatarUrl
      image.addEventListener('error', () => {
        icon.dataset.dshChatroomAvatarFailed = avatarUrl
        image.remove()
        icon.classList.remove(AVATAR_CLASS)
      }, { once: true })
      icon.prepend(image)
    }
  }
  const observer = new MutationObserver(reconcile)
  observer.observe(document.body, { childList: true, subtree: true })
  const unsubscribe = store.subscribe(reconcile)
  reconcile()
  return () => {
    unsubscribe()
    observer.disconnect()
    for (const image of document.querySelectorAll<HTMLImageElement>(`${MEMBER_OPTION_SELECTOR} img.${AVATAR_CLASS}`)) {
      const icon = image.parentElement
      image.remove()
      icon?.classList.remove(AVATAR_CLASS)
      if (icon !== null && icon !== undefined) delete icon.dataset.dshChatroomAvatarFailed
    }
  }
}

function mentionAvatarUrls(snapshot: ChatroomView): ReadonlyMap<string, string> {
  const avatars = new Map<string, string>()
  for (const member of snapshot.members) {
    const avatarUrl = safeAvatarUrl(member.avatarUrl)
    if (avatarUrl !== undefined) avatars.set(member.displayName, avatarUrl)
  }
  for (const peer of snapshot.directPeers) {
    const avatarUrl = safeAvatarUrl(peer.avatarUrl)
    if (avatarUrl !== undefined) avatars.set(newGroupMentionName(peer, snapshot.directPeers), avatarUrl)
  }
  return avatars
}

function safeAvatarUrl(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.username === '' && url.password === '' && url.hash === ''
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}
