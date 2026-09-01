// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatroomEntry } from '../src/client/ChatroomEntry.js'
import { ChatroomSettingsSection } from '../src/client/ChatroomAccountPanels.js'
import { RoomIdentityAction } from '../src/client/RoomIdentityAction.js'
import { ChatroomAvatar } from '../src/client/ChatroomAvatar.js'
import { BRANCH_FRAME_READY, markBranchFrameSessionReady } from '../src/client/branch-frame.js'
import type { ChatroomView } from '../src/client/store.js'

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe('native chatroom integration', () => {
  it('uses a remote avatar without a referrer and falls back after load failure', async () => {
    const view = render(<ChatroomAvatar avatarId="whale" avatarUrl="https://avatars.example.com/alice.png" seed="alice-id" />)
    const image = document.querySelector('img')
    expect(image).not.toBeNull()
    if (image === null) throw new Error('remote avatar image was not rendered')
    expect(image.getAttribute('referrerpolicy')).toBe('no-referrer')
    fireEvent.error(image)
    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByText('🐳')).toBeTruthy()
    view.rerender(<ChatroomAvatar avatarId="whale" avatarUrl="https://avatars.example.com/alice-v2.png" seed="alice-id" />)
    await waitFor(() => expect(document.querySelector('img')).not.toBeNull())
  })

  it('does not render an unsafe avatar URL', () => {
    render(<ChatroomAvatar avatarId="fox" avatarUrl="http://avatars.example.com/alice.png" seed="alice-id" />)
    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByText('🦊')).toBeTruthy()
  })

  it('does not add a floating shared-session launcher', () => {
    renderEntry(view({ open: false }))
    expect(screen.queryByText('◉ 共享会话')).toBeNull()
    expect(screen.queryByTestId('chatroom-dialog')).toBeNull()
  })

  it('requires a name and lets the identity dialog close', () => {
    const join = vi.fn(async () => undefined)
    const closeRoom = vi.fn()
    renderEntry(view({ open: true, phase: 'identity-required', identity: undefined }), { join, closeRoom })
    const button = screen.getByTestId('chatroom-join')
    expect((button as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByTestId('chatroom-identity-input'), { target: { value: 'Alice' } })
    fireEvent.click(screen.getByLabelText('狐狸'))
    fireEvent.click(button)
    expect(join).toHaveBeenCalledWith('Alice', 'fox')
    fireEvent.click(screen.getByLabelText('关闭'))
    expect(closeRoom).toHaveBeenCalledOnce()
  })

  it('prefills the current name and avatar when editing identity', () => {
    renderEntry(view({ open: true, phase: 'identity-required' }))
    expect((screen.getByTestId('chatroom-identity-input') as HTMLInputElement).value).toBe('Alice')
    expect(screen.getByLabelText('鲸鱼').getAttribute('aria-checked')).toBe('true')
  })

  it('renders the login gate and submits local credentials', () => {
    const login = vi.fn(async () => true)
    renderEntry(view({
      open: true,
      phase: 'auth-required',
      rooms: [],
      room: undefined,
      identity: undefined,
      auth: {
        enabled: true,
        authenticated: false,
        providers: [{ id: 'company', type: 'oidc', label: '企业统一登录' }],
        allowSelfRegistration: true,
        bootstrapRequired: false,
      },
    }), { login })
    fireEvent.change(screen.getByLabelText('账号'), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'alice password 123' } })
    fireEvent.click(screen.getAllByRole('button', { name: '登录' }).at(-1)!)
    expect(login).toHaveBeenCalledWith('alice', 'alice password 123')
    expect(screen.getByText('使用 企业统一登录 登录')).toBeTruthy()
  })

  it('shows super-administrator account controls and isolated direct messages', () => {
    const adminUpdateUser = vi.fn(async () => true)
    const adminCreateUser = vi.fn(async () => true)
    const adminSetAutoRedirectProvider = vi.fn(async () => true)
    const adminSaveProvider = vi.fn(async () => true)
    const sendDirect = vi.fn(async () => true)
    const owner = {
      participantId: 'alice-id', username: 'alice', displayName: 'Alice', avatarId: 'whale' as const,
      role: 'super-admin' as const, status: 'active' as const, createdAt: 1,
    }
    const accountView = view({
      auth: {
        enabled: true, authenticated: true, account: owner, providers: [],
        allowSelfRegistration: true, bootstrapRequired: false,
      },
      adminOpen: true,
      adminOverview: {
        users: [owner], providers: [],
        loginProviders: [{ id: 'company', type: 'oidc', label: '企业统一登录' }],
        autoRedirectProviderId: 'company', allowSelfRegistration: true,
        oidcCallbackBase: 'https://chat.example.com/plugins/deepseek-harness-chatroom/api/auth/oidc/',
      },
      directOpen: true,
      directPeers: [{ participantId: 'bob-id', username: 'bob-user', displayName: 'Bob', avatarId: 'panda' }],
      directConversations: [{
        id: 'direct-1', peer: { participantId: 'bob-id', username: 'bob-user', displayName: 'Bob', avatarId: 'panda' },
        createdAt: 1, updatedAt: 2,
      }],
      directConversation: {
        id: 'direct-1', peer: { participantId: 'bob-id', username: 'bob-user', displayName: 'Bob', avatarId: 'panda' },
        createdAt: 1, updatedAt: 2,
      },
      directMessages: [{
        id: 'message-1', conversationId: 'direct-1', sequence: 1, senderId: 'bob-id', text: '私聊内容', createdAt: 2,
      }, {
        id: 'message-2', conversationId: 'direct-1', sequence: 2, senderId: 'bob-id', text: 'https://example.com/guide', createdAt: 3,
      }],
    })
    renderEntry(accountView, { adminUpdateUser, adminCreateUser, adminSetAutoRedirectProvider, adminSaveProvider, sendDirect })
    renderSettings(accountView, { adminUpdateUser, adminCreateUser, adminSetAutoRedirectProvider, adminSaveProvider, sendDirect })
    expect(screen.getByTestId('chatroom-settings')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '打开私聊' })).toBeNull()
    expect(screen.getByText('@alice')).toBeTruthy()
    const entry = screen.getByLabelText('未登录用户入口') as HTMLSelectElement
    expect(entry.value).toBe('company')
    fireEvent.change(entry, { target: { value: '' } })
    expect(adminSetAutoRedirectProvider).toHaveBeenCalledWith(undefined)
    fireEvent.change(screen.getByLabelText('账号名'), { target: { value: 'carol' } })
    fireEvent.change(screen.getByLabelText('显示名称'), { target: { value: 'Carol' } })
    fireEvent.change(screen.getByLabelText('初始密码'), { target: { value: 'carol password 123' } })
    fireEvent.click(screen.getByLabelText('狐狸'))
    fireEvent.click(screen.getByRole('button', { name: '创建账号' }))
    expect(adminCreateUser).toHaveBeenCalledWith({
      username: 'carol', password: 'carol password 123', displayName: 'Carol', avatarId: 'fox', role: 'member',
    })
    fireEvent.change(screen.getByLabelText('Provider ID'), { target: { value: 'company' } })
    fireEvent.change(screen.getByLabelText('登录按钮名称'), { target: { value: '企业统一登录' } })
    fireEvent.change(screen.getByLabelText('Issuer URL'), { target: { value: 'https://id.example.com' } })
    fireEvent.change(screen.getByLabelText('Client ID'), { target: { value: 'client-id' } })
    fireEvent.click(screen.getByRole('button', { name: '保存提供方' }))
    expect(adminSaveProvider).toHaveBeenCalledWith(expect.objectContaining({
      id: 'company', label: '企业统一登录', issuer: 'https://id.example.com', clientId: 'client-id',
    }))
    expect(screen.getByText('私聊内容')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '关闭私聊' })).toBeNull()
    expect(screen.getByRole('link', { name: 'https://example.com/guide' })).toBeTruthy()
    const directMessages = [...document.querySelectorAll<HTMLElement>('.dsh-chatroom-direct-messages > .dsh-chatroom-participant-message')]
    expect(directMessages.map(message => message.dataset.dshChatroomGroupPosition)).toEqual(['start', 'end'])
    expect(directMessages[0]?.dataset.dshChatroomActionsVisible).toBe('false')
    expect(directMessages[1]?.dataset.dshChatroomActionsVisible).toBe('true')
    expect(directMessages[1]?.querySelector('.dsh-chatroom-message-actions time')).toBeTruthy()
    expect(directMessages[1]?.querySelector('button[aria-label="回复"]')).toBeTruthy()
    expect(directMessages[1]?.querySelector('button[aria-label="转发"]')).toBeTruthy()
    const directInput = screen.getByPlaceholderText('给 Bob 发消息') as HTMLTextAreaElement
    fireEvent.change(directInput, { target: { value: '收到' } })
    fireEvent.click(screen.getByRole('button', { name: '发送表情' }))
    fireEvent.click(screen.getByRole('button', { name: '插入 🎉' }))
    expect(directInput.value).toBe('收到🎉')
    const attachment = new File(['private'], 'private.txt', { type: 'text/plain' })
    fireEvent.change(screen.getByLabelText('选择私聊文件'), { target: { files: [attachment] } })
    expect(screen.getByText('private.txt')).toBeTruthy()
    fireEvent.keyDown(directInput, { key: 'Enter', shiftKey: true })
    expect(sendDirect).not.toHaveBeenCalled()
    fireEvent.keyDown(directInput, { key: 'Enter' })
    expect(sendDirect).toHaveBeenCalledWith('收到🎉', [attachment])
  })

  it('describes settings scope by role and offers a next step when WeCom is unavailable', () => {
    renderSettings(view({ wecomAuthorization: { enabled: false, status: 'unauthorized' } } as never))
    expect(screen.getByText('管理你的账号与协作服务。')).toBeTruthy()
    expect(screen.getByText('企业微信功能当前不可用，请联系管理员。')).toBeTruthy()
    cleanup()

    const owner = {
      participantId: 'alice-id', username: 'alice', displayName: 'Alice', avatarId: 'whale' as const,
      role: 'super-admin' as const, status: 'active' as const, createdAt: 1,
    }
    renderSettings(view({
      auth: {
        enabled: true, authenticated: true, account: owner, providers: [],
        allowSelfRegistration: true, bootstrapRequired: false,
      },
    }))
    expect(screen.getByText('管理账号、平台成员与企业登录。')).toBeTruthy()
  })

  it('edits the main and controller system prompts in native settings', () => {
    const saveAutomation = vi.fn(async () => true)
    renderSettings(view({
      automationOverview: {
        canManage: true,
        provider: 'deepseek',
        model: 'chat',
        meetingSummaryProvider: 'deepseek',
        meetingSummaryModel: 'chat',
        mainAgentPrompt: '原主提示词',
        controllerPrompt: '原判断提示词',
        models: [{ provider: 'deepseek', model: 'chat', label: 'DeepSeek · Chat' }],
      },
    }), { saveAutomation })

    fireEvent.change(screen.getByLabelText('群聊主 Agent 系统提示词'), { target: { value: '新主提示词' } })
    fireEvent.change(screen.getByLabelText('自动回复判断 Agent 系统提示词'), { target: { value: '新判断提示词' } })
    fireEvent.click(screen.getByRole('button', { name: '保存系统提示词' }))
    expect(saveAutomation).toHaveBeenCalledWith('deepseek', 'chat', 'deepseek', 'chat', '新主提示词', '新判断提示词')
  })

  it('keeps shared Enterprise WeChat connect, disconnect, and rebind controls in Settings', () => {
    const disconnectWecomAuthorization = vi.fn(async () => true)
    const rebindWecomAuthorization = vi.fn(async () => true)
    vi.stubGlobal('confirm', vi.fn(() => true))
    renderSettings(view({
      wecomAuthorization: {
        enabled: true, status: 'authorized', qrAvailable: false, canManage: true,
      },
    }), { disconnectWecomAuthorization, rebindWecomAuthorization })

    expect(screen.getByText('全站共用一个企业微信授权；任何成员发起的会议和文档操作都使用这份部署账号。')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '解绑' }))
    fireEvent.click(screen.getByRole('button', { name: '重新绑定' }))
    expect(disconnectWecomAuthorization).toHaveBeenCalledOnce()
    expect(rebindWecomAuthorization).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog', { name: '连接企业微信' })).toBeNull()
  })

  it('renders the Enterprise WeChat QR code inside Settings instead of behind it', () => {
    renderSettings(view({
      wecomAuthorization: {
        enabled: true, status: 'pending', qrAvailable: true, canManage: true,
      },
    }))

    const image = screen.getByRole('img', { name: '企业微信登录二维码' })
    expect(image.closest('.dsh-chatroom-settings')).not.toBeNull()
    expect(screen.queryByRole('dialog', { name: '连接企业微信' })).toBeNull()
  })

  it('lists existing rooms and creates a new independent shared Session', () => {
    const selectRoom = vi.fn(async () => undefined)
    const createRoom = vi.fn(async () => undefined)
    renderEntry(view({ open: true }), { selectRoom, createRoom })

    expect(screen.getByText('AI 聊天室')).toBeTruthy()
    expect(screen.getAllByText('@DeepSeek', { exact: false })).toHaveLength(2)
    fireEvent.click(screen.getByTestId('chatroom-room-lobby'))
    expect(selectRoom).toHaveBeenCalledWith('lobby')

    const create = screen.getByTestId('chatroom-create')
    expect((create as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByTestId('chatroom-title-input'), { target: { value: '项目二' } })
    fireEvent.click(create)
    expect(createRoom).toHaveBeenCalledWith('项目二')
  })

  it('adds identity and presence only to shared native Sessions', () => {
    const room = view({ connection: 'online', online: 2 })
    const { rerender } = render(<RoomIdentityAction
      sessionId={'chatroom-v1-lobby' as never}
      useChatroom={selector => selector(room)}
      openMembers={vi.fn()}
    />)
    expect(screen.getByText('Alice · 2 人在线')).toBeTruthy()

    rerender(<RoomIdentityAction
      sessionId={'another-session' as never}
      useChatroom={selector => selector(room)}
      openMembers={vi.fn()}
    />)
    expect(screen.queryByText('Alice · 2 人在线')).toBeNull()
  })

  it('shows shared-room creation only while that Session has an active request', () => {
    const pending = view({ room: undefined, rooms: [], roomEnsureSessionId: 'native-new' })
    const { rerender } = render(<RoomIdentityAction
      sessionId={'native-new' as never}
      useChatroom={selector => selector(pending)}
      openMembers={vi.fn()}
    />)
    expect(screen.getByRole('button', { name: '正在建立共享群…' })).toBeTruthy()

    rerender(<RoomIdentityAction
      sessionId={'native-new' as never}
      useChatroom={selector => selector({ ...pending, roomEnsureSessionId: undefined })}
      openMembers={vi.fn()}
    />)
    expect(screen.queryByRole('button', { name: '正在建立共享群…' })).toBeNull()
  })

  it('opens group management from a shared Session header', () => {
    const openMembers = vi.fn()
    const room = view()
    render(<RoomIdentityAction
      sessionId={'chatroom-v1-lobby' as never}
      useChatroom={selector => selector(room)}
      openMembers={openMembers}
    />)
    fireEvent.click(screen.getByRole('button', { name: '群管理' }))
    expect(openMembers).toHaveBeenCalledOnce()
  })

  it('renders room management, unread alerts, and an isolated native branch frame', () => {
    const renameRoom = vi.fn(async () => true)
    const setMemberRole = vi.fn(async () => true)
    const addRoomMembers = vi.fn(async () => true)
    const setRoomAutoTrigger = vi.fn(async () => true)
    const closeThread = vi.fn()
    const room = view({
      membersOpen: true,
      members: [
        {
          participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale', role: 'owner',
          joinedAt: 1, lastSeenAt: Date.now(), online: true,
        },
        {
          participantId: 'bob-id', displayName: 'Bob', avatarId: 'panda', role: 'member',
          joinedAt: 1, lastSeenAt: Date.now(), online: true,
        },
      ],
      memberCandidates: [
        { participantId: 'carol-id', username: 'carol', displayName: 'Carol', avatarId: 'fox' },
        { participantId: 'dave-id', username: 'dave', displayName: 'Dave', avatarId: 'dog' },
      ],
      unreadCount: 3,
      toasts: [{
        id: 'notice', roomId: 'lobby', roomTitle: 'AI 聊天室', participantId: 'bob-id', displayName: 'Bob',
        role: 'human', text: '新消息', createdAt: Date.now(),
      }],
      thread: {
        id: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread', createdAt: 1,
        root: { messageId: 'user:1', displayName: 'Bob', text: '主题消息', role: 'human' },
      },
    })
    const overrides = { renameRoom, setMemberRole, addRoomMembers, setRoomAutoTrigger, closeThread }
    const rendered = renderEntry(room, overrides)
    expect(screen.getByTestId('chatroom-members')).toBeTruthy()
    expect(screen.getByTestId('chatroom-thread-panel')).toBeTruthy()
    expect(screen.getByText(/来自 AI 聊天室 · Bob：主题消息/)).toBeTruthy()
    expect(screen.getByText('新消息')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '复制邀请链接' })).toBeNull()
    fireEvent.click(screen.getByRole('checkbox', { name: /Carol/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Dave/ }))
    fireEvent.click(screen.getByRole('button', { name: '添加选中的 2 位' }))
    expect(addRoomMembers).toHaveBeenCalledWith(['carol-id', 'dave-id'])
    fireEvent.click(screen.getByRole('checkbox', { name: '无需 @AI 自动回复' }))
    expect(setRoomAutoTrigger).toHaveBeenCalledWith(true)
    const frame = screen.getByTitle('分支回复：主题消息') as HTMLIFrameElement
    const frameUrl = new URL(frame.src)
    expect(frameUrl.searchParams.get('dsh-chatroom-thread')).toBe('thread')
    expect(frameUrl.searchParams.get('dsh-chatroom-thread-session')).toBe('chatroom-thread-v1-thread')
    expect(frameUrl.searchParams.get('dsh-chatroom-parent-session')).toBe('chatroom-v1-lobby')
    expect(screen.getByText('正在加载分支…')).toBeTruthy()
    fireEvent(window, new MessageEvent('message', {
      origin: globalThis.location.origin,
      source: frame.contentWindow,
      data: { type: BRANCH_FRAME_READY, threadId: 'thread' },
    }))
    expect(screen.getByText('正在加载分支…')).toBeTruthy()

    const frameDocument = frame.contentDocument!
    frameDocument.open()
    frameDocument.write('<!doctype html><html><body><main data-dsh-chatroom-branch-shell><nav></nav><section><header>分支：主题消息</header><textarea></textarea></section><aside></aside></main></body></html>')
    frameDocument.close()
    markBranchFrameSessionReady(frameDocument, 'chatroom-thread-v1-thread')
    fireEvent(window, new MessageEvent('message', {
      origin: globalThis.location.origin,
      source: frame.contentWindow,
      data: { type: BRANCH_FRAME_READY, threadId: 'thread' },
    }))
    expect(screen.queryByText('正在加载分支…')).toBeNull()

    fireEvent.change(screen.getByRole('textbox', { name: '群聊名称' }), { target: { value: '新群名' } })
    fireEvent.click(screen.getByRole('button', { name: '保存名称' }))
    expect(renameRoom).toHaveBeenCalledWith('新群名')
    fireEvent.click(screen.getByRole('button', { name: '设为管理员' }))
    expect(setMemberRole).toHaveBeenCalledWith('bob-id', 'admin')
    fireEvent.click(screen.getByRole('button', { name: '关闭分支' }))
    expect(closeThread).toHaveBeenCalledOnce()

    rendered.rerender(entry({ ...room, thread: undefined }, overrides))
    expect(screen.queryByTestId('chatroom-thread-panel')).toBeNull()
    expect(screen.queryByTitle('分支回复：主题消息')).toBeNull()
    rendered.rerender(entry(room, overrides))
    expect(screen.getByTestId('chatroom-thread-panel').getAttribute('data-open')).toBe('true')
    expect(screen.getByTitle('分支回复：主题消息')).not.toBe(frame)

    const nextThread = {
      id: 'thread-2', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread-2', createdAt: 2,
      root: { messageId: 'assistant:2', displayName: 'DeepSeek', text: '一条较长的 AI 回复', role: 'ai' as const },
    }
    rendered.rerender(entry({ ...room, thread: undefined }, overrides))
    rendered.rerender(entry({ ...room, thread: nextThread }, overrides))
    const nextFrame = screen.getByTitle('分支回复：一条较长的 AI 回复') as HTMLIFrameElement
    expect(nextFrame).not.toBe(frame)
    const nextFrameUrl = new URL(nextFrame.src)
    expect(nextFrameUrl.searchParams.get('dsh-chatroom-thread')).toBe('thread-2')
    expect(nextFrameUrl.searchParams.get('dsh-chatroom-thread-session')).toBe('chatroom-thread-v1-thread-2')
  })

  it('lets every room member change the automatic-reply policy', () => {
    const setRoomAutoTrigger = vi.fn(async () => true)
    renderEntry(view({
      membersOpen: true,
      members: [{
        participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale', role: 'member',
        joinedAt: 1, lastSeenAt: Date.now(), online: true,
      }],
    }), { setRoomAutoTrigger })

    expect(screen.getByText('无需 @AI 自动回复')).toBeTruthy()
    const autoReply = screen.getByRole('checkbox', { name: '无需 @AI 自动回复' }) as HTMLInputElement
    expect(autoReply.disabled).toBe(false)
    fireEvent.click(autoReply)
    expect(setRoomAutoTrigger).toHaveBeenCalledWith(true)
  })

  it('does not mount a second chatroom shell inside the native branch frame', () => {
    renderEntry(view({
      branchFrame: {
        threadId: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread',
        parentSessionId: 'chatroom-v1-lobby',
      },
    }))
    expect(document.body.firstElementChild?.firstChild).toBeNull()
  })

  it('uses a compact title and falls back when the gateway refuses the embedded document', () => {
    const sendThreadMessage = vi.fn(async () => true)
    const rootText = `查询成功。\n\n**原始输入**：你能查到现在北京有多少实例吗？\n\n\`\`\`sql\nSELECT COUNT(*) FROM instance\n\`\`\`\n\n这里还有一段很长的说明，用于确认抽屉标题不会铺满整个页面。`
    renderEntry(view({
      thread: {
        id: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread', createdAt: 1,
        root: { messageId: 'assistant:1', displayName: 'DeepSeek', text: rootText, role: 'ai' },
      },
      threadMessages: [{
        id: 'thread-message', threadId: 'thread', sequence: 1, participantId: 'bob-id',
        displayName: 'Bob', role: 'human', text: '兼容模式消息', createdAt: 2,
      }, {
        id: 'thread-message-2', threadId: 'thread', sequence: 2, participantId: 'bob-id',
        displayName: 'Bob', role: 'human', text: 'https://example.com/thread', createdAt: 3,
      }],
    }), { sendThreadMessage })

    const frame = screen.getByTitle(/^分支回复：查询成功。/) as HTMLIFrameElement
    expect(frame.title).not.toContain('\n')
    expect(frame.title).not.toContain('SELECT COUNT')
    expect([...frame.title].length).toBeLessThan(60)
    Object.defineProperty(frame, 'contentDocument', { configurable: true, value: null })
    fireEvent.load(frame)

    expect(screen.getByText('分支无法在当前页面完整显示，请在新标签中打开。')).toBeTruthy()
    expect(sessionStorage.getItem('dsh-chatroom:branch-frame-compatibility')).toBe('1')
    expect(screen.getByText('兼容模式消息')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'https://example.com/thread' })).toBeTruthy()
    const groupedThreadMessages = [...document.querySelectorAll<HTMLElement>('.dsh-chatroom-thread-message')]
    expect(groupedThreadMessages.map(message => message.dataset.dshChatroomGroupPosition)).toEqual(['start', 'end'])
    expect(groupedThreadMessages[1]?.querySelector('.dsh-chatroom-message-actions time')).toBeTruthy()
    const fullAgent = screen.getByRole('link', { name: '在新标签打开分支' }) as HTMLAnchorElement
    expect(new URL(fullAgent.href).searchParams.get('dsh-chatroom-thread')).toBe('thread')
    fireEvent.change(screen.getByPlaceholderText('给分支 AI 发消息'), { target: { value: '你好' } })
    fireEvent.click(screen.getByRole('button', { name: '发送' }))
    expect(sendThreadMessage).toHaveBeenCalledWith('你好')
  })

  it('reuses the compatibility view after an origin rejects a branch frame', () => {
    sessionStorage.setItem('dsh-chatroom:branch-frame-compatibility', '1')
    renderEntry(view({
      thread: {
        id: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread', createdAt: 1,
        root: { messageId: 'assistant:1', displayName: 'DeepSeek', text: '后续分支', role: 'ai' },
      },
    }))

    expect(screen.queryByTitle('分支回复：后续分支')).toBeNull()
    expect(screen.getByText('分支无法在当前页面完整显示，请在新标签中打开。')).toBeTruthy()
  })

  it('closes a branch only when the drawer backdrop is pressed', () => {
    const closeThread = vi.fn()
    renderEntry(view({
      thread: {
        id: 'thread', roomId: 'lobby', sessionId: 'chatroom-thread-v1-thread', createdAt: 1,
        root: { messageId: 'user:1', displayName: 'Bob', text: '主题消息', role: 'human' },
      },
    }), { closeThread })

    fireEvent.pointerDown(screen.getByTestId('chatroom-thread-panel'))
    expect(closeThread).not.toHaveBeenCalled()
    fireEvent.pointerDown(screen.getByTestId('chatroom-thread-layer'))
    expect(closeThread).toHaveBeenCalledOnce()
  })

  it('searches all visible content in a modal and opens the selected message', async () => {
    const closeSearch = vi.fn()
    const searchAll = vi.fn(async () => undefined)
    const openSearchResult = vi.fn(async () => undefined)
    const result = {
      id: 'message:lobby:user:7', kind: 'message' as const, title: 'Bob', subtitle: '群聊 · AI 聊天室',
      preview: '部署已经完成', conversationKind: 'room' as const, conversationId: 'lobby',
      sessionId: 'chatroom-v1-lobby', messageId: 'user:7', createdAt: Date.now(),
    }
    renderEntry(view({ searchOpen: true, searchQuery: '部署', searchResults: [result] }), {
      closeSearch, searchAll, openSearchResult,
    })

    expect(screen.getByTestId('chatroom-search-dialog')).toBeTruthy()
    expect(screen.getByText('用户、群聊、私聊、分支与全部聊天内容')).toBeTruthy()
    expect(screen.getByText('部署已经完成')).toBeTruthy()
    fireEvent.click(screen.getByRole('option', { name: 'Bob，群聊 · AI 聊天室' }))
    expect(openSearchResult).toHaveBeenCalledWith(result)
    fireEvent.pointerDown(screen.getByTestId('chatroom-search-dialog'))
    expect(closeSearch).toHaveBeenCalledOnce()
    await waitFor(() => { expect(searchAll).toHaveBeenCalledWith('部署') })
  })

  it('opens a target chooser for a merged multi-message forward', () => {
    const openForward = vi.fn()
    const forwardSelected = vi.fn(async () => true)
    const second = { id: 'second', title: '项目二', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-second' }
    const room = view({
      rooms: [view().room!, second],
      selectionRoomId: 'lobby',
      selectedMessages: [
        { messageId: 'user:1', role: 'human', displayName: 'Alice', text: '第一条', createdAt: 1 },
        { messageId: 'assistant:2', role: 'ai', displayName: 'DeepSeek', text: '第二条', createdAt: 2 },
      ],
      forwardOpen: true,
    })
    renderEntry(room, { openForward, forwardSelected })
    expect(screen.getByText('已选择 2 条消息')).toBeTruthy()
    expect(screen.getByTestId('chatroom-forward-dialog')).toBeTruthy()
    fireEvent.click(screen.getByText('项目二'))
    expect(forwardSelected).toHaveBeenCalledWith('second')
  })

  it('keeps multi-select mode visible with zero selected messages', () => {
    renderEntry(view({ selectionRoomId: 'lobby', selectedMessages: [] }))
    expect(screen.getByText('已选择 0 条消息')).toBeTruthy()
    expect((screen.getByRole('button', { name: '合并转发' }) as HTMLButtonElement).disabled).toBe(true)
  })
})

