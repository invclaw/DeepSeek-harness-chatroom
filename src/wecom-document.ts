import type { WecomService } from './wecom.js'

const DOCUMENT_HTML_LIMIT_BYTES = 256 * 1024
const DOCUMENT_TITLE_TIMEOUT_MS = 4_000

/** Parsed Enterprise WeChat document URL accepted by the metadata resolver. */
export interface WecomDocumentReference {
  readonly url: string
  readonly service: Extract<WecomService, 'doc' | 'sheet' | 'smartsheet' | 'smartpage'>
  readonly documentType: 'doc' | 'sheet' | 'smartsheet' | 'smartpage'
  readonly source: 'tencent-docs' | 'wecom'
  readonly documentId: string
}

/** Parse a Tencent Docs or Enterprise WeChat document URL without accepting arbitrary remote hosts. */
export function parseWecomDocumentUrl(value: string): WecomDocumentReference | undefined {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return undefined
  }
  if (url.protocol !== 'https:') return undefined
  const hostname = url.hostname.toLocaleLowerCase()
  const source = hostname === 'docs.qq.com'
    ? 'tencent-docs'
    : hostname === 'doc.weixin.qq.com' || hostname === 'page.weixin.qq.com'
      ? 'wecom'
      : undefined
  if (source === undefined) return undefined
  const segments = url.pathname.split('/').filter(Boolean)
  const prefix = segments[0]?.toLocaleLowerCase()
  const documentType = hostname === 'page.weixin.qq.com'
    ? 'smartpage'
    : prefix === 'doc'
    ? 'doc'
    : prefix === 'sheet'
      ? 'sheet'
      : prefix === 'smartsheet'
        ? 'smartsheet'
        : prefix === 'aio'
          ? 'smartpage'
          : undefined
  const documentId = segments[1]
  if (documentType === undefined || documentId === undefined || documentId === '') return undefined
  return { url: url.toString(), service: documentType, documentType, source, documentId }
}

/** Extract a useful document title from trusted HTML metadata. */
export function documentTitleFromHtml(html: string): string | undefined {
  const raw = /<meta\s+[^>]*(?:property|name)=["'](?:og:title|twitter:title)["'][^>]*content=["']([^"']+)["'][^>]*>/iu.exec(html)?.[1]
    ?? /<meta\s+[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:title|twitter:title)["'][^>]*>/iu.exec(html)?.[1]
    ?? /<title[^>]*>([\s\S]*?)<\/title>/iu.exec(html)?.[1]
  if (raw === undefined) return undefined
  return normalizeDocumentTitle(raw)
}

/** Normalize one candidate title and reject provider-only placeholders. */
export function normalizeDocumentTitle(value: string): string | undefined {
  const normalized = decodeHtmlEntities(value).replace(/\s+/gu, ' ').trim()
    .replace(/\s*[-|｜·]\s*腾讯文档(?:\s*[-|｜·]\s*在线文档)?\s*$/u, '')
    .trim()
  if (normalized === '' || /^(?:腾讯文档(?:\s*[-|｜·]\s*在线文档)?|在线文档|文档)$/u.test(normalized)) return undefined
  return [...normalized].slice(0, 160).join('')
}

/** Fetch one allowlisted Tencent Docs page without following redirects or blocking message delivery. */
export async function fetchTencentDocumentTitle(value: string): Promise<string | undefined> {
  const reference = parseWecomDocumentUrl(value)
  if (reference?.source !== 'tencent-docs') return undefined
  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, DOCUMENT_TITLE_TIMEOUT_MS)
  try {
    const response = await fetch(reference.url, {
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'DeepSeek-Harness-Chatroom/1.4',
      },
    })
    if (!response.ok) return undefined
    const contentType = response.headers.get('content-type')?.toLocaleLowerCase() ?? ''
    if (contentType !== '' && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) return undefined
    const html = await responsePrefix(response, DOCUMENT_HTML_LIMIT_BYTES)
    return documentTitleFromHtml(html)
  } catch {
    return undefined
  } finally {
    clearTimeout(timer)
  }
}

async function responsePrefix(response: Response, limit: number): Promise<string> {
  if (response.body === null) return (await response.text()).slice(0, limit)
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let bytes = 0
  let text = ''
  while (bytes < limit) {
    const chunk = await reader.read()
    if (chunk.done) break
    const remaining = limit - bytes
    const value = chunk.value.byteLength <= remaining ? chunk.value : chunk.value.slice(0, remaining)
    bytes += value.byteLength
    text += decoder.decode(value, { stream: bytes < limit })
    if (value.byteLength < chunk.value.byteLength) {
      await reader.cancel()
      break
    }
  }
  text += decoder.decode()
  return text
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/gu, (_, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([\da-f]+);/giu, (_, digits: string) => String.fromCodePoint(Number.parseInt(digits, 16)))
    .replace(/&quot;/giu, '"')
    .replace(/&#39;|&apos;/giu, "'")
    .replace(/&amp;/giu, '&')
    .replace(/&lt;/giu, '<')
    .replace(/&gt;/giu, '>')
}
