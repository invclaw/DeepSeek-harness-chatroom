import { existsSync } from 'node:fs'
import { join } from 'node:path'

const directory = process.env.WECOM_CLI_CONFIG_DIR ?? ''
if (process.argv.slice(2).join(' ') === 'auth show --status') {
  process.stdout.write(existsSync(join(directory, 'credentials.enc')) ? 'authorized\n' : 'unauthorized\n')
  process.exit(0)
}
process.stderr.write('unsupported fake wecom command\n')
process.exit(2)
