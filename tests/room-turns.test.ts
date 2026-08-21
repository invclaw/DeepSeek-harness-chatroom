import { describe, expect, it } from 'vitest'
import { MessageId } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { assertAiDecisionCompleted, completedRoomTurns } from '../src/room.js'

describe('room AI turn settlement', () => {
  it('does not mistake a provider error for an autonomous silence decision', () => {
    const events = [
      event('turn/start', { turn: 1 }),
      event('user/message', {
        id: MessageId('human-1'), role: 'user', content: [{ type: 'text', text: 'hello' }],
        source: { kind: 'chatroom', roomId: 'lobby', roomMessageId: 'room-1', participantId: 'p1', displayName: 'Alice' },
      }),
      event('turn/end', {
        turn: 1,
        reason: { kind: 'error', error: { code: 'MISSING_CREDENTIAL', message: 'missing key' } },
      }),
    ]

    expect(() => assertAiDecisionCompleted(events)).toThrow('MISSING_CREDENTIAL')
    expect(completedRoomTurns(events, '<NO_REPLY>')).toEqual([])
  })

  it('accepts an explicit no-reply output from a completed turn', () => {
    const events = [
      event('turn/start', { turn: 1 }),
      event('user/message', {
        id: MessageId('human-1'), role: 'user', content: [{ type: 'text', text: 'for the record' }],
        source: { kind: 'chatroom', roomId: 'lobby', roomMessageId: 'room-1', participantId: 'p1', displayName: 'Alice' },
      }),
      event('assistant/message', {
        turn: 1, step: 1,
        message: {
          id: MessageId('assistant-1'), role: 'assistant', content: [{ type: 'text', text: '<NO_REPLY>' }],
          source: { kind: 'model', provider: 'test', model: 'test' },
        },
      }),
      event('turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ]

    expect(() => assertAiDecisionCompleted(events)).not.toThrow()
    expect(completedRoomTurns(events, '<NO_REPLY>')).toEqual([{ roomMessageId: 'room-1' }])
  })
})

function event<T extends SessionEvent['type']>(type: T, data: SessionEvent<T>['data']): SessionEvent<T> {
  return { type, seq: 1, time: 1, data } as SessionEvent<T>
}
