/** Browser half of the AI chatroom plugin. */

import type { ComponentType } from 'react'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type { ClientContext, ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { InputTriggerServiceContract, InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { ChatroomEntry } from './ChatroomEntry.js'
import { ChatroomAssistantReplyAction } from './ChatroomAssistantReplyAction.js'
import { ChatroomComposerDock, ChatroomFileAction } from './ChatroomComposer.js'
import {
  ChatroomSteeringMessageNodeView,
  ChatroomUserMessageNodeView,
} from './ChatroomMessageNodeView.js'
import { installNativePromptIdentity } from './native-prompt.js'
import { installRemoteConfigurationApi } from './remote-configuration.js'
import { RoomIdentityAction } from './RoomIdentityAction.js'
import { ChatroomClientStore } from './store.js'
import { CHATROOM_STYLES } from './styles.js'
import {
  branchFrameSwitchFromMessage,
  branchFrameFromLocation,
  clearBranchFrameReady,
  notifyBranchFrameReady,
  restoreParentSessionSelection,
  sameBranchFrame,
  stageBranchFrameSession,
} from './branch-frame.js'

export const inject = ['connection', 'inputTriggers', 'sessions', 'settingsScope', 'slots']

/** Add room identity and navigation around the existing Harness conversation UI. */
export function apply(ctx: ClientContext): void {
  const connection = ctx.get('connection') as ConnectionHandle | undefined
  if (connection === undefined) throw new Error('chatroom: client connection service unavailable')
  const sessions = ctx.get('sessions') as ISessions | undefined
  if (sessions === undefined) throw new Error('chatroom: client sessions service unavailable')
  const inputTriggers = ctx.get('inputTriggers') as InputTriggerServiceContract | undefined
  if (inputTriggers === undefined) throw new Error('chatroom: input trigger service unavailable')
  const branchFrame = typeof location === 'undefined' ? undefined : branchFrameFromLocation(location)
  const store = new ChatroomClientStore((rawSessionId) => {
    const sessionId = rawSessionId as SessionId
    const list = sessions.list.getSnapshot()
    if (list.current === sessionId) return true
    if (list.byId[sessionId] === undefined) return false
    sessions.open(sessionId)
    return true
  }, branchFrame)
  ctx.effect(() => {
    if (branchFrame !== undefined) document.documentElement.setAttribute('data-dsh-chatroom-branch-frame', '')
    const markBranchShell = () => {
      if (branchFrame === undefined) return
      document.querySelector('[data-shell-overlay]')?.parentElement?.setAttribute('data-dsh-chatroom-branch-shell', '')
    }
    const shellObserver = branchFrame === undefined ? undefined : new MutationObserver(markBranchShell)
    shellObserver?.observe(document.body, { childList: true, subtree: true })
    markBranchShell()
    const style = document.createElement('style')
    style.dataset.dshChatroomStyles = ''
    style.textContent = CHATROOM_STYLES
    document.head.append(style)
    const restoreConfiguration = installRemoteConfigurationApi(connection)
    const restoreSettingsMirror = activateRemoteSettingsMirror(ctx.get('settingsScope'))
    const restorePrompt = installNativePromptIdentity(connection.api, store)
    let activeBranchFrame = branchFrame
    let branchStaged = false
    const stageBranch = () => {
      const frame = activeBranchFrame
      if (frame === undefined || branchStaged) return
      const list = sessions.list.getSnapshot()
      const staged = stageBranchFrameSession(frame, {
        current: list.current === undefined ? undefined : String(list.current),
        byId: list.byId,
      }, sessionId => { sessions.open(sessionId as SessionId) })
      if (!staged) return
      branchStaged = true
      restoreParentSessionSelection(frame.parentSessionId)
      notifyBranchFrameReady(frame)
    }
    const receiveBranchSwitch = (event: MessageEvent) => {
      if (branchFrame === undefined
        || event.origin !== globalThis.location.origin
        || event.source !== globalThis.parent) return
      const next = branchFrameSwitchFromMessage(event.data)
      if (next === undefined) return
      if (activeBranchFrame !== undefined && sameBranchFrame(activeBranchFrame, next)) {
        stageBranch()
        return
      }
      activeBranchFrame = next
      branchStaged = false
      clearBranchFrameReady()
      store.switchBranchFrame(next)
      stageBranch()
    }
    globalThis.addEventListener('message', receiveBranchSwitch)
    const syncSession = () => {
      stageBranch()
      store.resumeOpen()
      const current = sessions.list.getSnapshot().current
      store.activateSession(current === undefined ? undefined : String(current))
    }
    const unsubscribeSessions = sessions.list.subscribe(syncSession)
    void store.start().then(syncSession)
    return () => {
      unsubscribeSessions()
      globalThis.removeEventListener('message', receiveBranchSwitch)
      restorePrompt()
      restoreSettingsMirror()
      restoreConfiguration()
      store.stop()
      style.remove()
      shellObserver?.disconnect()
      if (branchFrame !== undefined) {
        clearBranchFrameReady()
        document.documentElement.removeAttribute('data-dsh-chatroom-branch-frame')
      }
    }
  }, 'chatroom: browser state and styles')

  const aiSource = createChatroomAiSource(store)
  ctx.effect(() => inputTriggers.registerSource(aiSource), 'chatroom: @AI input source')

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'chatroom',
    order: 0,
    inject: () => ({
      hooks: { chatroom: store },
      openRoom: store.openRoom,
      closeRoom: store.closeRoom,
      join: store.join,
      login: store.login,
      register: store.register,
      logout: store.logout,
      openAccount: store.openAccount,
      closeAccount: store.closeAccount,
      changePassword: store.changePassword,
      selectRoom: store.selectRoom,
      createRoom: store.createRoom,
      resetIdentity: store.resetIdentity,
      retry: store.retry,
      closeMembers: store.closeMembers,
      renameRoom: store.renameRoom,
      setMemberRole: store.setMemberRole,
      closeThread: store.closeThread,
      setThreadReply: store.setThreadReply,
      clearThreadReply: store.clearThreadReply,
      sendThreadMessage: store.sendThreadMessage,
      enableSystemNotifications: store.enableSystemNotifications,
      dismissToast: store.dismissToast,
      toggleReaction: store.toggleReaction,
      openForward: store.openForward,
      closeForward: store.closeForward,
      forwardSelected: store.forwardSelected,
      toggleMessageSelection: store.toggleMessageSelection,
      clearMessageSelection: store.clearMessageSelection,
      openAdmin: store.openAdmin,
      closeAdmin: store.closeAdmin,
      adminCreateUser: store.adminCreateUser,
      adminUpdateUser: store.adminUpdateUser,
      adminSetSelfRegistration: store.adminSetSelfRegistration,
      adminSetAutoRedirectProvider: store.adminSetAutoRedirectProvider,
      adminSaveProvider: store.adminSaveProvider,
      adminDeleteProvider: store.adminDeleteProvider,
      openDirect: store.openDirect,
      closeDirect: store.closeDirect,
      sendDirect: store.sendDirect,
    }),
  }, ChatroomEntry))

  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'chatroom-identity',
    order: -5,
    inject: () => ({
      hooks: { chatroom: store },
      openRoom: store.openRoom,
      openMembers: store.openMembers,
    }),
  }, RoomIdentityAction))

  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'chatroom-files',
    order: -20,
    inject: () => ({
      hooks: { chatroom: store },
      addFiles: store.addFiles,
      removeFile: store.removeFile,
      clearReply: store.clearReply,
      sendFiles: store.sendFiles,
      resolveTarget: store.agentTargetForSession.bind(store),
    }),
  }, ChatroomFileAction))

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'chatroom-composition',
    order: -20,
    inject: () => ({
      hooks: { chatroom: store },
      addFiles: store.addFiles,
      removeFile: store.removeFile,
      clearReply: store.clearReply,
      sendFiles: store.sendFiles,
      resolveTarget: store.agentTargetForSession.bind(store),
    }),
  }, ChatroomComposerDock))

  ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register({
    name: 'conversation.chat.assistant-actions',
    id: 'chatroom-reply',
    order: 5,
    inject: () => ({
      hooks: { chatroom: store },
      resolveTarget: store.agentTargetForSession.bind(store),
      setReply: store.setReply,
      openThread: store.openThread,
      toggleReaction: store.toggleReaction,
      openForward: store.openForward,
      toggleMessageSelection: store.toggleMessageSelection,
    }),
  }, ChatroomAssistantReplyAction))

  ctx.slots.inject('conversation.chat.node', () => mountAfterNativeMessageView(
    () => ctx.slots.entries('conversation.chat.node').find(entry =>
      entry.options.key === 'user' && (entry.options.priority ?? 0) === 0)?.component as
        | ComponentType<ChatNodeViewProps<'user'>>
        | undefined,
    listener => ctx.slots.subscribe('conversation.chat.node', listener),
    nativeMessageView => ctx.slots.register({
      name: 'conversation.chat.node',
      key: 'user',
      priority: -10,
      locale: 'conversation',
      inject: () => chatroomMessageInjection(store, nativeMessageView),
    }, ChatroomUserMessageNodeView),
  ))

  ctx.slots.inject('conversation.chat.node', () => mountAfterNativeMessageView(
    () => ctx.slots.entries('conversation.chat.node').find(entry =>
      entry.options.key === 'steering' && (entry.options.priority ?? 0) === 0)?.component as
        | ComponentType<ChatNodeViewProps<'steering'>>
        | undefined,
    listener => ctx.slots.subscribe('conversation.chat.node', listener),
    nativeMessageView => ctx.slots.register({
      name: 'conversation.chat.node',
      key: 'steering',
      priority: -10,
      locale: 'conversation',
      inject: () => chatroomMessageInjection(store, nativeMessageView),
    }, ChatroomSteeringMessageNodeView),
  ))
}

