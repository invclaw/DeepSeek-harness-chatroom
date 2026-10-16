/** Local Markdown images referenced by durable native assistant output. */
import { isAbsolute, resolve } from 'node:path'
import { parser, RuleType } from 'markdown-to-jsx/html'
import type { SessionEvent } from '@deepseek-ai/dsh-session'

export function referencedImagePaths(events: readonly SessionEvent[], cwd: string): string[] {
  const paths = new Set<string>()
  const visit = (value: unknown): void => {
    if (value === null || typeof value !== 'object') return
    if (Array.isArray(value)) { for (const child of value) visit(child); return }
    const node = value as Record<string, unknown>
    if (node.type === RuleType.image && typeof node.target === 'string') {
      try {
        const path = decodeURIComponent(node.target.split(/[?#]/u)[0] ?? '')
        if (path !== '' && !/^[a-z][a-z\d+.-]*:/iu.test(path) && !path.startsWith('//') && !/[\u0000-\u001f\u007f]/u.test(path)) {
          paths.add(isAbsolute(path) ? path : resolve(cwd, path))
        }
      } catch { /* Malformed authored URL is not a file grant. */ }
    }
    for (const child of Object.values(node)) visit(child)
  }
  for (const event of events) {
    if (event.type !== 'assistant/message' || event.surfaceOp !== 'append') continue
    for (const block of event.data.message.content) if (block.type === 'text') visit(parser(block.text))
  }
  return [...paths]
}
