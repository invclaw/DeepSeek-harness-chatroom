import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import type { UserConfig } from 'tsdown'

const id = 'deepseek-harness-chatroom'
const require = createRequire(import.meta.url)
const nativeClient = readFileSync(require.resolve('@deepseek-ai/dsh-client-connection/client'), 'utf8')
if (!nativeClient.startsWith('window.__ModuleLoader__.load({')) throw new Error('Unsupported native connection client bundle')
const embeddedConnection = nativeClient.replace('window.__ModuleLoader__.load(', 'const nativeConnection = ((registration) => registration.factory(require))(').replace(/\/\/# sourceMappingURL=.*$/mu, '')
const platformModules = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
]

export default {
  name: `${id}/client`,
  entry: { client: 'src/client/index.tsx' },
  outDir: 'dist',
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: platformModules,
    alwaysBundle: (specifier: string) => platformModules.includes(specifier) ? undefined : true,
  },
  outputOptions: {
    exports: 'named',
    entryFileNames: 'client.js',
    banner: `${nativeClient}\nwindow.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: `${embeddedConnection}\nvar module = { exports: {} }; var exports = module.exports;`,
  },
} satisfies UserConfig