interface RemoteSettingsMirror {
  persistence: 'host' | 'memory'
  load(): Promise<void>
}

interface SettingsScopeWithDescribe {
  describe(): RemoteSettingsMirror
}

/** Let RC8's shared settings mirror use the authenticated plugin carrier in a remote browser. */
export function activateRemoteSettingsMirror(settingsScope: unknown): () => void {
  if (!hasSettingsDescribe(settingsScope)) return () => undefined
  const mirror = settingsScope.describe()
  if (!isRemoteSettingsMirror(mirror) || mirror.persistence !== 'memory') return () => undefined
  mirror.persistence = 'host'
  void mirror.load()
  return () => {
    if (mirror.persistence === 'host') mirror.persistence = 'memory'
  }
}

function hasSettingsDescribe(value: unknown): value is SettingsScopeWithDescribe {
  return value !== null && typeof value === 'object'
    && typeof (value as Record<string, unknown>).describe === 'function'
}

function isRemoteSettingsMirror(value: unknown): value is RemoteSettingsMirror {
  return value !== null && typeof value === 'object'
    && ((value as Record<string, unknown>).persistence === 'host'
      || (value as Record<string, unknown>).persistence === 'memory')
    && typeof (value as Record<string, unknown>).load === 'function'
}

/** Mount one wrapper only after its native renderer exists, independent of client-plugin load order. */
export function mountAfterNativeMessageView<T>(
  readNative: () => T | undefined,
  subscribe: (listener: () => void) => () => void,
  mount: (native: T) => () => void,
): () => void {
  let mountedNative: T | undefined
  let disposeMounted: (() => void) | undefined
  const reconcile = (): void => {
    const native = readNative()
    if (native === mountedNative) return
    const dispose = disposeMounted
    disposeMounted = undefined
    mountedNative = undefined
    dispose?.()
    if (native === undefined) return
    mountedNative = native
    disposeMounted = mount(native)
  }
  const unsubscribe = subscribe(reconcile)
  reconcile()
  return () => {
    unsubscribe()
    disposeMounted?.()
    disposeMounted = undefined
    mountedNative = undefined
  }
}

