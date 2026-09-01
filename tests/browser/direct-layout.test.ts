import { afterEach, describe, expect, it } from 'vitest'
import { activateGroupedMessageActions, restoreGroupedMessageActions } from '../../src/client/message-grouping.js'
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
        <div class="dsh-chatroom-participant-message dsh-chatroom-direct-message" data-own="true" data-dsh-chatroom-own="true">
          <span class="dsh-chatroom-avatar dsh-chatroom-direct-message-avatar">A</span>
          <div class="dsh-chatroom-message-column">
            <div class="dsh-chatroom-display-name">我</div>
            <article class="dsh-chatroom-external-card dsh-chatroom-meeting-card">
              <span class="dsh-chatroom-external-icon">🎥</span>
              <span class="dsh-chatroom-external-copy"><strong>快速会议</strong><span>参与人 · Alice</span></span>
              <a href="#meeting">加入会议</a>
            </article>
          </div>
        </div>
      </section>
    `

    const messages = requiredElement<HTMLElement>('.dsh-chatroom-direct-messages')
    const message = requiredElement<HTMLElement>('.dsh-chatroom-direct-messages > .dsh-chatroom-direct-message')
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

  it('joins consecutive bubbles and moves one reserved action rail without shifting the transcript', async () => {
    const style = document.createElement('style')
    style.textContent = `${CHATROOM_STYLES}
      body { margin: 0; }
      .dsh-chatroom-direct-messages { width: 1000px; height: 600px; }
    `
    document.head.append(style)
    document.body.innerHTML = `
      <section class="dsh-chatroom-direct-messages">
        <div class="dsh-chatroom-participant-message dsh-chatroom-direct-message" data-testid="message-1" data-own="false" data-dsh-chatroom-own="false" data-dsh-chatroom-group-position="start" data-dsh-chatroom-action-group="bob:1:0" data-dsh-chatroom-actions-visible="false">
          <span class="dsh-chatroom-avatar dsh-chatroom-direct-message-avatar">B</span>
          <div class="dsh-chatroom-message-column"><div class="dsh-chatroom-display-name">Bob</div><span class="dsh-chatroom-human-bubble">第一句</span><div class="dsh-chatroom-message-actions"><button>复制</button><time>10:44</time></div></div>
        </div>
        <div class="dsh-chatroom-participant-message dsh-chatroom-direct-message" data-testid="message-2" data-own="false" data-dsh-chatroom-own="false" data-dsh-chatroom-group-position="middle" data-dsh-chatroom-action-group="bob:1:0" data-dsh-chatroom-actions-visible="false">
          <span class="dsh-chatroom-avatar dsh-chatroom-direct-message-avatar">B</span>
          <div class="dsh-chatroom-message-column"><div class="dsh-chatroom-display-name">Bob</div><span class="dsh-chatroom-human-bubble">第二句</span><div class="dsh-chatroom-message-actions"><button>复制</button><time>10:45</time></div></div>
        </div>
        <div class="dsh-chatroom-participant-message dsh-chatroom-direct-message" data-testid="message-3" data-own="false" data-dsh-chatroom-own="false" data-dsh-chatroom-group-position="end" data-dsh-chatroom-action-group="bob:1:0" data-dsh-chatroom-actions-visible="true">
          <span class="dsh-chatroom-avatar dsh-chatroom-direct-message-avatar">B</span>
          <div class="dsh-chatroom-message-column"><div class="dsh-chatroom-display-name">Bob</div><span class="dsh-chatroom-human-bubble">第三句</span><div class="dsh-chatroom-message-actions"><button>复制</button><time>10:46</time></div></div>
        </div>
      </section>
    `

    const second = requiredElement<HTMLElement>('[data-testid="message-2"]')
    const secondBubble = requiredElement<HTMLElement>('[data-testid="message-2"] .dsh-chatroom-human-bubble')
    const secondAvatar = requiredElement<HTMLElement>('[data-testid="message-2"] .dsh-chatroom-direct-message-avatar')
    const secondActions = requiredElement<HTMLElement>('[data-testid="message-2"] .dsh-chatroom-message-actions')
    const finalActions = requiredElement<HTMLElement>('[data-testid="message-3"] .dsh-chatroom-message-actions')
    expect(getComputedStyle(second).marginTop).toBe('-18px')
    expect(getComputedStyle(secondAvatar).visibility).toBe('hidden')
    expect(secondAvatar.getBoundingClientRect().height).toBe(0)
    expect(getComputedStyle(secondBubble).borderTopLeftRadius).toBe('5px')
    expect(getComputedStyle(secondBubble).borderBottomLeftRadius).toBe('5px')
    expect(secondActions.getBoundingClientRect().height).toBe(0)
    expect(getComputedStyle(secondActions).opacity).toBe('0')
    expect(finalActions.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(getComputedStyle(finalActions).opacity).toBe('1')
    const idleHeight = messageGroupHeight()

    activateGroupedMessageActions(second)
    await new Promise(resolve => globalThis.setTimeout(resolve, 180))
    expect(secondActions.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(getComputedStyle(secondActions).opacity).toBe('1')
    expect(secondActions.querySelector('time')?.textContent).toBe('10:45')
    expect(finalActions.getBoundingClientRect().height).toBe(0)
    expect(getComputedStyle(finalActions).opacity).toBe('0')
    expect(messageGroupHeight()).toBe(idleHeight)

    restoreGroupedMessageActions(second)
    await new Promise(resolve => globalThis.setTimeout(resolve, 180))
    expect(secondActions.getBoundingClientRect().height).toBe(0)
    expect(finalActions.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(messageGroupHeight()).toBe(idleHeight)
  })
})

function messageGroupHeight(): number {
  const boxes = [...document.querySelectorAll<HTMLElement>('[data-dsh-chatroom-action-group]')]
    .map(element => element.getBoundingClientRect())
  return Math.max(...boxes.map(box => box.bottom)) - Math.min(...boxes.map(box => box.top))
}

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (element === null) throw new Error(`Missing fixture element: ${selector}`)
  return element
}