function view(patch: Partial<ChatroomView> = {}): ChatroomView {
  const room = { id: 'lobby', title: 'AI 聊天室', aiDisplayName: 'DeepSeek', sessionId: 'chatroom-v1-lobby' }
  return {
    open: false,
    phase: 'ready',
    connection: 'connecting',
    rooms: [room],
    room,
    roomEnsureSessionId: undefined,
    identity: { participantId: 'alice-id', displayName: 'Alice', avatarId: 'whale' },
    auth: {
      enabled: false,
      authenticated: true,
      providers: [],
      allowSelfRegistration: true,
      bootstrapRequired: false,
    },
    online: 1,
    members: [],
    memberCandidates: [],
    reactions: [],
    recalls: [],
    threadPreviews: [],
    pendingMessages: [],
    membersOpen: false,
    error: undefined,
    composerRoomId: undefined,
    pendingFiles: [],
    reply: undefined,
    composerBusy: false,
    composerError: undefined,
    sessionControlBusy: false,
    sessionControlError: undefined,
    wecomBusy: false,
    wecomError: undefined,
    thread: undefined,
    threadMessages: [],
    threadReply: undefined,
    threadBusy: false,
    threadError: undefined,
    unreadCount: 0,
    toasts: [],
    notificationsEnabled: false,
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
    automationBusy: false,
    automationOverview: undefined,
    automationError: undefined,
    directOpen: false,
    directBusy: false,
    directPeers: [],
    directConversations: [],
    directConversation: undefined,
    directMessages: [],
    directError: undefined,
    newSessionModes: {},
    searchOpen: false,
    searchQuery: '',
    searchBusy: false,
    searchResults: [],
    searchError: undefined,
    ...patch,
  }
}

