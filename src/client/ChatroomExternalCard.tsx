import type { ChatroomExternalCard } from '../types.js'

/** Native card presentation for Enterprise WeChat meetings and documents. */
export function ChatroomExternalCardView({ card }: { card: ChatroomExternalCard }): JSX.Element {
  if (card.kind === 'meeting') {
    return (
      <article className="dsh-chatroom-external-card dsh-chatroom-meeting-card">
        <div className="dsh-chatroom-external-icon" aria-hidden>🎥</div>
        <div className="dsh-chatroom-external-copy">
          <small>企业微信会议</small>
          <strong>{card.title}</strong>
          {(card.beginTime !== undefined || card.endTime !== undefined) && (
            <span>{[card.beginTime, card.endTime].filter(Boolean).join(' — ')}</span>
          )}
          {card.location !== undefined && <span>地点 · {card.location}</span>}
          {card.attendees !== undefined && card.attendees.length > 0 && <span>参与人 · {card.attendees.join('、')}</span>}
        </div>
        {card.url !== undefined && <a href={card.url} target="_blank" rel="noreferrer">加入会议</a>}
      </article>
    )
  }
  return (
    <article className="dsh-chatroom-external-card dsh-chatroom-document-card">
      <div className="dsh-chatroom-external-icon" aria-hidden>📄</div>
      <div className="dsh-chatroom-external-copy">
        <small>企业微信 · {documentTypeLabel(card.documentType)}</small>
        <strong>{card.title}</strong>
        {card.owner !== undefined && <span>创建者 · {card.owner}</span>}
        {card.modifiedAt !== undefined && <span>更新于 {card.modifiedAt}</span>}
      </div>
      {card.url !== undefined && <a href={card.url} target="_blank" rel="noreferrer">打开文档</a>}
    </article>
  )
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
