import type { UserConfig } from 'tsdown'

const id = 'deepseek-harness-chatroom'
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
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
} satisfies UserConfig