function renderEntry(
  room: ChatroomView,
  overrides: Partial<Parameters<typeof ChatroomEntry>[0]> = {},
): ReturnType<typeof render> {
  return render(entry(room, overrides))
}

function renderSettings(
  room: ChatroomView,
  overrides: Record<string, unknown> = {},
): ReturnType<typeof render> {
  const props = {
    close: vi.fn(),
    useChatroom: (selector: (snapshot: ChatroomView) => unknown) => selector(room),
    closeAccount: vi.fn(),
    changePassword: vi.fn(async () => true),
    openAdmin: vi.fn(async () => undefined),
    closeAdmin: vi.fn(),
    adminCreateUser: vi.fn(async () => true),
    adminUpdateUser: vi.fn(async () => true),
    adminSetSelfRegistration: vi.fn(async () => true),
    adminSetAutoRedirectProvider: vi.fn(async () => true),
    adminSaveProvider: vi.fn(async () => true),
    adminDeleteProvider: vi.fn(async () => true),
    openDirect: vi.fn(async () => undefined),
    closeDirect: vi.fn(),
    sendDirect: vi.fn(async () => true),
    ...overrides,
  } as unknown as Parameters<typeof ChatroomSettingsSection>[0]
  return render(<ChatroomSettingsSection {...props} />)
}

