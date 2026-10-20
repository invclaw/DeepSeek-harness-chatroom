import { bootstrapChatroom } from './bootstrap.js'
import { CHATROOM_API_PREFIX } from '../routes.js'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import { mainSessionId } from './session-selection.js'
/** Browser half of the AI chatroom plugin. */

import type { ComponentType } from 'react'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { IWorkspaces } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { ComposerAttachmentsProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { InputTriggerServiceContract, InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { chatroomAvatar } from '../avatars.js'
import { NativeBranchContent } from './NativeBranchContent.js'
import { ChatroomEntry } from './ChatroomEntry.js'
import { ChatroomSettingsSection } from './ChatroomAccountPanels.js'
import { ChatroomAssistantReplyAction } from './ChatroomAssistantReplyAction.js'
import { ChatroomAssistantNodeView } from './ChatroomAssistantNodeView.js'
import { ChatroomComposerAttachments, ChatroomComposerDock, ChatroomFileAction, ChatroomSessionControls } from './ChatroomComposer.js'
import {
  ChatroomSteeringMessageNodeView,
  ChatroomUserMessageNodeView,
} from './ChatroomMessageNodeView.js'
import { installNativePromptIdentity } from './native-prompt.js'
import { installNativeMentionAvatarImages } from './mention-avatars.js'
import { installFreshSessionStart } from './fresh-session.js'
import { NewGroupSetupDock } from './NewGroupSetupDock.js'
import { RoomIdentityAction } from './RoomIdentityAction.js'
import { installSidebarRoomRows } from './sidebar-rooms.js'
import { registerChatroomSettingsNavIcon } from './settings-nav-icon.js'
import { ChatroomClientStore, newGroupMentionName } from './store.js'
import { CHATROOM_STYLES } from './styles.js'
import { branchLinkFromLocation, invitedRoomFromLocation } from './branch-link.js'

const roomServices = ['connection', 'inputTriggers', 'sessions', 'slots', 'workspaces', 'uiWorkspace', 'remote', 'remote.session']
export const inject: string[] = []

/** Supplied by the build adapter from the pinned native client factory. */
declare const nativeSettings: { apply(ctx: ClientContext): void; inject: string[] }
declare module '@deepseek-ai/cordis' {
  interface Context { chatroomClientCapabilities: { readonly canManage: boolean } }
}
declare const nativeConnection: { apply(ctx: ClientContext): void }

/** Start the native browser connection before installing its chatroom consumers. */
export async function apply(ctx: ClientContext): Promise<void> {
  const session = await bootstrapChatroom()
  if (session.auth?.enabled && !session.auth.authenticated) {
    const returnTo = `${location.pathname}${location.search}`
    location.replace(`${CHATROOM_API_PREFIX}/auth/page?returnTo=${encodeURIComponent(returnTo)}`)
    return
  }
  if (session.settings?.managed === true) {
    ctx.provide('chatroomClientCapabilities', Object.freeze({ canManage: session.settings.canManage === true }))
    ctx.plugin({ name: 'chatroom-native-settings', inject: nativeSettings.inject, apply: nativeSettings.apply })
  }
  ctx.plugin({ name: 'chatroom-native-connection', apply: nativeConnection.apply })
  let initialSession: typeof session | undefined = session
  ctx.inject(roomServices, roomCtx => {
    installChatroom(roomCtx, initialSession)
    initialSession = undefined
  })
}

/** Add room identity and navigation around the existing Harness conversation UI. */
function installChatroom(ctx: ClientContext, initialSession?: Awaited<ReturnType<typeof bootstrapChatroom>>): void {
  const connection = ctx.get('connection') as ConnectionHandle | undefined
  if (connection === undefined) throw new Error('chatroom: client connection service unavailable')
  const sessions = ctx.get('sessions') as ISessions | undefined
  if (sessions === undefined) throw new Error('chatroom: client sessions service unavailable')
  const workspaces = ctx.get('workspaces') as IWorkspaces | undefined
  if (workspaces === undefined) throw new Error('chatroom: client workspaces service unavailable')
  const inputTriggers = ctx.get('inputTriggers') as InputTriggerServiceContract | undefined
  if (inputTriggers === undefined) throw new Error('chatroom: input trigger service unavailable')
  const branchLink = typeof location === 'undefined' ? undefined : branchLinkFromLocation(location)
  const store = new ChatroomClientStore((rawSessionId) => {
    const sessionId = rawSessionId as SessionId
    const list = sessions.list.getSnapshot()
    if (mainSessionId(list) === sessionId) return true
    if (list.byId[sessionId] === undefined) return false
    ctx.uiWorkspace.openSession(sessionId)
    return true
  }, branchLink)
  ctx.effect(() => installFreshSessionStart(ctx.uiWorkspace, workspaces, sessions, async (workspaceId) => {
    const snapshot = store.getSnapshot()
    if (snapshot.phase === 'loading') throw new Error('chatroom identity is still loading')
    const reservedSessionId = snapshot.auth.enabled ? await store.reserveSoloSession() : undefined
    try {
      const sessionId = await sessions.create({
        workspaceId,
        ...(reservedSessionId === undefined ? {} : { sessionId: reservedSessionId as SessionId }),
      })
      if (reservedSessionId !== undefined && String(sessionId) !== reservedSessionId) {
        throw new Error('native Session id does not match its Solo reservation')
      }
      store.registerNewSession(String(sessionId))
      return sessionId
    } catch (error) {
      if (reservedSessionId !== undefined) await store.releaseSoloSession(reservedSessionId)
      throw error
    }
  }), 'chatroom: distinct native New Session')
  ctx.effect(() => {
    document.documentElement.setAttribute('data-dsh-chatroom-installed', '')
    const style = document.createElement('style')
    style.dataset.dshChatroomStyles = ''
    style.textContent = CHATROOM_STYLES
    document.head.append(style)
    const restorePrompt = installNativePromptIdentity(ctx.remote, store)
    const restoreSidebarRoomRows = installSidebarRoomRows(store, sessions)
    const restoreMentionAvatars = installNativeMentionAvatarImages(store)
    let branchOpened = false
    const syncSession = () => {
      store.resumeOpen()
      const list = sessions.list.getSnapshot()
      if (!branchOpened && branchLink !== undefined && list.byId[branchLink.sessionId as SessionId] !== undefined) {
        branchOpened = true
        ctx.uiWorkspace.openSession(branchLink.sessionId as SessionId)
        return
      }
      const current = mainSessionId(list)
      const summary = current === undefined ? undefined : list.byId[current]
      store.activateSession(
        current === undefined ? undefined : String(current),
        summary?.displayTitle ?? '新会话',
        summary?.origin !== 'subagent',
        summary?.parentId === undefined ? undefined : String(summary.parentId),
      )
      const snapshot = store.getSnapshot()
      if (current !== undefined && snapshot.auth.enabled && snapshot.phase !== 'loading'
        && (snapshot.phase !== 'ready'
          || store.roomForSession(String(current)) === undefined
            && !store.canPromptNativeSession(String(current)))) {
        if (snapshot.phase !== 'ready') ctx.uiWorkspace.startSession()
        else void store.resolveNativeOwnership(String(current)).then(allowed => {
          if (mainSessionId(sessions.list.getSnapshot()) !== current) return
          if (allowed) syncSession()
          else ctx.uiWorkspace.startSession()
        })
        return
      }
      if (current !== undefined && summary?.blank === true && summary.origin !== 'subagent'
        && store.roomForSession(String(current)) === undefined
        && store.newSessionMode(String(current)) === undefined) {
        store.registerNewSession(String(current))
      }
    }
    const unsubscribeSessions = sessions.list.subscribe(syncSession)
    let synchronizedPhase = store.getSnapshot().phase
    const unsubscribeSessionGuard = store.subscribe(() => {
      const phase = store.getSnapshot().phase
      if (phase === synchronizedPhase) return
      synchronizedPhase = phase
      syncSession()
    })
    void store.start(initialSession).then(async () => {
      syncSession()
      if (typeof location === 'undefined') return
      const invitedRoomId = invitedRoomFromLocation(location, branchLink)
      if (invitedRoomId !== undefined) await store.selectRoom(invitedRoomId)
    })
    return () => {
      unsubscribeSessions()
      unsubscribeSessionGuard()
      restorePrompt()
      restoreMentionAvatars()
      restoreSidebarRoomRows()
      store.stop()
      style.remove()
      document.documentElement.removeAttribute('data-dsh-chatroom-installed')
    }
  }, 'chatroom: browser state and styles')

  const aiSource = createChatroomAiSource(store)
  const memberSource = createChatroomMemberSource(store)
  ctx.effect(() => inputTriggers.registerSource(aiSource), 'chatroom: AI mention source')
  ctx.effect(() => inputTriggers.registerSource(memberSource), 'chatroom: member mention source')

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    children: { 'chatroom.branch': { kind: 'single', scope: 'session' } },
    id: 'chatroom',
    order: 0,
    inject: () => ({
      hooks: { chatroom: store },
      retainBranch: (sessionId: string) => sessions.retain(sessionId as SessionId, { source: 'chatroomBranch' }),
      openBranchSession: (sessionId: string) => { ctx.uiWorkspace.openSession(sessionId as SessionId); store.closeThread() },
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
      addRoomMembers: store.addRoomMembers,
      setRoomAutoTrigger: store.setRoomAutoTrigger,
      closeThread: store.closeThread,
      setThreadReply: store.setThreadReply,
      clearThreadReply: store.clearThreadReply,
      sendThreadMessage: store.sendThreadMessage,
      enableSystemNotifications: store.enableSystemNotifications,
      dismissToast: store.dismissToast,
      toggleReaction: store.toggleReaction,
      recallMessage: store.recallMessage,
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
      loadAutomation: store.loadAutomation,
      saveAutomation: store.saveAutomation,
      openDirect: store.openDirect,
      closeDirect: store.closeDirect,
      sendDirect: store.sendDirect,
      toggleDirectReaction: store.toggleDirectReaction,
      quickDirectMeeting: store.quickDirectMeeting,
      loadWecomAuthorization: store.loadWecomAuthorization,
      startWecomAuthorization: store.startWecomAuthorization,
      disconnectWecomAuthorization: store.disconnectWecomAuthorization,
      rebindWecomAuthorization: store.rebindWecomAuthorization,
      closeWecomAuthorization: store.closeWecomAuthorization,
      closeSearch: store.closeSearch,
      searchAll: store.searchAll,
      openSearchResult: store.openSearchResult,
    }),
  }, ChatroomEntry))
  ctx.slots.inject('chatroom.branch', () => ctx.slots.register({ name: 'chatroom.branch' }, NativeBranchContent))

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'chatroom',
    order: 30,
    label: () => '群聊与账号',
    inject: () => ({
      hooks: { chatroom: store },
      closeAccount: store.closeAccount,
      changePassword: store.changePassword,
      openAdmin: store.openAdmin,
      closeAdmin: store.closeAdmin,
      adminCreateUser: store.adminCreateUser,
      adminUpdateUser: store.adminUpdateUser,
      adminSetSelfRegistration: store.adminSetSelfRegistration,
      adminSetAutoRedirectProvider: store.adminSetAutoRedirectProvider,
      adminSaveProvider: store.adminSaveProvider,
      adminDeleteProvider: store.adminDeleteProvider,
      loadAutomation: store.loadAutomation,
      saveAutomation: store.saveAutomation,
      openDirect: store.openDirect,
      closeDirect: store.closeDirect,
      sendDirect: store.sendDirect,
      quickDirectMeeting: store.quickDirectMeeting,
      loadWecomAuthorization: store.loadWecomAuthorization,
      startWecomAuthorization: store.startWecomAuthorization,
      disconnectWecomAuthorization: store.disconnectWecomAuthorization,
      rebindWecomAuthorization: store.rebindWecomAuthorization,
      closeWecomAuthorization: store.closeWecomAuthorization,
    }),
  }, ChatroomSettingsSection))

  // DSH 0.1.x renders a gear for every external settings section because the
  // slot contract has no icon field. Mark this localized row after the modal
  // mounts; styles.ts then paints the group/account glyph while the disposer
  // keeps HMR and plugin disable cleanup deterministic.
  ctx.effect(
    () => registerChatroomSettingsNavIcon(() => '群聊与账号'),
    'chatroom: settings navigation icon',
  )

  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'chatroom-identity',
    order: -5,
    inject: () => ({
      hooks: { chatroom: store },
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

  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
    name: 'conversation.input.right',
    id: 'chatroom-session-controls',
    order: -30,
    inject: () => ({
      hooks: { chatroom: store },
      resolveTarget: store.agentTargetForSession.bind(store),
      stopRoomSession: store.stopRoomSession,
      newRoomSession: store.newRoomSession,
      quickMeeting: store.quickMeeting,
      quickThreadMeeting: store.quickThreadMeeting,
    }),
  }, ChatroomSessionControls))

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'chatroom-group-setup',
    order: -30,
    inject: () => ({
      hooks: { chatroom: store },
      registerNewSession: store.registerNewSession,
      chooseNewSessionMode: store.chooseNewSessionMode,
    }),
  }, NewGroupSetupDock))

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'chatroom-composition',
    order: -20,
    inject: () => ({
      hooks: { chatroom: store },
      addFiles: store.addFiles,
      removeFile: store.removeFile,
      clearReply: store.clearReply,
      sendFiles: store.sendFiles,
      updateQueuedPrompt: store.updateQueuedPrompt,
      resolveTarget: store.agentTargetForSession.bind(store),
    }),
  }, ChatroomComposerDock))

  ctx.slots.inject('conversation.input.attachments', () => mountAfterNativeMessageView(
    () => ctx.slots.entries('conversation.input.attachments').find(entry =>
      (entry.options.priority ?? 0) === 0)?.component as ComponentType<ComposerAttachmentsProps> | undefined,
    listener => ctx.slots.subscribe('conversation.input.attachments', listener),
    nativeAttachmentsView => ctx.slots.register({
      name: 'conversation.input.attachments',
      priority: -10,
      locale: 'conversation',
      inject: () => ({
        hooks: { chatroom: store },
        nativeAttachmentsView,
        clearReply: store.clearReply,
        resolveTarget: store.agentTargetForSession.bind(store),
      }),
    }, ChatroomComposerAttachments),
  ))

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
      recallMessage: store.recallMessage,
      openForward: store.openForward,
      toggleMessageSelection: store.toggleMessageSelection,
    }),
  }, ChatroomAssistantReplyAction))

  ctx.slots.inject('conversation.chat.node', () => mountAfterNativeMessageView(
    () => ctx.slots.entries('conversation.chat.node').find(entry =>
      entry.options.key === 'assistant-step' && (entry.options.priority ?? 0) === 0)?.component as
        | ComponentType<ChatNodeViewProps<'assistant-step'>>
        | undefined,
    listener => ctx.slots.subscribe('conversation.chat.node', listener),
    nativeMessageView => ctx.slots.register({
      name: 'conversation.chat.node',
      key: 'assistant-step',
      priority: -10,
      locale: 'chat',
      inject: () => ({
        hooks: { chatroom: store },
        nativeMessageView,
        resolveTarget: store.agentTargetForSession.bind(store),
        setReply: store.setReply,
        openThread: store.openThread,
        toggleReaction: store.toggleReaction,
        recallMessage: store.recallMessage,
        updateQueuedPrompt: store.updateQueuedPrompt,
        openForward: store.openForward,
        toggleMessageSelection: store.toggleMessageSelection,
      }),
    }, ChatroomAssistantNodeView),
  ))

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
      locale: 'chat',
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
      locale: 'chat',
      inject: () => chatroomMessageInjection(store, nativeMessageView),
    }, ChatroomSteeringMessageNodeView),
  ))
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
    recallMessage: store.recallMessage,
    openForward: store.openForward,
    toggleMessageSelection: store.toggleMessageSelection,
  }
}

