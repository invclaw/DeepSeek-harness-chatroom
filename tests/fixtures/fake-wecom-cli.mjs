import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const directory = process.env.WECOM_CLI_CONFIG_DIR ?? ''
const args = process.argv.slice(2)
if (args.join(' ') === 'auth show --status') {
  process.stdout.write(existsSync(join(directory, 'credentials.enc')) ? 'authorized\n' : 'unauthorized\n')
  process.exit(0)
}
if (args[0] === 'auth' && args[1] === 'init') {
  const outputIndex = args.indexOf('--output-qrcode')
  const output = outputIndex === -1 ? 'auth-qrcode.png' : args[outputIndex + 1]
  await mkdir(directory, { recursive: true })
  await writeFile(join(directory, output), Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  ))
  setInterval(() => {
    if (existsSync(join(directory, 'credentials.enc'))) process.exit(0)
  }, 50)
  process.on('SIGTERM', () => process.exit(0))
  await new Promise(() => undefined)
}
if (args[0] === 'contact' && args[1] === 'users' && args[2] === 'search') {
  const inputIndex = args.indexOf('--json')
  const input = JSON.parse(inputIndex === -1 ? '{}' : (args[inputIndex + 1] ?? '{}'))
  const keyword = Array.isArray(input.keywords) && typeof input.keywords[0] === 'string'
    ? input.keywords[0]
    : 'fake-user'
  process.stdout.write(JSON.stringify({
    users: [{ userid: `fake-${keyword}`, name: keyword, alias: keyword }],
  }))
  process.exit(0)
}
if (args[0] === 'meeting' && args[1] === 'create') {
  const inputIndex = args.indexOf('--json')
  const input = JSON.parse(inputIndex === -1 ? '{}' : (args[inputIndex + 1] ?? '{}'))
  process.stdout.write(JSON.stringify({
    meeting_id: 'fake-local-meeting',
    subject: input.subject ?? '快速会议',
    begin_time: input.begin_time,
    end_time: input.end_time,
    meeting_status: 'init',
    meeting_url: 'https://meeting.example.com/local',
    attendees: input.attendees ?? [],
  }))
  process.exit(0)
}
if (args[0] === 'meeting' && args[1] === 'get') {
  process.stdout.write(JSON.stringify({
    meeting_list: [{
      meeting_id: 'fake-local-meeting',
      subject: '快速会议',
      meeting_status: 'init',
      meeting_url: 'https://meeting.example.com/local',
    }],
  }))
  process.exit(0)
}
process.stderr.write('unsupported fake wecom command\n')
process.exit(2)
