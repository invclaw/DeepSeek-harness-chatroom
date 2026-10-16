import type { ClientRemote } from '@deepseek-ai/dsh-api-remotes/client'
import { identifyPrompt, isSlashCommand } from '../message.js'
import type { ChatroomPromptContentPart } from '../types.js'
import {
  compositionTargetId,
  serializePendingFiles,
  submitRoomPrompt,
  submitThreadPrompt,
  type ChatroomClientStore,
} from './store.js'

export { identifyPrompt }

/** Route shared room chat through human-first admission while preserving native slash commands. */
export function installNativePromptIdentity(
  api: ClientRemote,
  store: ChatroomClientStore,
): () => void {
  const namespace = api.session
  // RC.2 generated methods are configurable accessors with no setter.
  // Preserve that descriptor so unloading the plugin restores native tracing.
  const descriptor = Object.getOwnPropertyDescriptor(namespace, 'prompt')
  const original = namespace.prompt
  const wrapped: ClientRemote['session']['prompt'] = async (payload, signal) => {
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
      return await original(payload, signal)
    }
    const newGroup = target === undefined && typeof store.newSessionMode === 'function'
      && store.newSessionMode(sessionId) === 'group'
    if (target === undefined && typeof store.ensurePromptTarget === 'function') {
      target = await store.ensurePromptTarget(sessionId)
    }
    if (target === undefined) {
      if (!store.canPromptNativeSession(sessionId)) throw new Error('会话不存在或你无权访问。')
      return await original(payload, signal)
    }
    if (slashCommand) {
      return await original(payload, signal)
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
    const composition = store.composition(compositionTargetId(target))
    const files = await serializePendingFiles(composition.files)
    const content = [...payload.content as readonly ChatroomPromptContentPart[], ...files]
    if (target.kind === 'thread') {
      await submitThreadPrompt({
        threadId: target.threadId,
        mode: payload.mode,
        content,
        ...(composition.reply === undefined ? {} : { reply: composition.reply }),
      }, signal)
    } else {
      await submitRoomPrompt({
        roomId: target.room.id,
        mode: payload.mode,
        content,
        ...(composition.reply === undefined ? {} : { reply: composition.reply }),
      }, signal)
    }
    store.completeComposition(composition)
    return { ok: true, value: { accepted: true } }
  }
  Object.defineProperty(namespace, 'prompt', { configurable: true, enumerable: descriptor?.enumerable ?? true, writable: true, value: wrapped })
  return () => {
    if (namespace.prompt !== wrapped) return
    if (descriptor === undefined) delete (namespace as Partial<typeof namespace>).prompt
    else Object.defineProperty(namespace, 'prompt', descriptor)
  }
}
