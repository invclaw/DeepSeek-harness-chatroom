// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatroomExternalCardView } from '../src/client/ChatroomExternalCard.js'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Enterprise WeChat cards', () => {
  it('shows the ended state while its AI summary is still being generated', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({
      id: 'public-id',
      conversationKind: 'room',
      conversationId: 'lobby',
      title: '快速会议',
      status: 'end',
      summaryStatus: 'pending',
      updatedAt: 1,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetch)

    render(<ChatroomExternalCardView card={{
      kind: 'meeting',
      id: 'public-id',
      title: '快速会议',
      status: 'init',
      url: 'https://meeting.example.com/current',
    }} />)

    await waitFor(() => expect(screen.getByText('已结束')).toBeTruthy())
    expect(screen.getByText('AI 会议总结生成中…')).toBeTruthy()
    expect(screen.getByRole('link', { name: '查看会议' })).toBeTruthy()
  })

  it('resolves lifecycle state for a legacy meeting card by its URL', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({
      id: 'legacy-public-id',
      conversationKind: 'room',
      conversationId: 'lobby',
      title: '旧版快速会议',
      status: 'end',
      summaryStatus: 'completed',
      beginTime: '2026-08-31 16:00:00',
      endTime: '2026-08-31 17:00:00',
      updatedAt: 1,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetch)

    render(<ChatroomExternalCardView card={{
      kind: 'meeting',
      title: '旧版快速会议',
      url: 'https://meeting.example.com/legacy',
    }} />)

    await waitFor(() => expect(screen.getByText('已结束')).toBeTruthy())
    expect(fetch).toHaveBeenCalledWith(
      '/plugins/deepseek-harness-chatroom/api/meetings/resolve?url=https%3A%2F%2Fmeeting.example.com%2Flegacy',
      expect.objectContaining({ credentials: 'same-origin' }),
    )
    expect(screen.getByRole('link', { name: '查看会议' })).toBeTruthy()
  })
})
