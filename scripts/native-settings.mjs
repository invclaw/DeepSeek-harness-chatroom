import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
const require = createRequire(import.meta.url)

/** Pin the complete upstream factory: retain native schema, revisions, forms and lifecycle. */
export function embeddedNativeSettings() {
  const source = readFileSync(require.resolve('@deepseek-ai/dsh-client-ui-settings/client'), 'utf8')
  if (createHash('sha256').update(source).digest('hex') !== '2ac7f186165c5a8ec2cd90045cf74693e5d3518ec90cd429951360d79754aa94') throw new Error('Native settings changed; review the capability adapter before upgrading')
  return source.replace('window.__ModuleLoader__.load(', 'const nativeSettings = ((registration) => registration.factory(require))(')
    .replace('const inject = ["remote", "remote.settings"];', 'const inject = ["remote", "remote.settings", "chatroomClientCapabilities"];')
    .replace('ctx.remote.$host.isLoopback ? "host" : "memory"', 'ctx.chatroomClientCapabilities.canManage ? "host" : "memory"')
    .replace(/\/\/# sourceMappingURL=.*$/mu, '').replace(/^[ \t]+$/gmu, '')
}
