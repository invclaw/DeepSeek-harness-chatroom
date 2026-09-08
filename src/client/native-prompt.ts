import type { ConnectionHandle, ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client'
import type { SessionPromptRequest } from '@deepseek-ai/dsh-api-session-controller/types'
import { identifyPrompt, isSlashCommand } from '../message.js'
import type { ChatroomPromptContentPart } from '../types.js'
import {
  serializePendingFiles,
  submitRoomPrompt,
  submitThreadPrompt,
  type ChatroomClientStore,
} from './store.js'

export { identifyPrompt }

/** Route shared room chat through human-first admission while preserving native slash commands. */
export function installNativePromptIdentity(
  connection: ConnectionHandle,
  store: ChatroomClientStore,
): () => void {
  const rpc = connection.rpc
  const previous = rpc.call
  const original = previous.bind(rpc)
  const wrapped: ClientConnectionRpc['call'] = async (channel, endpoint, wire, signal) => {
    if (channel !== '/api' || endpoint !== 'session/prompt' || !isRecord(wire)
      || !isRecord(wire.args) || !isRecord(wire.args.request)) return await original(channel, endpoint, wire, signal)
    const payload = wire.args.request as unknown as SessionPromptRequest
    const sessionId = String(payload.sessionId)
    const slashCommand = isSlashCommand(payload.content as readonly ChatroomPromptContentPart[])
    let target = typeof store.agentTargetForSession === 'function'
      ? store.agentTargetForSession(String(payload.sessionId))
      : (() => {
        const room = store.roomForSession(String(payload.sessionId))
        return room === undefined ? undefined : { kind: 'room' as const, room }
      })()
    if (target === undefined && !store.canPromptNativeSession(sessionId) && store.getSnapshot().auth?.enabled) {
      await store.resolveNativeOwnership(sessionId)
    }
    if (target === undefined && slashCommand) {
      if (!store.canPromptNativeSession(sessionId)) throw new Error('会话不存在或你无权访问。')
      return await original(channel, endpoint, wire, signal)
    }
    const newGroup = target === undefined && typeof store.newSessionMode === 'function'
      && store.newSessionMode(sessionId) === 'group'
    if (target === undefined && typeof store.ensurePromptTarget === 'function') {
      target = await store.ensurePromptTarget(sessionId)
    }
    if (target === undefined) {
      if (!store.canPromptNativeSession(sessionId)) throw new Error('会话不存在或你无权访问。')
      return await original(channel, endpoint, wire, signal)
    }
    if (slashCommand) {
      return await original(channel, endpoint, wire, signal)
    }
    if (store.getSnapshot().identity === undefined) {
      throw new Error('请先选择聊天室身份。')
    }
    if (newGroup) {
      const invitees = store.newGroupInvitees(payload.content as readonly ChatroomPromptContentPart[])
      if (invitees.length > 0 && !await store.addRoomMembers(invitees)) {
        throw new Error(store.getSnapshot().managementError ?? '无法把提及的成员加入新群聊。')
      }
    }
    if (typeof store.waitForRoomAutoTrigger === 'function') {
      await store.waitForRoomAutoTrigger(target.room.id)
    }
    const composition = store.composition(target.room.id)
    const files = await serializePendingFiles(composition.files)
    const content = [...payload.content as readonly ChatroomPromptContentPart[], ...files]
    if (target.kind === 'thread') {
      await submitThreadPrompt({
        threadId: target.threadId,
        mode: payload.mode,
        ...(payload.requestId === undefined ? {} : { requestId: payload.requestId }),
        content,
        ...(composition.reply === undefined ? {} : { reply: composition.reply }),
      }, signal)
    } else {
      await submitRoomPrompt({
        roomId: target.room.id,
        mode: payload.mode,
        ...(payload.requestId === undefined ? {} : { requestId: payload.requestId }),
        content,
        ...(composition.reply === undefined ? {} : { reply: composition.reply }),
      }, signal)
    }
    store.completeComposition(composition)
    return {
      ok: true, value: { accepted: true },
    }
  }
  rpc.call = wrapped
  return () => {
    if (rpc.call === wrapped) rpc.call = previous
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
