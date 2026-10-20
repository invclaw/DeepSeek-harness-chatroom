/** Durable model-history edits; native DSH owns image and tool-request projection. */
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { Session, SessionSeq } from '@deepseek-ai/dsh-session'

/** Replace hidden surface messages without deleting their append-origin transcript. */
export function hideChatroomMessages(session: Session, hiddenIds: ReadonlySet<string>): void {
  if (hiddenIds.size === 0) return
  const events = session.snapshotEvents()
  const hidden = session.surface.nodes.filter(seq => {
    const event = events[seq]!
    const original = deferredOriginal(events, event)
    const message = session.deriveEventMessage(original ?? event)
    return message !== null && hiddenIds.has(String(message.id))
  })
  for (const seq of hidden) replaceSurface(session, [seq])
}

/** Hide passive chat until the current AI turn ends, preserving its transcript position. */
export function deferChatroomMessage(session: Session, messageId: string): void {
  const original = session.snapshotEvents().find(event => event.type === 'user/message'
    && event.surfaceOp === 'append' && String(event.data.id) === messageId)
  if (original === undefined || !session.surface.nodes.includes(original.seq)) return
  const message = createUserMessage({ content: [{ type: 'text', text: '[Chatroom context withheld]' }], source: {
    kind: 'chatroom-control', form: 'deferred', summary: 'Chat deferred until the current AI turn ends',
    deferredMessageSeq: original.seq,
  } })
  session.append('user/message', message, {
    surfaceOp: { op: 'replace', startSeq: original.seq, endSeq: original.seq },
    sourceEventSeqs: [original.seq],
  })
}

/** Restore only live placeholders: recalled/reset/compacted chat must never reappear. */
export function restoreDeferredChatroomMessages(session: Session, hiddenIds: ReadonlySet<string>, idle = false): void {
  const events = session.snapshotEvents()
  if (!events.some(event => deferredOriginal(events, event) !== undefined)) return
  for (const seq of [...session.surface.nodes]) {
    const event = events[seq]!
    const original = deferredOriginal(events, event)
    if (original?.type !== 'user/message') continue
    if (!idle && !events.some(candidate => candidate.seq > seq && candidate.type === 'turn/end')) continue
    if (hiddenIds.has(String(original.data.id))) {
      replaceSurface(session, [seq])
      continue
    }
    session.append('user/message', original.data, {
      surfaceOp: { op: 'replace', startSeq: seq, endSeq: seq }, sourceEventSeqs: [original.seq, seq],
    })
  }
}

function deferredOriginal(events: ReturnType<Session['snapshotEvents']>, event: ReturnType<Session['snapshotEvents']>[number]) {
  if (event.type !== 'user/message') return undefined
  const source = event.data.source
  if (source.kind !== 'chatroom-control' || source.form !== 'deferred' || source.deferredMessageSeq === undefined) return undefined
  return events[source.deferredMessageSeq]
}

/** A new AI conversation retains the complete native human transcript. */
export function resetChatroomContext(session: Session): void {
  const events = session.snapshotEvents()
  let region: SessionSeq[] = []
  for (const seq of [...session.surface.nodes]) {
    if (events[seq]?.type === 'system/message') {
      replaceSurface(session, region)
      region = []
    } else region.push(seq)
  }
  replaceSurface(session, region)
}

/** User context injections are valid outside an Agent step; developer events are not. */
function replaceSurface(session: Session, nodes: SessionSeq[]): void {
  if (nodes.length === 0) return
  const message = createUserMessage({ content: [{ type: 'text', text: '[Chatroom context withheld]' }], source: { kind: 'chatroom-control', form: 'notice', summary: 'Chatroom model context updated' } })
  session.append('user/message', message, {
    surfaceOp: { op: 'replace', startSeq: nodes[0]!, endSeq: nodes.at(-1)! },
    sourceEventSeqs: nodes,
  })
}
