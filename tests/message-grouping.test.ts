// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import {
  activateGroupedMessageActions,
  chatroomMessageActionGroup,
  chatroomMessageGroupPosition,
  restoreGroupedMessageActions,
} from '../src/client/message-grouping.js'

describe('consecutive chat message grouping', () => {
  it('groups only adjacent messages from the same sender inside the five-minute window', () => {
    const messages = [
      { sender: 'alice', time: 1_000 },
      { sender: 'alice', time: 2_000 },
      { sender: 'alice', time: 3_000 },
      { sender: 'bob', time: 4_000 },
      { sender: 'bob', time: 400_001 },
    ]
    const positions = messages.map((_, index) => chatroomMessageGroupPosition(
      messages,
      index,
      message => message.sender,
      message => message.time,
    ))
    expect(positions).toEqual(['start', 'middle', 'end', 'single', 'single'])
    expect(messages.slice(0, 3).map((_, index) => chatroomMessageActionGroup(
      messages,
      index,
      message => message.sender,
      message => message.time,
    ))).toEqual(['alice:1000:0', 'alice:1000:0', 'alice:1000:0'])
  })

  it('moves one visible action rail inside the group and restores it to the final message', () => {
    document.body.innerHTML = `
      <div id="messages">
        <article data-dsh-chatroom-action-group="alice:1" data-dsh-chatroom-group-position="start" data-dsh-chatroom-actions-visible="false"></article>
        <article data-dsh-chatroom-action-group="alice:1" data-dsh-chatroom-group-position="middle" data-dsh-chatroom-actions-visible="false"></article>
        <article data-dsh-chatroom-action-group="alice:1" data-dsh-chatroom-group-position="end" data-dsh-chatroom-actions-visible="true"></article>
      </div>
    `
    const rows = [...document.querySelectorAll<HTMLElement>('article')]
    activateGroupedMessageActions(rows[1]!)
    expect(rows.map(row => row.dataset.dshChatroomActionsVisible)).toEqual(['false', 'true', 'false'])
    restoreGroupedMessageActions(rows[1]!)
    expect(rows.map(row => row.dataset.dshChatroomActionsVisible)).toEqual(['false', 'false', 'true'])
  })
})
