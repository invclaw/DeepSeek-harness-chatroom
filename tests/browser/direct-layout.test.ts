import { afterEach, describe, expect, it } from 'vitest'
import { CHATROOM_STYLES } from '../../src/client/styles.js'

afterEach(() => {
  document.head.replaceChildren()
  document.body.replaceChildren()
})

describe('direct-message cards in a real browser', () => {
  it('keeps a meeting card inside the sender-aligned message column', () => {
    const style = document.createElement('style')
    style.textContent = `${CHATROOM_STYLES}
      body { margin: 0; }
      .dsh-chatroom-direct-messages { width: 1000px; height: 600px; }
    `
    document.head.append(style)
    document.body.innerHTML = `
      <section class="dsh-chatroom-direct-messages">
        <article data-own="true">
          <span class="dsh-chatroom-direct-message-avatar">A</span>
          <div>
            <strong>我</strong>
            <article class="dsh-chatroom-external-card dsh-chatroom-meeting-card">
              <span class="dsh-chatroom-external-icon">🎥</span>
              <span class="dsh-chatroom-external-copy"><strong>快速会议</strong><span>参与人 · Alice</span></span>
              <a href="#meeting">加入会议</a>
            </article>
            <time>16:12</time>
          </div>
        </article>
      </section>
    `

    const messages = requiredElement<HTMLElement>('.dsh-chatroom-direct-messages')
    const message = requiredElement<HTMLElement>('.dsh-chatroom-direct-messages > article')
    const card = requiredElement<HTMLElement>('.dsh-chatroom-meeting-card')
    const messagesBox = messages.getBoundingClientRect()
    const messageBox = message.getBoundingClientRect()
    const cardBox = card.getBoundingClientRect()
    const rightPadding = Number.parseFloat(getComputedStyle(messages).paddingRight)

    expect(getComputedStyle(message).display).toBe('flex')
    expect(getComputedStyle(card).display).toBe('grid')
    expect(messageBox.right).toBeCloseTo(messagesBox.right - rightPadding, 0)
    expect(cardBox.right).toBeLessThanOrEqual(messageBox.right)
    expect(cardBox.left).toBeGreaterThanOrEqual(messageBox.left)
  })
})

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (element === null) throw new Error(`Missing fixture element: ${selector}`)
  return element
}
