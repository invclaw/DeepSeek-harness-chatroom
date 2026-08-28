import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { CHATROOM_STYLES } from '../../src/client/styles.js'

afterEach(() => {
  document.documentElement.removeAttribute('data-dsh-chatroom-active')
  document.documentElement.style.colorScheme = ''
  document.head.replaceChildren()
  document.body.replaceChildren()
})

describe('branch surfaces in a real browser', () => {
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
    const frame = requiredElement<HTMLElement>('.dsh-chatroom-thread-frame')
    const status = requiredElement<HTMLElement>('.dsh-chatroom-thread-frame-status')
    const error = requiredElement<HTMLElement>('.dsh-chatroom-thread-frame-error')
    const compatibility = requiredElement<HTMLElement>('.dsh-chatroom-thread-compatibility-notice')
    const activity = requiredElement<HTMLElement>('.dsh-chatroom-thread-activity')

    expect(getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')).toBe('')
    expect(getComputedStyle(panel).backgroundColor).toBe(panelBackground)
    expect(getComputedStyle(panel).color).toBe(panelText)
    expect(getComputedStyle(header).backgroundColor).toBe(panelBackground)
    expect(getComputedStyle(frame).backgroundColor).toBe(panelBackground)
    expect(getComputedStyle(status).backgroundColor).toBe(panelBackground)
    expect(getComputedStyle(status).color).toBe(secondaryText)
    expect(getComputedStyle(error).color).toBe(secondaryText)
    expect(getComputedStyle(compatibility).color).toBe(secondaryText)
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
      <div class="dsh-chatroom-thread-frame"></div>
      <div class="dsh-chatroom-thread-frame-status"><strong>正在加载分支</strong><small>初始化中</small></div>
      <div class="dsh-chatroom-thread-frame-error">无法加载分支</div>
      <div class="dsh-chatroom-thread-compatibility-notice"><span>兼容模式</span><span><button>重试</button></span></div>
    </aside>
  `
}

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (element === null) throw new Error(`Missing fixture element: ${selector}`)
  return element
}
