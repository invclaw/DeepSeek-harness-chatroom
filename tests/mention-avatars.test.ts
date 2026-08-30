// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { installNativeMentionAvatarImages } from '../src/client/mention-avatars.js'
import type { ChatroomClientStore, ChatroomView } from '../src/client/store.js'

afterEach(() => {
  document.body.replaceChildren()
})

describe('native mention avatars', () => {
  it('uses account avatars and keeps the emoji as a failed-image fallback', () => {
    const option = document.createElement('button')
    option.id = 'dsh-slash-option-群聊成员-0'
    option.innerHTML = '<span>🐼</span><span>Bob</span>'
    document.body.append(option)
    const subscribe = vi.fn(() => () => undefined)
    const store = {
      getSnapshot: () => ({
        members: [{
          participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda',
          avatarUrl: 'https://ioa.example.com/bob.png', joinedAt: 1, lastSeenAt: 1, online: true,
        }],
        directPeers: [],
      } as unknown as ChatroomView),
      subscribe,
    } as unknown as ChatroomClientStore

    const dispose = installNativeMentionAvatarImages(store)
    const icon = option.firstElementChild as HTMLElement
    const image = icon.querySelector('img')
    expect(image?.src).toBe('https://ioa.example.com/bob.png')
    expect(image?.referrerPolicy).toBe('no-referrer')
    expect(icon.textContent).toBe('🐼')

    image?.dispatchEvent(new Event('error'))
    expect(icon.querySelector('img')).toBeNull()
    expect(icon.textContent).toBe('🐼')

    dispose()
  })

  it('rejects non-HTTPS account avatar URLs', () => {
    const option = document.createElement('button')
    option.id = 'dsh-slash-option-群聊成员-0'
    option.innerHTML = '<span>🐼</span><span>Bob</span>'
    document.body.append(option)
    const store = {
      getSnapshot: () => ({
        members: [{
          participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda',
          avatarUrl: 'http://ioa.example.com/bob.png', joinedAt: 1, lastSeenAt: 1, online: true,
        }],
        directPeers: [],
      } as unknown as ChatroomView),
      subscribe: () => () => undefined,
    } as unknown as ChatroomClientStore

    const dispose = installNativeMentionAvatarImages(store)
    expect(option.querySelector('img')).toBeNull()
    dispose()
  })
})
