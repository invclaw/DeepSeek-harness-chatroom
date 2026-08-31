// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import {
  CHATROOM_SETTINGS_NAV_MARKER,
  registerChatroomSettingsNavIcon,
} from '../src/client/settings-nav-icon.js'

function navButton(label: string): HTMLButtonElement {
  const button = document.createElement('button')
  button.innerHTML = `<svg data-fallback="gear"></svg><span>${label}</span>`
  return button
}

function dialogWith(...buttons: HTMLButtonElement[]): HTMLElement {
  const dialog = document.createElement('div')
  dialog.setAttribute('role', 'dialog')
  const nav = document.createElement('nav')
  nav.append(...buttons)
  dialog.append(nav)
  return dialog
}

async function mutationTick(): Promise<void> {
  await new Promise<void>(resolve => { setTimeout(resolve, 0) })
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('registerChatroomSettingsNavIcon', () => {
  it('marks only the chatroom row and preserves the shell icon node', () => {
    const status = navButton('数据与运行状态')
    const chatroom = navButton('群聊与账号')
    document.body.append(dialogWith(status, chatroom))

    const dispose = registerChatroomSettingsNavIcon(() => '群聊与账号')

    expect(status.hasAttribute(CHATROOM_SETTINGS_NAV_MARKER)).toBe(false)
    expect(chatroom.hasAttribute(CHATROOM_SETTINGS_NAV_MARKER)).toBe(true)
    expect(chatroom.querySelector('[data-fallback="gear"]')).not.toBeNull()
    dispose()
    expect(chatroom.hasAttribute(CHATROOM_SETTINGS_NAV_MARKER)).toBe(false)
  })

  it('handles a dialog mounted later and follows a localized label update', async () => {
    let label = 'Chatroom & accounts'
    const dispose = registerChatroomSettingsNavIcon(() => label)
    const english = navButton('Chatroom & accounts')
    const chinese = navButton('群聊与账号')
    document.body.append(dialogWith(english, chinese))
    await mutationTick()

    expect(english.hasAttribute(CHATROOM_SETTINGS_NAV_MARKER)).toBe(true)
    expect(chinese.hasAttribute(CHATROOM_SETTINGS_NAV_MARKER)).toBe(false)

    label = '群聊与账号'
    chinese.querySelector('span')!.textContent = '群聊与账号 '
    await mutationTick()
    expect(english.hasAttribute(CHATROOM_SETTINGS_NAV_MARKER)).toBe(false)
    expect(chinese.hasAttribute(CHATROOM_SETTINGS_NAV_MARKER)).toBe(true)

    dispose()
  })
})