/** Build the room-scoped AI source contributed to RC7's native @ menu. */
export function createChatroomAiSource(store: ChatroomClientStore): InputTriggerSource {
  return {
    trigger: '@',
    name: 'AI 助手',
    order: -100,
    async candidates(session, { query }) {
      const room = store.roomForSession(String(session.sessionId))
      const newGroup = room === undefined && store.newSessionMode(String(session.sessionId)) === 'group'
      if (room === undefined && !newGroup) return []
      const candidates = [{
        name: aiMentionMenuName(room?.aiDisplayName ?? 'DeepSeek'),
        icon: () => <span aria-hidden>✦</span>,
        key: 'chatroom-ai',
        description: room === undefined ? '创建群聊后立即回复' : '提及后回复',
      }]
      const needle = query.toLocaleLowerCase()
      return candidates.filter(candidate => candidate.name.toLocaleLowerCase().includes(needle))
    },
    lexicon(session) {
      const room = store.roomForSession(String(session.sessionId))
      if (room === undefined) {
        if (store.newSessionMode(String(session.sessionId)) !== 'group') return []
        return ['AI', 'DeepSeek']
      }
      return [...new Set(['AI', room.aiDisplayName])]
    },
    subscribeLexicon(_session, listener) {
      return store.subscribe(listener)
    },
    onPick({ candidate }) {
      return { text: `@${mentionToken(candidate.name)} ` }
    },
  }
}

