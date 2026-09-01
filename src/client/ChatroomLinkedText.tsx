import { useEffect, useState, type ReactNode } from 'react'
import type { ChatroomDocumentCard } from '../types.js'
import { CHATROOM_API_PREFIX } from '../routes.js'
import { parseWecomDocumentUrl } from '../wecom-document.js'
import { ChatroomExternalCardView } from './ChatroomExternalCard.js'

const HTTP_LINK = /https?:\/\/[^\s<>"']+/giu
const TRAILING_PUNCTUATION = /[.,!?;:，。！？；：、)\]}】》〉」』]+$/u

/** One HTTP URL and its location in visible message text. */
export interface ChatroomTextLink {
  readonly url: string
  readonly start: number
  readonly end: number
}

/** Find safe HTTP links while leaving trailing sentence punctuation outside anchors. */
export function chatroomTextLinks(text: string): readonly ChatroomTextLink[] {
  return [...text.matchAll(HTTP_LINK)].flatMap(match => {
    const raw = match[0]
    const url = raw.replace(TRAILING_PUNCTUATION, '')
    if (url === '') return []
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return []
    } catch {
      return []
    }
    const start = match.index
    return [{ url, start, end: start + url.length }]
  })
}

/** Render participant text with real anchors while preserving whitespace. */
export function ChatroomLinkedText({ text, className }: {
  readonly text: string
  readonly className?: string
}): JSX.Element {
  const links = chatroomTextLinks(text)
  const content: ReactNode[] = []
  let cursor = 0
  for (const link of links) {
    if (link.start > cursor) content.push(text.slice(cursor, link.start))
    content.push(<a href={link.url} target="_blank" rel="noreferrer" key={`${link.start}:${link.url}`}>{link.url}</a>)
    cursor = link.end
  }
  if (cursor < text.length) content.push(text.slice(cursor))
  return <span className={className}>{content.length === 0 ? text : content}</span>
}

/** Render cards for every Tencent Docs link not already represented by a durable card. */
export function ChatroomDocumentLinkCards({ text, existingUrls = [] }: {
  readonly text: string
  readonly existingUrls?: readonly string[]
}): JSX.Element | null {
  const urls = [...new Set(chatroomTextLinks(text)
    .map(link => parseWecomDocumentUrl(link.url)?.url)
    .filter((url): url is string => url !== undefined && !existingUrls.includes(url)))]
  if (urls.length === 0) return null
  return <>{urls.map(url => <ResolvedDocumentCard url={url} key={url} />)}</>
}

function ResolvedDocumentCard({ url }: { readonly url: string }): JSX.Element | null {
  const [card, setCard] = useState<ChatroomDocumentCard>()
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timer = globalThis.setTimeout(() => { controller.abort() }, 5_000)
    void Promise.resolve().then(async () => await fetch(`${CHATROOM_API_PREFIX}/documents/resolve?url=${encodeURIComponent(url)}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })).then(async response => {
      if (response === undefined || !response.ok) return
      const value = await response.json() as unknown
      if (active && isDocumentCard(value)) setCard(value)
    }).catch(() => {
      // The URL remains usable when metadata lookup is unavailable.
    }).finally(() => {
      globalThis.clearTimeout(timer)
    })
    return () => {
      active = false
      globalThis.clearTimeout(timer)
      controller.abort()
    }
  }, [url])
  return card === undefined ? null : <ChatroomExternalCardView card={card} />
}

function isDocumentCard(value: unknown): value is ChatroomDocumentCard {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const card = value as Record<string, unknown>
  return card.kind === 'document'
    && typeof card.title === 'string'
    && typeof card.url === 'string'
    && parseWecomDocumentUrl(card.url) !== undefined
}
