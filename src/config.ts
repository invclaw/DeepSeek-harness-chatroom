import { isAbsolute } from 'node:path'
import z from '@deepseek-ai/schemastery'

/** Deployment configuration for one shared AI room. */
export interface Config {
  roomId: string
  roomTitle: string
  aiDisplayName: string
  sessionId: string
  cwd: string
  agentPreset: string
  cookieName: string
  cookieMaxAgeSeconds: number
  maxDisplayNameChars: number
  sseHeartbeatMs: number
}

export const Config: z<Config> = z.object({
  roomId: z.string().min(1).max(64).pattern(/^[a-z0-9][a-z0-9_-]*$/u).default('lobby'),
  roomTitle: z.string().min(1).max(80).default('AI 聊天室'),
  aiDisplayName: z.string().min(1).max(40).default('DeepSeek'),
  sessionId: z.string().min(1).max(160).default('chatroom-v1-lobby'),
  cwd: z.string().required(),
  agentPreset: z.string().min(1).default('standard'),
  cookieName: z.string().pattern(/^[A-Za-z0-9_]+$/u).default('dsh_chatroom_session'),
  cookieMaxAgeSeconds: z.number().step(1).min(60).max(31_536_000).default(31_536_000),
  maxDisplayNameChars: z.number().step(1).min(1).max(80).default(24),
  sseHeartbeatMs: z.number().step(1).min(5_000).max(120_000).default(15_000),
})

/** Validate relationships Schemastery cannot express by individual fields. */
export function validateConfig(config: Config): void {
  if (!isAbsolute(config.cwd)) {
    throw new Error(`chatroom: cwd must be absolute, got ${JSON.stringify(config.cwd)}`)
  }
}