function entry(
  room: ChatroomView,
  overrides: Partial<Parameters<typeof ChatroomEntry>[0]> = {},
): JSX.Element {
  return <ChatroomEntry
    useSessions={vi.fn() as never}
    useWorkspaces={vi.fn() as never}
    useChatroom={selector => selector(room)}
    openRoom={vi.fn()}
    closeRoom={vi.fn()}
    join={vi.fn(async () => undefined)}
    selectRoom={vi.fn(async () => undefined)}
    createRoom={vi.fn(async () => undefined)}
    resetIdentity={vi.fn(async () => undefined)}
    retry={vi.fn(async () => undefined)}
    closeMembers={vi.fn()}
    closeThread={vi.fn()}
    setThreadReply={vi.fn()}
    clearThreadReply={vi.fn()}
    sendThreadMessage={vi.fn(async () => true)}
    enableSystemNotifications={vi.fn(async () => undefined)}
    dismissToast={vi.fn()}
    toggleReaction={vi.fn(async () => undefined)}
    recallMessage={vi.fn(async () => true)}
    openForward={vi.fn()}
    closeForward={vi.fn()}
    forwardSelected={vi.fn(async () => true)}
    toggleMessageSelection={vi.fn()}
    clearMessageSelection={vi.fn()}
    login={vi.fn(async () => true)}
    register={vi.fn(async () => true)}
    logout={vi.fn(async () => undefined)}
    openAccount={vi.fn()}
    closeAccount={vi.fn()}
    changePassword={vi.fn(async () => true)}
    openAdmin={vi.fn(async () => undefined)}
    closeAdmin={vi.fn()}
    adminCreateUser={vi.fn(async () => true)}
    adminUpdateUser={vi.fn(async () => true)}
    adminSetSelfRegistration={vi.fn(async () => true)}
    adminSetAutoRedirectProvider={vi.fn(async () => true)}
    adminSaveProvider={vi.fn(async () => true)}
    adminDeleteProvider={vi.fn(async () => true)}
    openDirect={vi.fn(async () => undefined)}
    closeDirect={vi.fn()}
    sendDirect={vi.fn(async () => true)}
    toggleDirectReaction={vi.fn(async () => undefined)}
    closeSearch={vi.fn()}
    searchAll={vi.fn(async () => undefined)}
    openSearchResult={vi.fn(async () => undefined)}
    {...overrides}
  />
}
