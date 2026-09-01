import { useEffect, useState } from 'react'
import { CHATROOM_API_PREFIX } from '../routes.js'
import type { ChatroomExternalCard, ChatroomMeetingSummary } from '../types.js'

/** Native card presentation for Enterprise WeChat meetings and documents. */
export function ChatroomExternalCardView({ card }: { card: ChatroomExternalCard }): JSX.Element {
  if (card.kind === 'meeting') return <MeetingCard card={card} />
  return (
    <article className="dsh-chatroom-external-card dsh-chatroom-document-card">
      <div className="dsh-chatroom-external-icon" aria-hidden>📄</div>
      <div className="dsh-chatroom-external-copy">
        <small>{documentProviderLabel(card.url)} · {documentTypeLabel(card.documentType)}</small>
        <strong>{card.title}</strong>
        {card.owner !== undefined && <span>创建者 · {card.owner}</span>}
        {card.modifiedAt !== undefined && <span>更新于 {card.modifiedAt}</span>}
      </div>
      {card.url !== undefined && <a href={card.url} target="_blank" rel="noreferrer">打开文档</a>}
    </article>
  )
}

function documentProviderLabel(value: string | undefined): string {
  if (value === undefined) return '企业微信'
  try {
    return new URL(value).hostname.toLocaleLowerCase() === 'docs.qq.com' ? '腾讯文档' : '企业微信'
  } catch {
    return '企业微信'
  }
}

function MeetingCard({ card }: { card: Extract<ChatroomExternalCard, { kind: 'meeting' }> }): JSX.Element {
  const [meeting, setMeeting] = useState<ChatroomMeetingSummary | undefined>()
  useEffect(() => {
    setMeeting(undefined)
    const endpoint = card.id !== undefined
      ? `${CHATROOM_API_PREFIX}/meetings/${encodeURIComponent(card.id)}`
      : card.url !== undefined
        ? `${CHATROOM_API_PREFIX}/meetings/resolve?url=${encodeURIComponent(card.url)}`
        : undefined
    if (endpoint === undefined) return
    let active = true
    let timer: number | undefined
    const refresh = async (): Promise<void> => {
      let complete = false
      try {
        const response = await fetch(endpoint, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) return
        const current = await response.json() as ChatroomMeetingSummary
        if (active) setMeeting(current)
        complete = current.status === 'end' && current.summaryStatus === 'completed'
      } catch {
        // A transient status refresh failure does not make the durable meeting card unusable.
      } finally {
        if (active && !complete) timer = window.setTimeout(() => { void refresh() }, 30_000)
      }
    }
    void refresh()
    return () => {
      active = false
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [card.id, card.url])
  const status = meeting?.status ?? card.status
  const summaryStatus = meeting?.summaryStatus
  return (
    <article className="dsh-chatroom-external-card dsh-chatroom-meeting-card">
      <div className="dsh-chatroom-external-icon" aria-hidden>🎥</div>
      <div className="dsh-chatroom-external-copy">
        <small>企业微信会议 {status !== undefined && <em>{meetingStatusLabel(status)}</em>}</small>
        <strong>{meeting?.title ?? card.title}</strong>
        {(meeting?.beginTime !== undefined || meeting?.endTime !== undefined || card.beginTime !== undefined || card.endTime !== undefined) && (
          <span>{[meeting?.beginTime ?? card.beginTime, meeting?.endTime ?? card.endTime].filter(Boolean).join(' — ')}</span>
        )}
        {card.location !== undefined && <span>地点 · {card.location}</span>}
        {card.attendees !== undefined && card.attendees.length > 0 && <span>参与人 · {card.attendees.join('、')}</span>}
        {status === 'end' && summaryStatus === 'pending' && <span>AI 会议总结生成中…</span>}
        {status === 'end' && summaryStatus === 'failed' && <span>AI 会议总结将在稍后重试</span>}
      </div>
      {card.url !== undefined && <a href={card.url} target="_blank" rel="noreferrer">{status === 'end' ? '查看会议' : '加入会议'}</a>}
    </article>
  )
}

function meetingStatusLabel(value: string): string {
  if (value === 'started') return '进行中'
  if (value === 'end') return '已结束'
  if (value === 'init') return '未开始'
  return value
}

function documentTypeLabel(value: string | undefined): string {
  switch (value) {
    case 'sheet': return '在线表格'
    case 'smartsheet': return '智能表格'
    case 'smartpage': return '智能文档'
    case 'doc': return '在线文档'
    default: return value ?? '文档'
  }
}