function chatroomMessageInjection<T extends 'user' | 'steering'>(
  store: ChatroomClientStore,
  nativeMessageView: ComponentType<ChatNodeViewProps<T>>,
) {
  return {
    hooks: { chatroom: store },
    resolveTarget: store.agentTargetForSession.bind(store),
    nativeMessageView,
    setReply: store.setReply,
    openThread: store.openThread,
    toggleReaction: store.toggleReaction,
    openForward: store.openForward,
    toggleMessageSelection: store.toggleMessageSelection,
  }
}

/** Build the room-scoped AI and member source contributed to RC7's native @ menu. */
export function createChatroomAiSource(store: ChatroomClientStore): InputTriggerSource {
  return {
    trigger: '@',
    name: 'AI',
    order: -100,
    candidates(session, { query }) {
      const room = store.roomForSession(String(session.sessionId))
      if (room === undefined) return Promise.resolve([])
      const snapshot = store.getSnapshot()
      const candidates = [
        ...[...new Set(['AI', room.aiDisplayName])].map(name => ({ name, icon: '✦', description: '提及后触发 AI 回复' })),
        ...snapshot.members
          .filter(member => member.participantId !== snapshot.identity?.participantId)
          .map(member => ({ name: member.displayName, icon: '●', description: member.online ? '在线成员' : '群成员' })),
      ].filter((candidate, index, all) => all.findIndex(item => item.name === candidate.name) === index)
      const needle = query.toLocaleLowerCase()
      return Promise.resolve(candidates.filter(candidate => candidate.name.toLocaleLowerCase().includes(needle)))
    },
    lexicon(session) {
      const room = store.roomForSession(String(session.sessionId))
      if (room === undefined) return []
      const snapshot = store.getSnapshot()
      return [...new Set([
        'AI',
        room.aiDisplayName,
        ...snapshot.members
          .filter(member => member.participantId !== snapshot.identity?.participantId)
          .map(member => member.displayName),
      ])]
    },
    subscribeLexicon(_session, listener) {
      return store.subscribe(listener)
    },
    onPick({ candidate }) {
      return { text: `@${candidate.name} ` }
    },
  }
}

export default { inject, apply }
