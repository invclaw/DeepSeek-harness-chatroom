/**
 * 定义：把 package.json 的版本设为权威远端 main 已发布版本的下一个 patch。
 * 参数：无。远端固定为 origin/main，避免把分叉的发布历史当作权威。
 * 输出：远端版本与写入的新版本各打一行 INFO；无法调和时非零退出。
 * 安全：只读远端并改写本仓 package.json 的 version 字段；不提交，不推送。
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const manifestPath = fileURLToPath(new URL('../package.json', import.meta.url))

function fail(message) {
  process.stderr.write(`ERROR: ${message}\n`)
  process.exit(1)
}

function git(...args) {
  return execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8' }).trim()
}

const text = readFileSync(manifestPath, 'utf8')
const current = JSON.parse(text).version

// A released version is whatever origin/main carries. Choosing the next one from
// the local file instead lets two branches author the same version, which is how
// 1.3.3 was taken twice.
try {
  git('fetch', '--quiet', 'origin', 'main')
} catch {
  fail('could not fetch origin/main')
}
let released
try {
  released = JSON.parse(git('show', 'FETCH_HEAD:package.json')).version
} catch {
  fail('could not read the released version from origin/main')
}

const parsed = /^(\d+)\.(\d+)\.(\d+)$/.exec(released)
if (parsed === null) fail(`origin/main has a non-release version: ${released}`)
const next = `${parsed[1]}.${parsed[2]}.${String(Number(parsed[3]) + 1)}`

process.stdout.write(`INFO: origin/main released ${released}\n`)
if (current === next) {
  process.stdout.write(`INFO: package.json already targets ${next}; unchanged\n`)
  process.exit(0)
}
if (current !== released) {
  fail(`package.json is ${current}, which is neither the released ${released} nor the next ${next};`
    + ' reconcile it with origin/main before releasing')
}

// Rewrite only the version line so unrelated formatting stays byte-identical.
const updated = text.replace(/^(\s*"version":\s*")[^"]+(",)$/m, `$1${next}$2`)
if (updated === text) fail('could not locate the version field in package.json')
writeFileSync(manifestPath, updated)
process.stdout.write(`INFO: package.json set to ${next}; add a ${next} entry to README.md and README.zh.md\n`)
