/** Host-only replacement for the native ui-settings entry; retains its namespace and preferences. */
import type { Context } from '@deepseek-ai/cordis'
import { apply as applyNative } from '@deepseek-ai/dsh-client-ui-settings'
export { Config } from '@deepseek-ai/dsh-client-ui-settings'

declare module '@deepseek-ai/cordis' {
  interface Context { chatroomManagedSettings: boolean }
}

export function apply(ctx: Context): void {
  ctx.provide('chatroomManagedSettings', true)
  applyNative(ctx)
}
