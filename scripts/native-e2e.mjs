/** Real DSH authorization smoke. Owns its disposable profile, identities and processes. */
import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdtemp, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'
import { WebSocket } from 'ws'

if (process.argv.includes('--help') || process.argv.length !== 4) {
  console.log('Usage: node scripts/native-e2e.mjs /absolute/path/to/dsh /path/to/chatroom.tgz\nRuns isolated real DSH HTTP and WebSocket multi-account authorization checks. No model calls. Deletes its profile and credentials on exit.')
  process.exit(process.argv.includes('--help') ? 0 : 2)
}
const binary = resolve(process.argv[2])
const tarball = resolve(process.argv[3])
const root = await mkdtemp(join(tmpdir(), 'chatroom-native-e2e-'))
const workspace = join(root, 'workspace')
await mkdir(workspace)
const listener = createServer().listen(0, '127.0.0.1')
await once(listener, 'listening')
const port = listener.address().port
await new Promise(done => listener.close(done))
const origin = `http://127.0.0.1:${port}`
const prefix = '/plugins/deepseek-harness-chatroom/api'
const bootstrapToken = randomBytes(32).toString('hex')
const environment = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('DSH_CHATROOM_') && key !== 'DSH_HOME'))
Object.assign(environment, {
  DSH_HOME: join(root, 'home'), DSH_CHATROOM_CWD: workspace,
  DSH_CHATROOM_AUTH_SECRET: randomBytes(48).toString('hex'),
  DSH_CHATROOM_AUTH_BOOTSTRAP_TOKEN: bootstrapToken,
  // Empty public origin is the plugin's explicit loopback HTTP evaluation mode.
  DSH_CHATROOM_AUTH_PUBLIC_ORIGIN: '', DSH_CHATROOM_WECOM: 'disabled',
})
let child
let diagnostic = ''
const sockets = new Set()
async function run(args) {
  const command = spawn(binary, args, { cwd: workspace, env: environment, stdio: 'ignore' })
  const [code] = await once(command, 'exit')
  assert.equal(code, 0, 'DSH profile package installation failed')
}
async function request(path, user, body, method = body === undefined ? 'GET' : 'POST') {
  return fetch(`${origin}${path}`, {
    method, headers: { origin, 'content-type': 'application/json', ...(user ? { cookie: user.cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(10000),
  })
}
async function api(endpoint, user, body, status = 200) {
  const response = await request(`${prefix}${endpoint}`, user, body)
  assert.equal(response.status, status, `Chatroom ${endpoint} status`)
  if (status === 204) return
  return response.json()
}
async function rpc(method, user, input = {}, status = 200) {
  const args = method.startsWith('directoryPicker/') ? input : method === 'settings/describe' ? {} : method === 'session/list' ? { _request: input } : { request: input }
  const response = await request(`/api/${method}`, user, { type: 'client-request', rpcId: randomUUID(), method, payload: { args } })
  assert.equal(response.status, status, `Native ${method} status`)
  if (status !== 200) return
  const result = await response.json()
  assert.equal(result.result?.ok, true, `Native ${method} business result (${result.result?.error?.code ?? 'unknown'})`)
  return result.result.value
}
async function register(username, first = false) {
  const response = await request(`${prefix}/auth/register`, undefined, {
    username, displayName: username, password: randomBytes(24).toString('base64url'), ...(first ? { bootstrapToken } : {}),
  })
  assert.equal(response.status, 201, 'Account registration')
  const value = await response.json()
  const cookie = response.headers.getSetCookie().map(field => field.split(';')[0]).join('; ')
  assert(cookie, 'Registration omitted session cookie')
  return { cookie, identity: value.identity }
}
async function connect(user) {
  const socket = new WebSocket(`ws://127.0.0.1:${port}/api/remote.mux`, { headers: { origin, cookie: user.cookie } })
  sockets.add(socket)
  socket.once('close', () => sockets.delete(socket))
  await once(socket, 'open', { signal: AbortSignal.timeout(5000) })
  const frames = []
  socket.on('message', data => frames.push(JSON.parse(data.toString())))
  return {
    socket, frames,
    open(streamId, endpoint, input = {}) {
      const args = endpoint === 'session/control' || endpoint === 'workspace/follow' ? {} : { request: input }
      socket.send(JSON.stringify({ type: 'open', streamId, endpoint, payload: { args } }))
    },
    async wait(streamId, type = 'item', contains) {
      for (let i = 0; i < 100; i++) {
        const frame = frames.find(frame => frame.streamId === streamId && frame.type === type && (contains === undefined || JSON.stringify(frame).includes(contains)))
        if (frame) return frame
        await delay(50)
      }
      assert.fail(`Remote ${streamId} did not produce ${type}`)
    },
  }
}
try {
  await run(['plugin', '--profile', 'web', 'add', '--offline', '--config.auto-install-peers=false', tarball])
  child = spawn(binary, ['web', '--no-open', '--port', String(port)], { cwd: workspace, env: environment, stdio: ['ignore', 'pipe', 'pipe'] })
  const capture = chunk => { diagnostic = (diagnostic + chunk.toString()).slice(-24000) }
  child.stdout.on('data', capture)
  child.stderr.on('data', capture)
  let ready = false
  for (let i = 0; i < 150; i++) {
    try { ready = (await request(`${prefix}/health`)).ok } catch {}
    if (ready) break
    assert.equal(child.exitCode, null, 'DSH exited during startup')
    await delay(100)
  }
  assert(ready, 'Chatroom health did not become ready')
  const admin = await register('smoke-admin', true)
  const alice = await register('smoke-alice')
  const bob = await register('smoke-bob')
  const room = (await api('/rooms', alice, { title: 'Alice private group' }, 201)).room
  await api('/prompt', alice, { roomId: room.id, mode: 'queue', content: [{ type: 'text', text: 'private group history' }] })
  const history = await api('/search?q=private%20group%20history', alice)
  const ownMessage = history.results.find(item => item.kind === 'message' && item.conversationId === room.id)
  assert(ownMessage?.messageId, 'Own group message missing from search')
  await api('/messages/recall', alice, { roomId: room.id, messageId: ownMessage.messageId })
  await api('/prompt', alice, { roomId: room.id, mode: 'queue', content: [{ type: 'text', text: 'message after recall' }] })
  const thread = (await api('/threads/open', alice, { roomId: room.id, root: { messageId: 'smoke-root', displayName: 'smoke-alice', text: 'branch context', role: 'human' } })).thread
  const solo = await rpc('session/create', alice)
  await rpc('session/rename', alice, { sessionId: solo.sessionId, title: 'Alice private Solo' })
  const fork = await rpc('session/fork', alice, { sessionId: solo.sessionId, atSeq: 0 })
  await rpc('session/list', undefined, {}, 401)
  for (const sessionId of [room.sessionId, thread.sessionId, solo.sessionId, fork.sessionId]) {
    await rpc('session/page', bob, { address: { kind: 'session', sessionId }, throughSeq: -1 }, 403)
    await rpc('session/rename', bob, { sessionId, title: 'forbidden' }, 403)
    assert.equal((await request(`/api/session.export?sessionId=${encodeURIComponent(sessionId)}`, bob)).status, 403)
    assert.equal((await request(`/api/session/uploadFileBinary?sessionId=${encodeURIComponent(sessionId)}`, bob, {})).status, 403)
    await rpc('session/page', alice, { address: { kind: 'session', sessionId }, throughSeq: -1 })
  }
  await rpc('settings/describe', bob, {}, 403)
  const listing = await rpc('directoryPicker/list', bob)
  assert.equal(listing.path, workspace)
  assert.equal(listing.home, workspace)
  assert(listing.crumbs.every(crumb => crumb.path === workspace || crumb.path.startsWith(workspace + '/')))
  const childPath = await rpc('directoryPicker/createDirectory', bob, { path: workspace, name: 'member-project' })
  const registered = await rpc('workspace/create', bob, { path: childPath })
  const childDraft = await rpc('session/create', bob, { workspaceId: registered.workspace.workspaceId })
  const childList = await rpc('session/list', bob)
  assert(childList.items.some(item => (item.sessionId ?? item.id) === childDraft.sessionId && item.cwd === childPath), 'Added workspace did not create a native draft in its directory')
  for (const user of [admin, bob]) {
    await rpc('directoryPicker/list', user, { path: '/' }, 403)
    await rpc('workspace/create', user, { path: '/' }, 403)
  }
  await rpc('workspace/delete', bob, { workspaceId: registered.workspace.workspaceId }, 403)

  await rpc('session/create', bob, { cwd: '/' }, 403)
  await rpc('settings/describe', admin)
  const list = JSON.stringify(await rpc('session/list', bob))
  for (const id of [room.sessionId, thread.sessionId, solo.sessionId, fork.sessionId]) assert(!list.includes(id), 'Native list leaked another account resource')
  const ws = await connect(bob)
  ws.open('foreign-follow', 'session/follow', { address: { kind: 'session', sessionId: room.sessionId } })
  // A denied stream closes the carrier rather than admitting an unauthorized resource.
  await once(ws.socket, 'close', { signal: AbortSignal.timeout(5000) })
  const live = await connect(bob)
  live.open('control', 'session/control')
  await live.wait('control')
  live.open('workspace', 'workspace/follow')
  await live.wait('workspace')
  await rpc('workspace/delete', admin, { workspaceId: registered.workspace.workspaceId })
  const removed = () => live.frames.some(frame => frame.streamId === 'workspace' && frame.type === 'item' && frame.value?.type === 'remove' && frame.value.workspaceId === registered.workspace.workspaceId)
  for (let attempt = 0; attempt < 100 && !removed(); attempt++) await delay(50)
  assert(removed(), 'Workspace removal was not delivered to an existing member subscription')

  assert(!JSON.stringify(live.frames).includes(room.sessionId), 'Remote baseline leaked foreign group')
  const hidden = await rpc('session/create', alice)
  const visible = await rpc('session/create', bob)
  await live.wait('control', 'item', visible.sessionId)
  assert(!JSON.stringify(live.frames).includes(hidden.sessionId), 'Remote incremental frame leaked a foreign Solo')
  await api('/rooms/manage', alice, { roomId: room.id, action: 'add-members', participantIds: [bob.identity.participantId] })
  await rpc('session/page', bob, { address: { kind: 'session', sessionId: room.sessionId }, throughSeq: -1 })
  await rpc('session/page', bob, { address: { kind: 'session', sessionId: thread.sessionId }, throughSeq: -1 })
  const sharedFork = await rpc('session/fork', alice, { sessionId: room.sessionId, atSeq: 0 })
  await rpc('session/page', bob, { address: { kind: 'session', sessionId: sharedFork.sessionId }, throughSeq: -1 }, 403)
  live.open('shared-follow', 'session/follow', { address: { kind: 'session', sessionId: room.sessionId } })
  await live.wait('shared-follow')
  await api('/auth/logout', bob, {}, 204)
  await rpc('session/list', bob, {}, 401)
  await api('/prompt', alice, { roomId: room.id, mode: 'queue', content: [{ type: 'text', text: 'after revocation' }] })
  await live.wait('shared-follow', 'error')
  await api('/admin', admin, { action: 'update-user', userId: alice.identity.participantId, status: 'disabled' })
  await rpc('session/list', alice, {}, 401)
  console.log(JSON.stringify({ status: 'passed', accounts: 3, boundary: 'real DSH HTTP + Remote WS', checked: ['group/branch/Solo isolation', 'durable recall and subsequent send', 'list and stream baseline filtering', 'operator endpoint denial', 'scoped directory browsing and child Workspace creation', 'configured cwd', 'membership grant', 'HTTP and active-stream logout revocation'] }, null, 2))
} catch (error) {
  let safe = diagnostic.replace(/([?&]token=)[^\s&]+/gu, '$1<redacted>')
  for (const value of [environment.DSH_CHATROOM_AUTH_SECRET, bootstrapToken]) safe = safe.replaceAll(value, '<redacted>')
  console.error(safe)
  throw error
} finally {
  for (const socket of sockets) socket.terminate()
  if (child && child.exitCode === null) {
    child.kill('SIGTERM')
    await Promise.race([once(child, 'exit'), delay(5000)])
    if (child.exitCode === null) { child.kill('SIGKILL'); await once(child, 'exit') }
  }
  await rm(root, { recursive: true, force: true })
}
