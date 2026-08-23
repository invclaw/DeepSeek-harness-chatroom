import { readFile } from 'node:fs/promises'

const bundle = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8')
const nodeSpecifiers = [...bundle.matchAll(/["']node:([^"']+)["']/g)].map(match => match[1])

if (nodeSpecifiers.length > 0) {
  throw new Error(`Browser bundle imports unsupported Node built-ins: ${[...new Set(nodeSpecifiers)].join(', ')}`)
}
