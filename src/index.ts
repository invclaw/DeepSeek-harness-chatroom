/** Multi-user AI chatroom bundle for DeepSeek Harness Web. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-default-model'
import type {} from '@deepseek-ai/dsh-agent-preset-registry'
import type {} from '@deepseek-ai/dsh-attachment'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type {} from '@deepseek-ai/dsh-session-title'
import type {} from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-tools'
import { Config, type Config as ChatroomConfig, validateConfig } from './config.js'
import { ChatroomHttpController } from './http.js'
import { CHATROOM_API_PREFIXES } from './routes.js'
import { installNativeConnection, registerNativeGateway } from './native-gateway.js'
import { ChatroomRuntime } from './room.js'

export const name = 'deepseek-harness-chatroom'
const runtimeServices = [
  'agentDefaultModel',
  'agentPresets',
  'agents',
  'attachments',
  'sessionController',
  'llm',
  'sessionPersistence',
  'sessions',
  'sessionTitle',
  'storageDomain',
  'tools',
  'webServer',
  'typertGateway',
  'connection',
  'workspaceRegistry',
]

export { Config, ChatroomHttpController, ChatroomRuntime }
export type { ChatroomConfig as ConfigType }
export type * from './types.js'

/** Register the room API immediately and initialize storage/Agent work in the background. */
export const inject = ['webServer']
export function apply(ctx: Context, config: ChatroomConfig): void {
  validateConfig(config)
  ctx.effect(() => installNativeConnection(ctx, config), 'chatroom: private native registries')
  ctx.inject(runtimeServices, runtimeCtx => installRuntime(runtimeCtx, config))
}

function installRuntime(ctx: Context, config: ChatroomConfig): void {
  const runtime = new ChatroomRuntime(ctx, config)
  const http = new ChatroomHttpController(ctx, runtime, config)
  const log = ctx.logger('deepseek-harness-chatroom')
  ctx.effect(() => {
    const closeGateway = registerNativeGateway(ctx, runtime, config)
    const unregister = CHATROOM_API_PREFIXES.map(path => ctx.webServer.register({
      kind: 'prefix' as const,
      path,
      handler: (request, response) => http.handle(request, response),
    }))
    const startup = runtime.start().then(() => {
      log.info('AI chatroom %s is ready', JSON.stringify(config.roomId))
    }).catch(async (error: unknown) => {
      log.warn('AI chatroom remains offline: %s. Harness startup is unaffected.', String(error))
      await runtime.stop()
    })
    return async () => {
      for (const dispose of unregister) dispose()
      await closeGateway()
      await startup
      await runtime.stop()
    }
  }, 'deepseek-harness-chatroom.runtime')
  ctx.effect(() => ctx.on('session/event', (session, event) => {
    runtime.handleSessionEvent(session, event)
  }), 'deepseek-harness-chatroom.session-events')

}

export default { name, inject, Config, apply }
