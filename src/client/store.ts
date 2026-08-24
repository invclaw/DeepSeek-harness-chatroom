import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  ChatroomAccount,
  ChatroomAdminOverview,
  ChatroomAuthProviderAdmin,
  ChatroomAuthState,
  ChatroomDirectConversation,
  ChatroomDirectMessage,
  ChatroomDirectMessageEvent,
  ChatroomDirectPeer,
  ChatroomDirectResponse,
  ChatroomErrorResponse,
  ChatroomForwardItem,
  ChatroomIdentity,
  ChatroomInfo,
  ChatroomMember,
  ChatroomNotification,
  ChatroomGlobalEvent,
  ChatroomPromptContentPart,
  ChatroomPromptRequest,
  ChatroomPromptResponse,
  ChatroomReaction,
  ChatroomReplyReference,
  ChatroomRoomResponse,
  ChatroomRoomManageResponse,
  ChatroomRoomManagementResponse,
  ChatroomRoomInviteCandidate,
  ChatroomServerEvent,
  ChatroomSessionResponse,
  ChatroomThread,
  ChatroomThreadMessage,
  ChatroomThreadPreview,
  ChatroomThreadResponse,
  ChatroomThreadPromptRequest,
  ChatroomThreadRoot,
} from '../types.js'
import type { ChatroomReactionEmoji } from '../reactions.js'
import { CHATROOM_API_PREFIX } from '../routes.js'

export type ChatroomPhase = 'loading' | 'auth-required' | 'identity-required' | 'ready' | 'error'
export type ChatroomConnection = 'offline' | 'connecting' | 'online'

/** Browser-owned file waiting to be merged into the next room submission. */
export interface PendingChatroomFile {
  readonly id: string
  readonly file: File
}

/** CAS snapshot used by the native prompt interceptor. */
export interface ChatroomComposition {
  readonly roomId: string
  readonly revision: number
  readonly files: readonly PendingChatroomFile[]
  readonly reply: ChatroomReplyReference | undefined
}

/** Query-carried context for the isolated native Harness branch frame. */
export interface ChatroomBranchFrame {
  readonly threadId: string
  readonly sessionId: string
  readonly roomId: string
  readonly parentSessionId: string
}

/** Agent submission target resolved from a native Harness Session id. */
export type ChatroomAgentTarget =
  | { readonly kind: 'room'; readonly room: ChatroomInfo }
  | { readonly kind: 'thread'; readonly room: ChatroomInfo; readonly threadId: string }

/** Browser identity, room directory, selection, and presence around native Harness Sessions. */
export interface ChatroomView {
  readonly branchFrame?: ChatroomBranchFrame | undefined
  readonly open: boolean
  readonly phase: ChatroomPhase
  readonly connection: ChatroomConnection
  readonly rooms: readonly ChatroomInfo[]
  readonly room: ChatroomInfo | undefined
  readonly identity: ChatroomIdentity | undefined
  readonly auth: ChatroomAuthState
  readonly online: number
  readonly members: readonly ChatroomMember[]
  readonly memberCandidates: readonly ChatroomRoomInviteCandidate[]
  readonly reactions: readonly ChatroomReaction[]
  readonly threadPreviews: readonly ChatroomThreadPreview[]
  readonly membersOpen: boolean
  readonly managementBusy?: boolean
  readonly managementError?: string | undefined
  readonly error: string | undefined
  readonly composerRoomId: string | undefined
  readonly pendingFiles: readonly PendingChatroomFile[]
  readonly reply: ChatroomReplyReference | undefined
  readonly composerBusy: boolean
  readonly composerError: string | undefined
  readonly thread: ChatroomThread | undefined
  readonly threadMessages: readonly ChatroomThreadMessage[]
  readonly threadReply: ChatroomReplyReference | undefined
  readonly threadBusy: boolean
  readonly threadError: string | undefined
  readonly unreadCount: number
  readonly toasts: readonly ChatroomNotification[]
  readonly notificationsEnabled: boolean
  readonly selectionRoomId: string | undefined
  readonly selectedMessages: readonly ChatroomForwardItem[]
  readonly forwardOpen: boolean
  readonly forwardBusy: boolean
  readonly forwardError: string | undefined
  readonly accountOpen: boolean
  readonly accountBusy: boolean
  readonly accountError: string | undefined
  readonly adminOpen: boolean
  readonly adminBusy: boolean
  readonly adminOverview: ChatroomAdminOverview | undefined
  readonly adminError: string | undefined
  readonly directOpen: boolean
  readonly directBusy: boolean
  readonly directPeers: readonly ChatroomDirectPeer[]
  readonly directConversations: readonly ChatroomDirectConversation[]
  readonly directConversation: ChatroomDirectConversation | undefined
  readonly directMessages: readonly ChatroomDirectMessage[]
  readonly directError: string | undefined
}

/** React-free owner of room identity, directory, presence, and native Session navigation. */
export class ChatroomClientStore implements HostObservable<ChatroomView> {
  private snapshot: ChatroomView = {
    branchFrame: undefined,
    open: false,
    phase: 'loading',
    connection: 'offline',
    rooms: [],
    room: undefined,
    identity: undefined,
    auth: {
      enabled: false,
      authenticated: true,
      providers: [],
      allowSelfRegistration: true,
      bootstrapRequired: false,
    },
    online: 0,
    members: [],
    memberCandidates: [],
    reactions: [],
    threadPreviews: [],
    membersOpen: false,
    managementBusy: false,
    managementError: undefined,
    error: undefined,
    composerRoomId: undefined,
    pendingFiles: [],
    reply: undefined,
    composerBusy: false,
    composerError: undefined,
    thread: undefined,
    threadMessages: [],
    threadReply: undefined,
    threadBusy: false,
    threadError: undefined,
    unreadCount: 0,
    toasts: [],
    notificationsEnabled: notificationPermission() === 'granted',
    selectionRoomId: undefined,
    selectedMessages: [],
    forwardOpen: false,
    forwardBusy: false,
    forwardError: undefined,
    accountOpen: false,
    accountBusy: false,
    accountError: undefined,
    adminOpen: false,
    adminBusy: false,
    adminOverview: undefined,
    adminError: undefined,
    directOpen: false,
    directBusy: false,
    directPeers: [],
    directConversations: [],
    directConversation: undefined,
    directMessages: [],
    directError: undefined,
  }
  private readonly listeners = new Set<() => void>()
  private eventSource: EventSource | undefined
  private notificationSource: EventSource | undefined
  private pendingOpenRoomId: string | undefined
  private identityPromptedRoomId: string | undefined
  private stopped = false
  private compositionRevision = 0
  private pendingFileSequence = 0
  private originalTitle: string | undefined
  private activeNativeSession: { readonly id: string; readonly title: string; readonly shareable: boolean } | undefined
  private roomEnsure: { readonly sessionId: string; readonly promise: Promise<void> } | undefined