/** Build the room-scoped human member source contributed to RC7's native @ menu. */
export function createChatroomMemberSource(store: ChatroomClientStore): InputTriggerSource {
  return {
    trigger: '@',
    name: '群聊成员',
    order: -90,
    async candidates(session, { query }) {
      const room = store.roomForSession(String(session.sessionId))
      const newGroup = room === undefined && store.newSessionMode(String(session.sessionId)) === 'group'
      if (room === undefined && !newGroup) return []
      if (newGroup && store.getSnapshot().directPeers.length === 0) await store.loadDirectDirectory()
      const snapshot = store.getSnapshot()
      const candidates = room === undefined
        ? snapshot.directPeers
          .filter(peer => peer.participantId !== snapshot.identity?.participantId)
          .map(peer => ({
            name: newGroupMentionName(peer, snapshot.directPeers),
            key: peer.participantId,
            icon: () => <span aria-hidden>{chatroomAvatar(peer.avatarId, peer.participantId).emoji}</span>,
            description: `创建群聊时自动邀请 · @${peer.username}`,
          }))
        : snapshot.members
          .filter(member => member.participantId !== snapshot.identity?.participantId)
          .map(member => ({
            name: member.displayName,
            key: member.participantId,
            icon: () => <span aria-hidden>{chatroomAvatar(member.avatarId, member.participantId).emoji}</span>,
            description: member.online ? '在线成员' : '群成员',
          }))
      const needle = query.toLocaleLowerCase()
      return candidates
        .filter((candidate, index, all) => all.findIndex(item => item.name === candidate.name) === index)
        .filter(candidate => candidate.name.toLocaleLowerCase().includes(needle))
    },
    lexicon(session) {
      const room = store.roomForSession(String(session.sessionId))
      const snapshot = store.getSnapshot()
      if (room === undefined) {
        if (store.newSessionMode(String(session.sessionId)) !== 'group') return []
        return [...new Set(snapshot.directPeers
          .filter(peer => peer.participantId !== snapshot.identity?.participantId)
          .map(peer => newGroupMentionName(peer, snapshot.directPeers)))]
      }
      return [...new Set(snapshot.members
        .filter(member => member.participantId !== snapshot.identity?.participantId)
        .map(member => member.displayName))]
    },
    subscribeLexicon(_session, listener) {
      return store.subscribe(listener)
    },
    onPick({ candidate }) {
      return { text: `@${candidate.name} ` }
    },
  }
}

const AI_MENTION_MENU_SUFFIX = '（AI 助手）'

function aiMentionMenuName(name: string): string {
  return `${name}${AI_MENTION_MENU_SUFFIX}`
}

function mentionToken(menuName: string): string {
  return menuName.endsWith(AI_MENTION_MENU_SUFFIX)
    ? menuName.slice(0, -AI_MENTION_MENU_SUFFIX.length)
    : menuName
}

export default { inject, apply }
