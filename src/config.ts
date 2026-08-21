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
  maxMessageChars: number
  responseTimeoutMs: number
  aiRetryDelayMs: number
  sseHeartbeatMs: number
  noReplyToken: string
  systemPrompt: string
}

const DEFAULT_NO_REPLY_TOKEN = '<CHATROOM_NO_REPLY>'

const DEFAULT_SYSTEM_PROMPT = [
  '你正在一个多人 AI 聊天室中作为参与者发言。每条输入都会明确标出发言者姓名和消息内容。',
  '你可以读取这个房间至今的完整对话，并自主判断当前是否值得回复。',
  `如果不需要回复，只输出 ${DEFAULT_NO_REPLY_TOKEN}，不得添加任何其他字符。`,
  '如果决定回复，只输出要发送到聊天室的自然语言正文，不要添加角色前缀，不要解释你的回复决策。',
  '不要因为每条消息都被提交给你就强行插话；被点名、被提问、能够纠正关键错误或能明显推进讨论时再回复。',
].join('\n')

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
  maxMessageChars: z.number().step(1).min(1).max(20_000).default(4_000),
  responseTimeoutMs: z.number().step(1).min(1_000).max(900_000).default(180_000),
  aiRetryDelayMs: z.number().step(1).min(1_000).max(300_000).default(5_000),
  sseHeartbeatMs: z.number().step(1).min(5_000).max(120_000).default(15_000),
  noReplyToken: z.string().min(1).max(80).default(DEFAULT_NO_REPLY_TOKEN),
  systemPrompt: z.string().min(1).default(DEFAULT_SYSTEM_PROMPT),
})

/** Validate relationships Schemastery cannot express by individual fields. */
export function validateConfig(config: Config): void {
  if (!isAbsolute(config.cwd)) {
    throw new Error(`chatroom: cwd must be absolute, got ${JSON.stringify(config.cwd)}`)
  }
  if (config.systemPrompt.includes(config.noReplyToken) === false) {
    throw new Error('chatroom: systemPrompt must contain noReplyToken so silence remains an explicit model decision')
  }
}