  constructor(
    private readonly openSession: (sessionId: string) => boolean = () => false,
    branchFrame?: ChatroomBranchFrame,
  ) {
    if (branchFrame !== undefined) this.snapshot = { ...this.snapshot, branchFrame }
  }

  /** Current immutable room projection. */
  getSnapshot = (): ChatroomView => this.snapshot

  /** Resolve room metadata for any native Session in the shared directory. */
  roomForSession(sessionId: string): ChatroomInfo | undefined {
    const direct = this.snapshot.rooms.find(room => room.sessionId === sessionId)
    if (direct !== undefined) return direct
    const frame = this.snapshot.branchFrame
    return frame?.sessionId === sessionId
      ? this.snapshot.rooms.find(room => room.id === frame.roomId)
      : undefined
  }

  /** Resolve whether one native Session submits to a room or one branch. */
  agentTargetForSession(sessionId: string): ChatroomAgentTarget | undefined {
    const room = this.roomForSession(sessionId)
    if (room === undefined) return undefined
    const frame = this.snapshot.branchFrame
    return frame?.sessionId === sessionId
      ? { kind: 'thread', room, threadId: frame.threadId }
      : { kind: 'room', room }
  }

  /** Retarget one retained native branch runtime without carrying composer state across threads. */
  switchBranchFrame(frame: ChatroomBranchFrame): void {
    const current = this.snapshot.branchFrame
    if (current?.threadId === frame.threadId
      && current.sessionId === frame.sessionId
      && current.roomId === frame.roomId
      && current.parentSessionId === frame.parentSessionId) return
    this.compositionRevision += 1
    this.set({
      branchFrame: frame,
      composerRoomId: undefined,
      pendingFiles: [],
      reply: undefined,
      composerBusy: false,
      composerError: undefined,
    })
  }

  /** Subscribe to room projection changes. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** Resolve the persistent browser identity and shared room directory. */
  async start(): Promise<void> {
    this.stopped = false
    if (typeof document !== 'undefined') this.originalTitle = document.title
    await this.loadSession()
  }

  /** Stop network activity and notification delivery. */
  stop(): void {
    this.stopped = true
    this.closeEvents()
    this.closeNotifications()
    this.updateActiveDocumentRoom(false)
    this.updateDocumentTitle(0)
    this.listeners.clear()
  }

  /** Show identity setup or the shared room directory. */
  openRoom = (): void => {
    this.set({ open: true, error: undefined })
  }

