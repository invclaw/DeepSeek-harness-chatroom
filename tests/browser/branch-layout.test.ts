import { afterEach, describe, expect, it } from 'vitest'
import { page } from '@vitest/browser/context'
import { CHATROOM_STYLES } from '../../src/client/styles.js'

afterEach(() => {
  document.documentElement.removeAttribute('data-dsh-chatroom-active')
  document.documentElement.style.colorScheme = ''
  document.head.replaceChildren()
  document.body.replaceChildren()
})

describe('branch surfaces in a real browser', () => {
  it('keeps dark category labels and file cards readable and attachments inside narrow message columns', () => {
    document.documentElement.style.colorScheme = 'dark'
    const style = document.createElement('style')
    style.textContent = CHATROOM_STYLES
    document.head.append(style)
    document.body.innerHTML = `<div data-dsh-chatroom-category-header><button><strong>群聊</strong></button></div>
      <div style="width:180px"><a class="dsh-chatroom-file-card"><span>↧</span><span class="dsh-chatroom-file-copy"><strong>Long branch attachment filename.txt</strong><small>11 B</small></span></a></div>`
    const category = requiredElement<HTMLElement>('[data-dsh-chatroom-category-header] strong')
    const file = requiredElement<HTMLElement>('.dsh-chatroom-file-card')
    expect(getComputedStyle(category).color).toBe('rgb(249, 250, 251)')
    expect(getComputedStyle(file).backgroundColor).toBe('rgb(21, 21, 23)')
    expect(getComputedStyle(file).color).toBe('rgb(249, 250, 251)')
    expect(file.getBoundingClientRect().width).toBeLessThanOrEqual(180)
    expect(file.getBoundingClientRect().left).toBeGreaterThanOrEqual(file.parentElement!.getBoundingClientRect().left)
  })
  it('aligns peer content to its avatar and exposes a single action row on the RC.2 native renderer', () => {
    const style = document.createElement('style')
    style.textContent = `${CHATROOM_STYLES}
      .native-user { display: flex; flex-direction: column; align-items: flex-end; }
      .native-stack { display: flex; flex-direction: column; align-items: flex-end; }
      .native-bubble { padding: 10px 16px; }
    `
    document.head.append(style)
    document.body.innerHTML = `<div style="width: 600px" class="dsh-chatroom-participant-message" data-dsh-chatroom-own="false" data-dsh-chatroom-actions-visible="true">
      <span class="dsh-chatroom-avatar">A</span>
      <div class="dsh-chatroom-message-column"><div class="dsh-chatroom-display-name">Alice</div>
        <div class="dsh-chatroom-native-message"><div class="native-user"><div class="native-stack"><div class="native-bubble">Branch context</div></div><div data-clock="start"><time>10:00</time><button>Native copy</button></div></div></div>
        <div class="dsh-chatroom-message-actions"><button>Reply</button><time>10:00</time></div>
      </div></div>`
    const column = requiredElement<HTMLElement>('.dsh-chatroom-message-column').getBoundingClientRect()
    const bubble = requiredElement<HTMLElement>('.native-bubble').getBoundingClientRect()
    expect(bubble.left).toBe(column.left)
    expect(getComputedStyle(requiredElement('[data-clock]')).display).toBe('none')
    expect(requiredElement<HTMLElement>('.dsh-chatroom-message-actions').getBoundingClientRect().height).toBeGreaterThan(0)
  })
  it.each([
    {
      scheme: 'dark',
      panelBackground: 'rgb(21, 21, 23)',
      panelText: 'rgb(249, 250, 251)',
      secondaryText: 'rgb(174, 176, 180)',
    },
    {
      scheme: 'light',
      panelBackground: 'rgb(255, 255, 255)',
      panelText: 'rgb(17, 24, 39)',
      secondaryText: 'rgb(107, 114, 128)',
    },
  ])('resolves $scheme fallbacks without host theme variables', ({
    scheme,
    panelBackground,
    panelText,
    secondaryText,
  }) => {
    mountFixture(scheme)

    const panel = requiredElement<HTMLElement>('.dsh-chatroom-thread-panel')
    const header = requiredElement<HTMLElement>('.dsh-chatroom-thread-panel > header')
    const frame = requiredElement<HTMLElement>('.dsh-chatroom-thread-native')
    const status = requiredElement<HTMLElement>('.dsh-chatroom-thread-status')
    const error = requiredElement<HTMLElement>('.dsh-chatroom-thread-error')
    const activity = requiredElement<HTMLElement>('.dsh-chatroom-thread-activity')

    expect(getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')).toBe('')
    expect(getComputedStyle(panel).backgroundColor).toBe(panelBackground)
    expect(getComputedStyle(panel).color).toBe(panelText)
    expect(getComputedStyle(header).backgroundColor).toBe(panelBackground)
    expect(getComputedStyle(frame).backgroundColor).toBe(panelBackground)
    expect(getComputedStyle(status).backgroundColor).toBe(panelBackground)
    expect(getComputedStyle(status).color).toBe(secondaryText)
    expect(getComputedStyle(error).color).toBe(secondaryText)
    expect(getComputedStyle(activity).color).toBe(secondaryText)
    expect(getComputedStyle(activity).backgroundColor).not.toBe('rgb(255, 255, 255)')
  })

  it('expands the real actions row and keeps AI branch activity above the composer', () => {
    mountFixture('dark')

    const actions = requiredElement<HTMLElement>('[data-dsh-chatroom-native-actions]')
    const tools = requiredElement<HTMLElement>('.dsh-chatroom-assistant-tools')
    const activity = requiredElement<HTMLElement>('.dsh-chatroom-thread-activity')
    const composer = requiredElement<HTMLElement>('.host-composer')
    const actionsBox = actions.getBoundingClientRect()
    const toolsBox = tools.getBoundingClientRect()
    const activityBox = activity.getBoundingClientRect()
    const composerBox = composer.getBoundingClientRect()

    expect(actionsBox.height).toBeGreaterThanOrEqual(toolsBox.height)
    expect(actionsBox.height).toBeGreaterThan(28)
    expect(activityBox.bottom).toBeLessThanOrEqual(composerBox.top)
  })

  it('reproduces the old overlap when the actions-row contract is removed', () => {
    mountFixture('dark', false)

    const actions = requiredElement<HTMLElement>('.host-actions')
    const activity = requiredElement<HTMLElement>('.dsh-chatroom-thread-activity')
    const composer = requiredElement<HTMLElement>('.host-composer')

    expect(actions.getBoundingClientRect().height).toBe(28)
    expect(activity.getBoundingClientRect().bottom).toBeGreaterThan(
      composer.getBoundingClientRect().top,
    )
  })

  it('keeps the branch panel inside a narrow viewport', async () => {
    await page.viewport(600, 720)
    try {
      mountFixture('dark')
      const panelBox = requiredElement<HTMLElement>('.dsh-chatroom-thread-panel').getBoundingClientRect()

      expect(panelBox.x).toBe(0)
      expect(panelBox.width).toBe(600)
      expect(panelBox.right).toBe(600)
    } finally {
      await page.viewport(1280, 720)
    }
  })

  it('shows compact branches with a clear tree hierarchy and one-line titles', () => {
    mountSidebarFixture()

    const parent = requiredElement<HTMLElement>('[data-dsh-chatroom-has-branches]')
    const branch = requiredElement<HTMLElement>('[data-dsh-chatroom-branch-row]')

    expect(branch.getBoundingClientRect().left).toBeGreaterThan(parent.getBoundingClientRect().left + 24)
    expect(branch.getBoundingClientRect().height).toBeLessThanOrEqual(36)
    const topic = requiredElement<HTMLElement>('[data-dsh-chatroom-branch-topic]')
    expect(getComputedStyle(topic).textOverflow).toBe('ellipsis')
    expect(topic.getBoundingClientRect().height).toBeLessThanOrEqual(20)
    expect(branch.getBoundingClientRect().right).toBeLessThanOrEqual(parent.getBoundingClientRect().right)
    expect(getComputedStyle(branch).borderTopWidth).toBe('0px')
    expect(getComputedStyle(parent).boxShadow).toBe('none')
  })

  it('collapses the empty native status slot between avatar and title', () => {
    const style = document.createElement('style')
    style.textContent = `${CHATROOM_STYLES}
      [role="treeitem"] { display: flex; align-items: center; }
      .host-slot { flex: none; width: 16px; height: 20px; }
      .host-title { margin: 0 6px 0 4px; }
    `
    document.head.append(style)
    document.body.innerHTML = `
      <div role="tree">
        <div role="treeitem" data-dsh-chatroom-room-row aria-selected="true">
          <span data-dsh-chatroom-group-avatar></span><span class="host-slot"></span><span class="host-title">项目群</span>
        </div>
        <div role="treeitem" data-dsh-chatroom-sidebar-category="solo" aria-selected="false">
          <span data-dsh-chatroom-solo-avatar></span><span class="host-slot"></span><span class="host-title">个人工作</span>
        </div>
        <div role="treeitem" data-dsh-chatroom-room-row aria-selected="false">
          <span data-dsh-chatroom-group-avatar></span><span class="host-slot">●</span><span class="host-title">活跃群</span>
        </div>
      </div>
    `
    const rows = [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')]

    expect(getComputedStyle(rows[0]!.querySelector('.host-slot')!).display).toBe('none')
    expect(getComputedStyle(rows[0]!.querySelector('.host-title')!).marginLeft).toBe('0px')
    expect(getComputedStyle(rows[1]!.querySelector('.host-slot')!).display).toBe('none')
    expect(getComputedStyle(rows[1]!.querySelector('.host-title')!).marginLeft).toBe('0px')
    // A slot that actually carries status dots keeps its place in the row.
    expect(getComputedStyle(rows[2]!.querySelector('.host-slot')!).display).not.toBe('none')
    expect(getComputedStyle(rows[2]!.querySelector('.host-title')!).marginLeft).toBe('4px')
  })

  it('replaces the chatroom settings fallback gear with its group glyph', () => {
    const style = document.createElement('style')
    style.textContent = CHATROOM_STYLES
    document.head.append(style)
    document.body.innerHTML = `
      <div role="dialog">
        <nav>
          <button type="button" data-dsh-chatroom-settings-nav>
            <svg data-fallback="gear"></svg><span>群聊与账号</span>
          </button>
        </nav>
      </div>
    `

    const button = requiredElement<HTMLButtonElement>('[data-dsh-chatroom-settings-nav]')
    const fallback = requiredElement<SVGElement>('[data-fallback="gear"]')
    expect(getComputedStyle(fallback).display).toBe('none')
    expect(getComputedStyle(button, '::before').maskImage).toContain('data:image/svg+xml')
  })

  it('shows one stable chatroom queue rail and suppresses the native duplicate', () => {
    document.documentElement.dataset.dshChatroomActive = ''
    const style = document.createElement('style')
    style.textContent = `${CHATROOM_STYLES}
      body { margin: 0; width: 760px; }
      .host-dock { width: 720px; }
    `
    document.head.append(style)
    document.body.innerHTML = `
      <div class="host-dock">
        <div class="dsh-chatroom-composer-dock" data-dsh-chatroom-queue-dock="true">
          <div class="dsh-chatroom-queued-prompts" aria-label="排队消息">
            <div class="dsh-chatroom-queued-prompt">
              <div class="dsh-chatroom-queued-prompt-status"><span class="dsh-chatroom-queue-dot"></span><span>正在排队 · 等待当前回复完成</span></div>
              <div class="dsh-chatroom-queued-prompt-content">请在当前回复完成后总结</div>
              <div class="dsh-chatroom-queued-prompt-actions"><button>引导对话</button><button>编辑</button><button>删除</button></div>
            </div>
          </div>
        </div>
        <div data-queue-dock>native duplicate</div>
      </div>
    `
    const custom = requiredElement<HTMLElement>('.dsh-chatroom-queued-prompt')
    const native = requiredElement<HTMLElement>('[data-queue-dock]')
    const actions = requiredElement<HTMLElement>('.dsh-chatroom-queued-prompt-actions')

    expect(getComputedStyle(native).display).toBe('none')
    expect(getComputedStyle(custom).display).toBe('grid')
    expect(actions.getBoundingClientRect().right).toBeLessThanOrEqual(custom.getBoundingClientRect().right)
    expect(custom.getBoundingClientRect().height).toBeLessThan(80)
  })
})

function mountFixture(scheme: string, markNativeActions = true): void {
  document.documentElement.dataset.dshChatroomActive = ''
  document.documentElement.style.colorScheme = scheme
  const style = document.createElement('style')
  style.textContent = `${CHATROOM_STYLES}
    body { margin: 0; }
    .host-flow { width: 754px; }
    .host-actions { display: flex; align-items: center; height: 28px; overflow: visible; }
    .host-slot { display: contents; }
    .host-composer { box-sizing: border-box; height: 94px; margin-top: 16px; }
  `
  document.head.append(style)
  document.body.innerHTML = `
    <main class="host-flow">
      <div data-time-hover-root>
        <div class="host-actions"${markNativeActions ? ' data-dsh-chatroom-native-actions' : ''}>
          <div class="host-slot">
            <div class="dsh-chatroom-assistant-tools">
              <div class="dsh-chatroom-assistant-actions">↩ 回复　👍 点赞　⑂ 分支</div>
              <button class="dsh-chatroom-thread-activity" type="button">
                <span class="dsh-chatroom-thread-activity-heading">⑂ 分支 · 3 条回复</span>
                <span class="dsh-chatroom-thread-activity-list">
                  <span><i class="dsh-chatroom-member-avatar">A</i><strong>Alice</strong><span>第一条回复</span></span>
                  <span><i class="dsh-chatroom-member-avatar">B</i><strong>Bob</strong><span>第二条回复</span></span>
                  <span><i class="dsh-chatroom-member-avatar">C</i><strong>Carol</strong><span>第三条回复</span></span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="host-composer">Message the agent</div>
    </main>
    <aside class="dsh-chatroom-thread-panel">
      <header><div><strong>分支回复</strong><small>主题消息</small></div><button type="button">×</button></header>
      <div class="dsh-chatroom-thread-native"></div>
      <div class="dsh-chatroom-thread-status"><strong>正在加载分支</strong><small>初始化中</small></div>
      <div class="dsh-chatroom-thread-error">无法加载分支</div>
    </aside>
  `
}

function mountSidebarFixture(): void {
  const style = document.createElement('style')
  style.textContent = `${CHATROOM_STYLES}
    [role="tree"] { width: 280px; }
    [role="treeitem"] { display: flex; align-items: center; }
    [data-dsh-chatroom-has-branches] { box-shadow: inset 2px 0 0 rgb(79 124 255); }
  `
  document.head.append(style)
  document.body.innerHTML = `
    <div role="tree">
      <div role="treeitem" data-dsh-chatroom-room-row data-dsh-chatroom-has-branches aria-selected="true">
        <span data-dsh-chatroom-group-avatar></span><span>LightHouse 研发</span>
      </div>
      <div role="treeitem" data-dsh-chatroom-branch-row aria-selected="false">
        <span data-dsh-chatroom-branch-marker>↳</span>
        <span data-dsh-chatroom-branch-surface><span data-dsh-chatroom-branch-heading><span data-dsh-chatroom-branch-topic>关于群聊升级后插件兼容和知识来源的长标题讨论</span></span><span data-dsh-chatroom-branch-reply-count>3</span></span>
      </div>
    </div>
  `
}

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (element === null) throw new Error(`Missing fixture element: ${selector}`)
  return element
}
