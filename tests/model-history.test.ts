import { describe, expect, it } from 'vitest'
import { createUserMessage, createAssistantMessage } from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import { deferChatroomMessage, hideChatroomMessages, resetChatroomContext, restoreDeferredChatroomMessages } from '../src/model-history.js'

describe('durable native chatroom model visibility', () => {
  it('defers passive chat through replay and restores its original position after the turn', () => {
    const session = Session.create(SessionId('deferred'))
    session.append('turn/start', { turn: 1 })
    const message = createUserMessage({ content: [{ type: 'text', text: 'chat during AI reply' }], source: { kind: 'user' } })
    session.append('user/message', message, { surfaceOp: 'append' })
    deferChatroomMessage(session, String(message.id))
    restoreDeferredChatroomMessages(session, new Set())
    expect(session.deriveMessages()).toEqual([])
    const replay = Session.create(SessionId('replayed-deferred'), session.snapshotEvents())
    replay.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    restoreDeferredChatroomMessages(replay, new Set())
    expect(replay.deriveMessages()).toEqual([message])
    expect(replay.snapshotEvents().filter(event => event.type === 'user/message' && event.surfaceOp === 'append')).toHaveLength(1)
    expect(Session.create(SessionId('restored'), replay.snapshotEvents()).deriveMessages()).toEqual([message])
    const count = replay.seq
    restoreDeferredChatroomMessages(replay, new Set(), true)
    expect(replay.seq).toBe(count)
  })
  it.each(['recall', 'reset'] as const)('does not revive deferred chat after %s', mode => {
    const session = Session.create(SessionId('no-revive'))
    const message = createUserMessage({ content: [{ type: 'text', text: 'hidden chat' }], source: { kind: 'user' } })
    session.append('user/message', message, { surfaceOp: 'append' })
    deferChatroomMessage(session, String(message.id))
    if (mode === 'recall') hideChatroomMessages(session, new Set([String(message.id)]))
    else resetChatroomContext(session)
    restoreDeferredChatroomMessages(session, new Set(), true)
    expect(session.deriveMessages()).toEqual([])
  })
  it('retains append-origin messages while resetting model context across replay', () => {
    const session = Session.create(SessionId('reset'))
    session.append('user/message', createUserMessage({ content: [{ type: 'text', text: 'old human discussion' }], source: { kind: 'user' } }), { surfaceOp: 'append' })
    const message = createAssistantMessage({ content: [{ type: 'text', text: 'old assistant answer' }], source: { provider: 'test', model: 'test' } })
    session.append('assistant/message', { turn: 0, step: 0, message, stream: [] }, { surfaceOp: 'append' })
    resetChatroomContext(session)
    expect(session.deriveMessages()).toEqual([])
    expect(session.snapshotEvents().filter(event => event.surfaceOp === 'append')).toHaveLength(2)
    const replay = Session.create(SessionId('replay'), session.snapshotEvents())
    expect(replay.deriveMessages()).toEqual([])
    replay.append('user/message', createUserMessage({ content: [{ type: 'text', text: 'new discussion' }], source: { kind: 'user' } }), { surfaceOp: 'append' })
    expect(JSON.stringify(replay.deriveMessages())).toContain('new discussion')
    expect(JSON.stringify(replay.deriveMessages())).not.toContain('old human discussion')
  })
  it('removes only the recalled message from future requests and stays idempotent', () => {
    const session = Session.create(SessionId('recall'))
    const recalled = createUserMessage({ content: [{ type: 'text', text: 'recalled secret' }], source: { kind: 'user' } })
    session.append('user/message', recalled, { surfaceOp: 'append' })
    session.append('user/message', createUserMessage({ content: [{ type: 'text', text: 'retained message' }], source: { kind: 'user' } }), { surfaceOp: 'append' })
    hideChatroomMessages(session, new Set([String(recalled.id)]))
    const count = session.seq
    hideChatroomMessages(session, new Set([String(recalled.id)]))
    expect(session.seq).toBe(count)
    expect(JSON.stringify(session.deriveMessages())).not.toContain('recalled secret')
    expect(JSON.stringify(session.deriveMessages())).toContain('retained message')
    expect(JSON.stringify(session.snapshotEvents())).toContain('recalled secret')
  })
})