  /** Authenticate one local account and restore its room directory. */
  login = async (username: string, password: string): Promise<boolean> => {
    this.set({ phase: 'loading', error: undefined })
    try {
      const session = await requestJson<ChatroomSessionResponse>(`${CHATROOM_API_PREFIX}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      this.acceptSession(session)
      return true
    } catch (error) {
      this.set({ phase: 'auth-required', open: true, error: errorMessage(error) })
      return false
    }
  }

  /** Register a local member or the bootstrap super administrator. */
  register = async (input: {
    username: string
    password: string
    displayName: string
    avatarId: string
    bootstrapToken?: string
  }): Promise<boolean> => {
    this.set({ phase: 'loading', error: undefined })
    try {
      const session = await requestJson<ChatroomSessionResponse>(`${CHATROOM_API_PREFIX}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      this.acceptSession(session)
      return true
    } catch (error) {
      this.set({ phase: 'auth-required', open: true, error: errorMessage(error) })
      return false
    }
  }

  /** Revoke the current account session and return to the login gate. */
  logout = async (): Promise<void> => {
    try {
      await requestEmpty(`${CHATROOM_API_PREFIX}/auth/logout`, { method: 'POST' })
    } finally {
      this.closeEvents()
      this.closeNotifications()
      const auth = this.snapshot.auth
      this.set({
        phase: 'auth-required',
        open: true,
        rooms: [],
        room: undefined,
        identity: undefined,
        auth: {
          enabled: auth.enabled,
          authenticated: false,
          providers: auth.providers,
          allowSelfRegistration: auth.allowSelfRegistration,
          bootstrapRequired: auth.bootstrapRequired,
        },
        accountOpen: false,
        accountError: undefined,
        adminOpen: false,
        adminOverview: undefined,
        directOpen: false,
        directConversation: undefined,
        directMessages: [],
      })
    }
  }

  /** Open password and personal account controls. */
  openAccount = (): void => {
    if (!this.snapshot.auth.enabled || !this.snapshot.auth.authenticated) return
    this.set({ accountOpen: true, accountBusy: false, accountError: undefined, adminOpen: false, directOpen: false })
  }

  closeAccount = (): void => {
    this.set({ accountOpen: false, accountBusy: false, accountError: undefined })
  }

  /** Change the current local password and retain the newly rotated session. */
  changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    this.set({ accountBusy: true, accountError: undefined })
    try {
      const result = await requestJson<{ account: ChatroomAccount }>(`${CHATROOM_API_PREFIX}/account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', currentPassword, newPassword }),
      })
      this.set({
        accountOpen: false,
        accountBusy: false,
        accountError: undefined,
        auth: { ...this.snapshot.auth, account: result.account },
        identity: result.account,
      })
      return true
    } catch (error) {
      this.set({ accountBusy: false, accountError: errorMessage(error) })
      return false
    }
  }

  /** Open and load the super-administrator console. */
  openAdmin = async (): Promise<void> => {
    if (this.snapshot.auth.account?.role !== 'super-admin') return
    this.set({ adminOpen: true, adminBusy: true, adminError: undefined, directOpen: false, accountOpen: false })
    try {
      const overview = await requestJson<ChatroomAdminOverview>(`${CHATROOM_API_PREFIX}/admin`)
      this.set({ adminBusy: false, adminOverview: overview })
    } catch (error) {
      this.set({ adminBusy: false, adminError: errorMessage(error) })
    }
  }

  closeAdmin = (): void => {
    this.set({ adminOpen: false, adminError: undefined })
  }

  /** Create a local account from the super-administrator console. */
  adminCreateUser = async (input: {
    username: string
    password: string
    displayName: string
    avatarId: string
    role: 'super-admin' | 'admin' | 'member'
  }): Promise<boolean> => this.adminMutation({ action: 'create-user', ...input })

  /** Change a platform account role or activation state. */
  adminUpdateUser = async (
    userId: string,
    patch: { role?: 'super-admin' | 'admin' | 'member'; status?: 'active' | 'disabled' },
  ): Promise<boolean> => this.adminMutation({ action: 'update-user', userId, ...patch })

  /** Change whether new users may register themselves. */
  adminSetSelfRegistration = async (allowSelfRegistration: boolean): Promise<boolean> =>
    this.adminMutation({ action: 'settings', allowSelfRegistration })

  /** Select one external provider for immediate unauthenticated entry, or retain the local chooser. */
  adminSetAutoRedirectProvider = async (providerId?: string): Promise<boolean> =>
    this.adminMutation({ action: 'settings', autoRedirectProviderId: providerId ?? null })

  /** Add or update one generic enterprise OIDC provider. */
  adminSaveProvider = async (input: {
    id: string
    label: string
    enabled: boolean
    issuer: string
    clientId: string
    clientSecret?: string
    scopes: string
    usernameClaim: string
    displayNameClaim: string
    autoCreateUsers: boolean
  }): Promise<boolean> => this.adminMutation({ action: 'save-provider', ...input })

  adminDeleteProvider = async (providerId: string): Promise<boolean> =>
    this.adminMutation({ action: 'delete-provider', providerId })

  /** Open the private-message directory. */
  openDirect = async (peerId?: string): Promise<void> => {
    this.set({ directOpen: true, directBusy: true, directError: undefined, adminOpen: false, accountOpen: false })
    try {
      const response = peerId === undefined
        ? await requestJson<ChatroomDirectResponse>(`${CHATROOM_API_PREFIX}/direct`)
        : await requestJson<ChatroomDirectResponse>(`${CHATROOM_API_PREFIX}/direct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerId }),
        })
      this.set({
        directBusy: false,
        directPeers: response.peers,
        directConversations: response.conversations,
        directConversation: response.conversation,
        directMessages: response.messages ?? [],
      })
    } catch (error) {
      this.set({ directBusy: false, directError: errorMessage(error) })
    }
  }

  closeDirect = (): void => {
    this.set({ directOpen: false, directError: undefined })
  }

  /** Send one message inside the selected private conversation. */
  sendDirect = async (text: string): Promise<boolean> => {
    const conversation = this.snapshot.directConversation
    if (conversation === undefined || text.trim() === '' || this.snapshot.directBusy) return false
    this.set({ directBusy: true, directError: undefined })
    try {
      const response = await requestJson<{
        conversation: ChatroomDirectConversation
        message: ChatroomDirectMessage
      }>(`${CHATROOM_API_PREFIX}/direct/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id, text }),
      })
      const messages = this.snapshot.directMessages.some(message => message.id === response.message.id)
        ? this.snapshot.directMessages
        : [...this.snapshot.directMessages, response.message]
      this.set({
        directBusy: false,
        directConversation: response.conversation,
        directMessages: messages,
        directConversations: replaceDirectConversation(this.snapshot.directConversations, response.conversation),
      })
      return true
    } catch (error) {
      this.set({ directBusy: false, directError: errorMessage(error) })
      return false
    }
  }

  /** Open group management for the active room. */
  openMembers = (): void => {
    if (this.snapshot.room === undefined) return
    this.set({
      membersOpen: true,
      memberCandidates: [],
      thread: undefined,
      threadMessages: [],
      threadReply: undefined,
      threadError: undefined,
    })
    const viewerRole = this.snapshot.members.find(member =>
      member.participantId === this.snapshot.identity?.participantId)?.role
    if (viewerRole === 'owner' || viewerRole === 'admin') void this.loadMemberCandidates()
  }

  /** Close group management without changing the active room. */
  closeMembers = (): void => {
    this.set({ membersOpen: false, memberCandidates: [], managementError: undefined })
  }

  /** Add selected active platform accounts to the current room. */
  addRoomMembers = async (participantIds: readonly string[]): Promise<boolean> => {
    const room = this.snapshot.room
    if (room === undefined || participantIds.length === 0 || this.snapshot.managementBusy) return false
    this.set({ managementBusy: true, managementError: undefined })
    try {
      const result = await requestJson<ChatroomRoomManagementResponse>(`${CHATROOM_API_PREFIX}/rooms/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, action: 'add-members', participantIds }),
      })
      this.applyRoomManagement(result)
      return true
    } catch (error) {
      this.set({ managementBusy: false, managementError: errorMessage(error) })
      return false
    }
  }

  /** Rename the active room through the server-enforced management endpoint. */
  renameRoom = async (title: string): Promise<boolean> => {
    const room = this.snapshot.room
    if (room === undefined || this.snapshot.managementBusy) return false
    this.set({ managementBusy: true, managementError: undefined })
    try {
      const result = await requestJson<ChatroomRoomManageResponse>(`${CHATROOM_API_PREFIX}/rooms/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, action: 'rename', title }),
      })
      this.applyRoomManagement(result)
      return true
    } catch (error) {
      this.set({ managementBusy: false, managementError: errorMessage(error) })
      return false
    }
  }

  /** Promote or demote one member through the owner-only management endpoint. */
  setMemberRole = async (participantId: string, role: 'admin' | 'member'): Promise<boolean> => {
    const room = this.snapshot.room
    if (room === undefined || this.snapshot.managementBusy) return false
    this.set({ managementBusy: true, managementError: undefined })
    try {
      const result = await requestJson<ChatroomRoomManageResponse>(`${CHATROOM_API_PREFIX}/rooms/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, action: 'set-role', participantId, role }),
      })
      this.applyRoomManagement(result)
      return true
    } catch (error) {
      this.set({ managementBusy: false, managementError: errorMessage(error) })
      return false
    }
  }

  /** Close only the additive room dialog. */
  closeRoom = (): void => {
    this.set(this.snapshot.phase === 'identity-required' && this.snapshot.identity !== undefined
      ? { open: false, phase: 'ready', error: undefined }
      : { open: false })
  }

  /** Retry pending native navigation when the Host Session list changes. */
  resumeOpen = (): void => {
    const roomId = this.pendingOpenRoomId
    if (roomId === undefined) return
    const room = this.snapshot.rooms.find(candidate => candidate.id === roomId)
    if (room === undefined || !this.openSession(room.sessionId)) return
    this.pendingOpenRoomId = undefined
    this.set({ open: false, error: undefined })
  }

  /** Track native navigation and adopt ordinary Harness Sessions as shared rooms. */
  activateSession = (
    sessionId: string | undefined,
    title = '新会话',
    shareable = true,
  ): void => {
    this.activeNativeSession = sessionId === undefined ? undefined : { id: sessionId, title, shareable }
    const room = sessionId === undefined ? undefined : this.roomForSession(sessionId)
    if (room === undefined) {
      this.closeEvents()
      this.identityPromptedRoomId = undefined
      this.updateActiveDocumentRoom(false)
      this.set({
        room: undefined,
        connection: 'offline',
        online: 0,
        members: [],
        memberCandidates: [],
        reactions: [],
        threadPreviews: [],
        membersOpen: false,
        thread: undefined,
        threadMessages: [],
        threadReply: undefined,
        selectionRoomId: undefined,
        selectedMessages: [],
        forwardOpen: false,
      })
      if (sessionId !== undefined && shareable) void this.ensureActiveSessionRoom()
      return
    }
    this.updateActiveDocumentRoom(true)
    if (this.snapshot.identity === undefined && this.identityPromptedRoomId !== room.id) {
      this.identityPromptedRoomId = room.id
      this.set({ open: true })
    }
    if (this.snapshot.room?.id === room.id && this.eventSource !== undefined) return
    this.set({
      room,
      connection: 'connecting',
      online: 0,
      members: [],
      memberCandidates: [],
      reactions: [],
      threadPreviews: [],
      membersOpen: false,
      thread: undefined,
      threadMessages: [],
      threadReply: undefined,
      selectionRoomId: undefined,
      selectedMessages: [],
      forwardOpen: false,
    })
    this.clearUnread()
    this.openEvents(room)
  }

  /** Create the persistent browser identity, then show the room directory. */
  join = async (displayName: string, avatarId: string): Promise<void> => {
    const activeRoom = this.snapshot.room
    const activeConnection = this.snapshot.connection
    const activeOnline = this.snapshot.online
    this.set({ phase: 'loading', error: undefined })
    try {
      const session = await requestJson<ChatroomSessionResponse>(`${CHATROOM_API_PREFIX}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, avatarId }),
      })
      if (session.identity === null) throw new Error('服务端没有返回聊天室身份。')
      const resolvedRoom = activeRoom === undefined
        ? undefined
        : session.rooms.find(room => room.id === activeRoom.id)
      this.set({
        phase: 'ready',
        open: false,
        rooms: session.rooms,
        room: resolvedRoom,
        identity: session.identity,
        connection: resolvedRoom === undefined ? 'offline' : activeConnection,
        online: resolvedRoom === undefined ? 0 : activeOnline,
        error: undefined,
      })
      this.openNotifications()
      void this.ensureActiveSessionRoom()
    } catch (error) {
      this.set({ phase: 'identity-required', error: errorMessage(error) })
    }
  }

  /** Add browser files to the next submission in one shared room. */
  addFiles = (roomId: string, files: readonly File[]): void => {
    if (files.length === 0) return
    const current = this.compositionFor(roomId)
    const pending = files.map(file => ({ id: `file-${++this.pendingFileSequence}`, file }))
    this.compositionRevision += 1
    this.set({
      composerRoomId: roomId,
      pendingFiles: [...current.files, ...pending],
      reply: current.reply,
      composerError: undefined,
    })
  }

  /** Remove one browser-owned pending file. */
  removeFile = (roomId: string, fileId: string): void => {
    if (this.snapshot.composerRoomId !== roomId) return
    const files = this.snapshot.pendingFiles.filter(file => file.id !== fileId)
    if (files.length === this.snapshot.pendingFiles.length) return
    this.compositionRevision += 1
    this.set({ pendingFiles: files, composerError: undefined })
  }

  /** Address the next room message as a reply to one durable participant message. */
  setReply = (roomId: string, reply: ChatroomReplyReference): void => {
    const current = this.compositionFor(roomId)
    this.compositionRevision += 1
    this.set({
      composerRoomId: roomId,
      pendingFiles: current.files,
      reply,
      composerError: undefined,
    })
  }

  /** Cancel the next-message reply without changing pending files. */
  clearReply = (roomId: string): void => {
    if (this.snapshot.composerRoomId !== roomId || this.snapshot.reply === undefined) return
    this.compositionRevision += 1
    this.set({ reply: undefined, composerError: undefined })
  }

  /** Toggle one reaction and replace the message summary immediately. */
  toggleReaction = async (roomId: string, messageId: string, emoji: ChatroomReactionEmoji): Promise<void> => {
    try {
      const reaction = await requestJson<ChatroomReaction>(`${CHATROOM_API_PREFIX}/reactions/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, messageId, emoji }),
      })
      this.replaceReaction(reaction)
    } catch (error) {
      this.set({ composerError: errorMessage(error) })
    }
  }

  /** Add or remove one message from the current room selection. */
  toggleMessageSelection = (roomId: string, message: ChatroomForwardItem): void => {
    const current = this.snapshot.selectionRoomId === roomId ? this.snapshot.selectedMessages : []
    const selected = current.some(item => item.messageId === message.messageId)
      ? current.filter(item => item.messageId !== message.messageId)
      : [...current, message]
    this.set({
      selectionRoomId: roomId,
      selectedMessages: selected,
      forwardOpen: false,
      forwardError: undefined,
    })
  }

  /** Open the target-room chooser for one message or the active selection. */
  openForward = (roomId: string, message?: ChatroomForwardItem): void => {
    const selected = this.snapshot.selectionRoomId === roomId ? this.snapshot.selectedMessages : []
    const messages = message === undefined
      ? selected
      : selected.some(item => item.messageId === message.messageId) ? selected : [message]
    if (messages.length === 0) return
    this.set({
      selectionRoomId: roomId,
      selectedMessages: messages,
      forwardOpen: true,
      forwardError: undefined,
    })
  }

  /** Cancel message selection and merged-forward composition. */
  clearMessageSelection = (): void => {
    this.set({
      selectionRoomId: undefined,
      selectedMessages: [],
      forwardOpen: false,
      forwardBusy: false,
      forwardError: undefined,
    })
  }

  /** Close only the forward target chooser while retaining selected messages. */
  closeForward = (): void => {
    this.set({ forwardOpen: false, forwardError: undefined })
  }

  /** Send the current selection to another shared room as one merged card. */
  forwardSelected = async (targetRoomId: string): Promise<boolean> => {
    const sourceRoomId = this.snapshot.selectionRoomId
    if (sourceRoomId === undefined || this.snapshot.selectedMessages.length === 0 || this.snapshot.forwardBusy) return false
    this.set({ forwardBusy: true, forwardError: undefined })
    try {
      await requestJson<ChatroomPromptResponse>(`${CHATROOM_API_PREFIX}/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceRoomId, targetRoomId, messages: this.snapshot.selectedMessages }),
      })
      this.clearMessageSelection()
      return true
    } catch (error) {
      this.set({ forwardBusy: false, forwardError: errorMessage(error) })
      return false
    }
  }

  /** Capture files and reply metadata for one native prompt submission. */
  composition = (roomId: string): ChatroomComposition => {
    const current = this.compositionFor(roomId)
    return { roomId, revision: this.compositionRevision, files: current.files, reply: current.reply }
  }

  /** Clear only the composition that was successfully admitted. */
  completeComposition = (composition: ChatroomComposition): void => {
    if (this.snapshot.composerRoomId !== composition.roomId
      || this.compositionRevision !== composition.revision) {
      if (this.snapshot.composerBusy) this.set({ composerBusy: false })
      return
    }
    this.compositionRevision += 1
    this.set({
      composerRoomId: undefined,
      pendingFiles: [],
      reply: undefined,
      composerBusy: false,
      composerError: undefined,
    })
  }

  /** Send selected files without requiring placeholder text in the native composer. */
  sendFiles = async (roomId: string): Promise<void> => {
    const composition = this.composition(roomId)
    if (composition.files.length === 0 || this.snapshot.composerBusy) return
    this.set({ composerBusy: true, composerError: undefined })
    try {
      const content = await serializePendingFiles(composition.files)
      const frame = this.snapshot.branchFrame
      if (frame?.roomId === roomId) {
        await submitThreadPrompt({
          threadId: frame.threadId,
          mode: 'queue',
          content,
          ...(composition.reply === undefined ? {} : { reply: composition.reply }),
        })
      } else {
        await submitRoomPrompt({
          roomId,
          mode: 'queue',
          content,
          ...(composition.reply === undefined ? {} : { reply: composition.reply }),
        })
      }
      this.completeComposition(composition)
    } catch (error) {
      this.set({ composerBusy: false, composerError: errorMessage(error) })
    }
  }

  /** Activate and navigate to an existing shared room. */
  selectRoom = async (roomId: string): Promise<void> => {
    this.set({ error: undefined })
    try {
      const response = await requestJson<ChatroomRoomResponse>(`${CHATROOM_API_PREFIX}/rooms/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      })
      this.selectAndOpen(response.room)
    } catch (error) {
      this.set({ phase: 'ready', error: errorMessage(error) })
    }
  }

  /** Create, activate, and navigate to a new independent shared room. */
  createRoom = async (title: string): Promise<void> => {
    this.set({ error: undefined })
    try {
      const response = await requestJson<ChatroomRoomResponse>(`${CHATROOM_API_PREFIX}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      this.selectAndOpen(response.room)
    } catch (error) {
      this.set({ phase: 'ready', error: errorMessage(error) })
    }
  }

  /** Create or reopen a branch rooted at one main-room message. */
  openThread = async (roomId: string, root: ChatroomThreadRoot): Promise<void> => {
    this.set({ membersOpen: false, threadReply: undefined, threadBusy: true, threadError: undefined })
    try {
      const response = await requestJson<ChatroomThreadResponse>(`${CHATROOM_API_PREFIX}/threads/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, root }),
      })
      this.set({
        thread: response.thread,
        threadMessages: response.messages,
        ...(response.messages.length === 0 ? {} : {
          threadPreviews: replaceThreadPreview(this.snapshot.threadPreviews, {
            thread: response.thread,
            totalMessages: response.messages.length,
            recentMessages: response.messages.slice(-3),
          }),
        }),
        threadBusy: false,
        threadError: undefined,
      })
      this.clearUnread()
    } catch (error) {
      this.set({ threadBusy: false, threadError: errorMessage(error) })
    }
  }

  /** Close the right-side branch panel. */
  closeThread = (): void => {
    this.set({
      thread: undefined,
      threadMessages: [],
      threadReply: undefined,
      threadBusy: false,
      threadError: undefined,
    })
  }

  /** Address the next branch message as a reply without opening a nested branch. */
  setThreadReply = (reply: ChatroomReplyReference): void => {
    if (this.snapshot.thread !== undefined) this.set({ threadReply: reply, threadError: undefined })
  }

  /** Cancel the pending branch reply. */
  clearThreadReply = (): void => {
    if (this.snapshot.threadReply !== undefined) this.set({ threadReply: undefined, threadError: undefined })
  }

  /** Send one human-first branch message. */
  sendThreadMessage = async (text: string): Promise<boolean> => {
    const thread = this.snapshot.thread
    const reply = this.snapshot.threadReply
    if (thread === undefined || this.snapshot.threadBusy || text.trim() === '') return false
    this.set({ threadBusy: true, threadError: undefined })
    try {
      await requestJson<ChatroomPromptResponse>(`${CHATROOM_API_PREFIX}/threads/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: thread.id,
          mode: 'queue',
          content: [{ type: 'text', text }],
          ...(reply === undefined ? {} : { reply }),
        }),
      })
      this.set({ threadReply: undefined, threadBusy: false, threadError: undefined })
      return true
    } catch (error) {
      this.set({ threadBusy: false, threadError: errorMessage(error) })
      return false
    }
  }

  /** Request browser notification permission from an explicit user gesture. */
  enableSystemNotifications = async (): Promise<void> => {
    if (typeof Notification === 'undefined') return
    const permission = await Notification.requestPermission()
    this.set({ notificationsEnabled: permission === 'granted' })
  }

  /** Remove one in-page message alert. */
  dismissToast = (id: string): void => {
    this.set({ toasts: this.snapshot.toasts.filter(toast => toast.id !== id) })
  }

  /** Open identity editing without revoking the current identity. */
  resetIdentity = async (): Promise<void> => {
    this.set({ open: true, phase: 'identity-required', error: undefined })
  }

  /** Retry identity and directory recovery. */
  retry = async (): Promise<void> => {
    this.set({ phase: 'loading', error: undefined })
    await this.loadSession()
  }

  private async adminMutation(body: Record<string, unknown>): Promise<boolean> {
    if (this.snapshot.adminBusy) return false
    this.set({ adminBusy: true, adminError: undefined })
    try {
      const response = await requestJson<ChatroomAdminOverview | { overview: ChatroomAdminOverview }>(
        `${CHATROOM_API_PREFIX}/admin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )
      const overview = 'overview' in response ? response.overview : response
      this.set({ adminBusy: false, adminOverview: overview })
      return true
    } catch (error) {
      this.set({ adminBusy: false, adminError: errorMessage(error) })
      return false
    }
  }

  private acceptSession(session: ChatroomSessionResponse): void {
    if (session.identity === null) throw new Error('服务端没有返回登录账号。')
    this.set({
      phase: 'ready',
      open: false,
      connection: 'offline',
      rooms: session.rooms,
      identity: session.identity,
      auth: sessionAuth(session),
      error: undefined,
    })
    this.openNotifications()
    void this.ensureActiveSessionRoom()
  }

  private async ensureActiveSessionRoom(): Promise<void> {
    const active = this.activeNativeSession
    if (active === undefined || !active.shareable
      || this.snapshot.phase !== 'ready' || this.snapshot.identity === undefined
      || this.roomForSession(active.id) !== undefined) return
    if (this.roomEnsure?.sessionId === active.id) return await this.roomEnsure.promise
    const promise = (async () => {
      try {
        const response = await requestJson<ChatroomRoomResponse>(`${CHATROOM_API_PREFIX}/rooms/ensure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: active.id, title: active.title }),
        })
        const rooms = this.snapshot.rooms.some(room => room.id === response.room.id)
          ? this.snapshot.rooms.map(room => room.id === response.room.id ? response.room : room)
          : [...this.snapshot.rooms, response.room]
        this.set({ rooms, error: undefined })
        if (this.activeNativeSession?.id === active.id) this.activateSession(active.id, active.title, active.shareable)
      } catch (error) {
        if (this.activeNativeSession?.id === active.id) this.set({ error: errorMessage(error) })
      }
    })()
    this.roomEnsure = { sessionId: active.id, promise }
    try {
      await promise
    } finally {
      if (this.roomEnsure?.promise === promise) this.roomEnsure = undefined
    }
  }

  private selectAndOpen(room: ChatroomInfo): void {
    const rooms = this.snapshot.rooms.some(candidate => candidate.id === room.id)
      ? this.snapshot.rooms.map(candidate => candidate.id === room.id ? room : candidate)
      : [...this.snapshot.rooms, room]
    this.pendingOpenRoomId = room.id
    this.set({
      phase: 'ready',
      rooms,
      room,
      connection: 'connecting',
      online: 0,
      members: [],
      memberCandidates: [],
      reactions: [],
      threadPreviews: [],
      thread: undefined,
      threadMessages: [],
      threadReply: undefined,
      selectionRoomId: undefined,
      selectedMessages: [],
      forwardOpen: false,
      error: undefined,
    })
    this.openEvents(room)
    this.resumeOpen()
  }

  private compositionFor(roomId: string): {
    files: readonly PendingChatroomFile[]
    reply: ChatroomReplyReference | undefined
  } {
    return this.snapshot.composerRoomId === roomId
      ? { files: this.snapshot.pendingFiles, reply: this.snapshot.reply }
      : { files: [], reply: undefined }
  }

  private async loadSession(): Promise<void> {
    try {
      const session = await requestJson<ChatroomSessionResponse>(`${CHATROOM_API_PREFIX}/session`)
      if (this.stopped) return
      const auth = sessionAuth(session)
      if (auth.enabled && !auth.authenticated) {
        this.closeEvents()
        this.closeNotifications()
        this.set({
          phase: 'auth-required',
          open: true,
          connection: 'offline',
          rooms: [],
          room: undefined,
          identity: undefined,
          auth,
          online: 0,
          error: undefined,
        })
        return
      }
      if (session.identity === null) {
        this.closeEvents()
        this.set({
          phase: 'identity-required',
          open: true,
          connection: 'offline',
          rooms: session.rooms,
          room: undefined,
          identity: undefined,
          auth,
          online: 0,
          error: undefined,
        })
        return
      }
      this.set({
        phase: 'ready',
        connection: 'offline',
        rooms: session.rooms,
        identity: session.identity,
        auth,
        error: undefined,
      })
      this.openNotifications()
      void this.ensureActiveSessionRoom()
    } catch (error) {
      if (!this.stopped) this.set({ phase: 'error', connection: 'offline', error: errorMessage(error) })
    }
  }

  private openEvents(room: ChatroomInfo): void {
    this.closeEvents()
    if (this.stopped || this.snapshot.identity === undefined) return
    this.set({ connection: 'connecting' })
    const source = new EventSource(`${CHATROOM_API_PREFIX}/events?roomId=${encodeURIComponent(room.id)}`)
    this.eventSource = source
    source.onopen = () => {
      if (this.eventSource === source) this.set({ connection: 'online', error: undefined })
    }
    source.onmessage = (event) => {
      if (this.eventSource !== source) return
      try {
        this.receive(JSON.parse(event.data) as ChatroomServerEvent)
      } catch {
        this.set({ error: '收到无法识别的聊天室同步消息。' })
      }
    }
    source.onerror = () => {
      if (this.eventSource === source) this.set({ connection: 'connecting' })
    }
  }

  private openNotifications(): void {
    if (this.stopped || this.snapshot.identity === undefined || this.notificationSource !== undefined) return
    const source = new EventSource(`${CHATROOM_API_PREFIX}/notifications`)
    this.notificationSource = source
    source.onmessage = (event) => {
      if (this.notificationSource !== source) return
      try {
        const parsed = JSON.parse(event.data) as ChatroomGlobalEvent
        if (parsed.type === 'notification') this.receiveNotification(parsed.notification)
        else if (parsed.type === 'direct-message') this.receiveDirectMessage(parsed)
      } catch {
        this.set({ error: '收到无法识别的消息提醒。' })
      }
    }
  }

  private closeEvents(): void {
    this.eventSource?.close()
    this.eventSource = undefined
  }

  private closeNotifications(): void {
    this.notificationSource?.close()
    this.notificationSource = undefined
  }

  private receive(event: ChatroomServerEvent): void {
    switch (event.type) {
      case 'snapshot':
        this.set({
          phase: 'ready',
          connection: 'online',
          room: event.room,
          identity: event.identity,
          online: event.online,
          members: event.members,
          reactions: event.reactions,
          threadPreviews: event.threadPreviews,
          error: undefined,
        })
        return
      case 'presence':
        this.set({ online: event.online, members: event.members })
        return
      case 'thread-message':
        this.set({
          threadPreviews: replaceThreadPreview(this.snapshot.threadPreviews, event.preview),
          ...(this.snapshot.thread?.id !== event.message.threadId
            || this.snapshot.threadMessages.some(message => message.id === event.message.id)
            ? {}
            : { threadMessages: [...this.snapshot.threadMessages, event.message] }),
        })
        return
      case 'reaction':
        this.replaceReaction(event.reaction)
        return
      case 'room-updated':
        this.applyRoomManagement({ room: event.room, members: event.members })
        return
    }
  }

  private replaceReaction(reaction: ChatroomReaction): void {
    if (this.snapshot.room?.id !== reaction.roomId) return
    const without = this.snapshot.reactions.filter(item =>
      item.messageId !== reaction.messageId || item.emoji !== reaction.emoji)
    this.set({ reactions: reaction.participantIds.length === 0 ? without : [...without, reaction] })
  }

  private applyRoomManagement(result: ChatroomRoomManageResponse | ChatroomRoomManagementResponse): void {
    const rooms = this.snapshot.rooms.map(room => room.id === result.room.id ? result.room : room)
    const memberIds = new Set(result.members.map(member => member.participantId))
    this.set({
      rooms,
      ...(this.snapshot.room?.id === result.room.id ? { room: result.room, members: result.members } : {}),
      memberCandidates: 'candidates' in result
        ? result.candidates
        : this.snapshot.memberCandidates.filter(candidate => !memberIds.has(candidate.participantId)),
      managementBusy: false,
      managementError: undefined,
    })
  }

  private async loadMemberCandidates(): Promise<void> {
    const room = this.snapshot.room
    if (room === undefined || this.snapshot.managementBusy) return
    this.set({ managementBusy: true, managementError: undefined })
    try {
      const result = await requestJson<ChatroomRoomManagementResponse>(
        `${CHATROOM_API_PREFIX}/rooms/manage?roomId=${encodeURIComponent(room.id)}`,
      )
      if (this.snapshot.room?.id === room.id) this.applyRoomManagement(result)
    } catch (error) {
      this.set({ managementBusy: false, managementError: errorMessage(error) })
    }
  }

  private receiveNotification(notification: ChatroomNotification): void {
    if (notification.participantId === this.snapshot.identity?.participantId) return
    const toasts = [...this.snapshot.toasts.filter(item => item.id !== notification.id), notification].slice(-4)
    const isVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'
    const isCurrent = this.snapshot.room?.id === notification.roomId
      && (notification.threadId === undefined || notification.threadId === this.snapshot.thread?.id)
    const unreadCount = isVisible && isCurrent ? this.snapshot.unreadCount : this.snapshot.unreadCount + 1
    this.set({ toasts, unreadCount })
    if (this.snapshot.notificationsEnabled && typeof Notification !== 'undefined' && !isVisible) {
      try {
        new Notification(`${notification.displayName} · ${notification.roomTitle}`, { body: notification.text })
      } catch (error) {
        this.set({ notificationsEnabled: false, error: `系统消息提醒失败：${errorMessage(error)}` })
      }
    }
    globalThis.setTimeout(() => { this.dismissToast(notification.id) }, 6_000)
  }

  private receiveDirectMessage(event: ChatroomDirectMessageEvent): void {
    const conversations = replaceDirectConversation(this.snapshot.directConversations, event.conversation)
    const selected = this.snapshot.directConversation?.id === event.conversation.id
    const messages = !selected || this.snapshot.directMessages.some(message => message.id === event.message.id)
      ? this.snapshot.directMessages
      : [...this.snapshot.directMessages, event.message]
    const own = event.message.senderId === this.snapshot.identity?.participantId
    const isVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'
    const isCurrent = this.snapshot.directOpen && selected
    this.set({
      directConversations: conversations,
      ...(selected ? { directConversation: event.conversation, directMessages: messages } : {}),
      unreadCount: own || (isVisible && isCurrent) ? this.snapshot.unreadCount : this.snapshot.unreadCount + 1,
    })
    if (!own) {
      const notification: ChatroomNotification = {
        id: event.message.id,
        roomId: `direct:${event.conversation.id}`,
        roomTitle: '私聊',
        participantId: event.message.senderId,
        displayName: event.conversation.peer.displayName,
        role: 'human',
        text: event.message.text,
        createdAt: event.message.createdAt,
      }
      const toasts = [...this.snapshot.toasts.filter(item => item.id !== notification.id), notification].slice(-4)
      this.set({ toasts })
      if (this.snapshot.notificationsEnabled && typeof Notification !== 'undefined' && !isVisible) {
        try {
          new Notification(`${event.conversation.peer.displayName} · 私聊`, { body: event.message.text })
        } catch (error) {
          this.set({ notificationsEnabled: false, error: `系统消息提醒失败：${errorMessage(error)}` })
        }
      }
      globalThis.setTimeout(() => { this.dismissToast(notification.id) }, 6_000)
    }
  }

  private clearUnread(): void {
    if (this.snapshot.unreadCount !== 0) this.set({ unreadCount: 0 })
  }

  private updateDocumentTitle(unreadCount: number): void {
    if (typeof document === 'undefined' || this.originalTitle === undefined) return
    document.title = unreadCount === 0 ? this.originalTitle : `(${unreadCount}) ${this.originalTitle}`
  }

  private updateActiveDocumentRoom(active: boolean): void {
    if (typeof document === 'undefined') return
    document.documentElement.toggleAttribute('data-dsh-chatroom-active', active)
  }

  private set(patch: Partial<ChatroomView>): void {
    if (this.stopped) return
    this.snapshot = { ...this.snapshot, ...patch }
    if (patch.unreadCount !== undefined) this.updateDocumentTitle(this.snapshot.unreadCount)
    for (const listener of this.listeners) listener()
  }
}

function replaceThreadPreview(
  previews: readonly ChatroomThreadPreview[],
  preview: ChatroomThreadPreview,
): readonly ChatroomThreadPreview[] {
  return [...previews.filter(item => item.thread.id !== preview.thread.id), preview]
}

function replaceDirectConversation(
  conversations: readonly ChatroomDirectConversation[],
  conversation: ChatroomDirectConversation,
): readonly ChatroomDirectConversation[] {
  return [conversation, ...conversations.filter(item => item.id !== conversation.id)]
    .sort((left, right) => right.updatedAt - left.updatedAt)
}

function notificationPermission(): NotificationPermission | 'unsupported' {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
}

function sessionAuth(session: ChatroomSessionResponse): ChatroomAuthState {
  return session.auth ?? {
    enabled: false,
    authenticated: true,
    providers: [],
    allowSelfRegistration: true,
    bootstrapRequired: false,
  }
}

/** Submit one native composer payload through human-first room admission. */
export async function submitRoomPrompt(
  request: ChatroomPromptRequest,
  signal?: AbortSignal,
): Promise<ChatroomPromptResponse> {
  return await requestJson<ChatroomPromptResponse>(`${CHATROOM_API_PREFIX}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    ...(signal === undefined ? {} : { signal }),
  })
}

/** Submit one native composer payload through branch human-first admission. */
export async function submitThreadPrompt(
  request: ChatroomThreadPromptRequest,
  signal?: AbortSignal,
): Promise<ChatroomPromptResponse> {
  return await requestJson<ChatroomPromptResponse>(`${CHATROOM_API_PREFIX}/threads/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    ...(signal === undefined ? {} : { signal }),
  })
}

/** Serialize browser Files only at submission time, keeping bytes out of observable state. */
export async function serializePendingFiles(
  files: readonly PendingChatroomFile[],
): Promise<ChatroomPromptContentPart[]> {
  return await Promise.all(files.map(async ({ file }): Promise<ChatroomPromptContentPart> => {
    const data = bytesToBase64(new Uint8Array(await file.arrayBuffer()))
    if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/webp' || file.type === 'image/gif') {
      return { type: 'image', name: file.name, mediaType: file.type, data }
    }
    return {
      type: 'file',
      name: file.name,
      mediaType: file.type === '' ? 'application/octet-stream' : file.type,
      data,
    }
  }))
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, credentials: 'same-origin' })
  if (!response.ok) throw await responseError(response)
  return await response.json() as T
}

async function requestEmpty(url: string, init?: RequestInit): Promise<void> {
  const response = await fetch(url, { ...init, credentials: 'same-origin' })
  if (!response.ok) throw await responseError(response)
}

async function responseError(response: Response): Promise<HttpError> {
  let message = `聊天室请求失败（HTTP ${response.status}）。`
  try {
    const body = await response.json() as Partial<ChatroomErrorResponse>
    if (typeof body.error === 'string' && body.error !== '') message = body.error
  } catch {
    // The status code is sufficient when an upstream proxy returns non-JSON.
  }
  return new HttpError(response.status, message)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 32_768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32_768))
  }
  return btoa(binary)
}
