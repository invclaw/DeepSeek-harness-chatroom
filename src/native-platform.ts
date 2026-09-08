/** Reuse the rc.1 transport implementation; never install an older DSH kernel. */
import { readFile } from 'node:fs/promises'
import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'
import type { Context } from '@deepseek-ai/cordis'
import { apply as applyNativeConnection } from '@deepseek-ai/dsh-client-connection'
import type { TypertGatewayWireStream } from '@deepseek-ai/dsh-api-gateway'
import type {} from '@deepseek-ai/dsh-credentials'

type NativeMux = {
  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void
  close(): Promise<void>
}
type NativeMuxConstructor = new (
  open: TypertGatewayWireStream['open'],
  failure: TypertGatewayWireStream['failure'],
  heartbeatIntervalMs: number,
) => NativeMux

/** The shipped stream mux has no public subpath yet; fail closed on cohort drift. */
async function nativeModule(packageName: string, file: string): Promise<Record<string, unknown>> {
  const manifest = new URL(import.meta.resolve(`${packageName}/package.json`))
  const metadata: unknown = JSON.parse(await readFile(manifest, 'utf8'))
  if (typeof metadata !== 'object' || metadata === null || !('version' in metadata)
    || metadata.version !== '0.1.2-rc.1') {
    throw new Error(`chatroom requires ${packageName}@0.1.2-rc.1; refusing an unverified transport`)
  }
  return await import(new URL(`lib/types/${file}.js`, manifest).href) as Record<string, unknown>
}

export async function createNativeTransport(ctx: Context, hosts: string[]) {
  const muxModule = await nativeModule('@deepseek-ai/dsh-api-gateway', 'stream-server')
  const Mux = muxModule.RemoteStreamMuxServer as NativeMuxConstructor
  if (typeof Mux !== 'function') {
    throw new Error('chatroom: native transport helpers are unavailable')
  }
  // Native apply owns credential initialization. Its single HTTP route is
  // replaced by our account-authorized route, not mounted a second time.
  const connectionCtx = ctx.extend({
    webServer: {
      register(route: { kind: string; path: string }) {
        if (route.kind !== 'prefix' || route.path !== '/api') throw new Error('Unexpected native connection route')
        return () => {}
      },
    },
  })
  await applyNativeConnection(connectionCtx, { trustedHosts: hosts })
  const connection = ctx.connection
  // The plugin owns the authenticated WebSocket route. The native Gateway still
  // owns descriptors, validation, RPC dispatch and event-result correlation.
  const gateway = ctx.typertGateway
  return { connection, gateway, Mux }
}

export type NativeTransport = Awaited<ReturnType<typeof createNativeTransport>>
