import { describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import { validateJsonSchemaValue, type ToolDefinition } from '@deepseek-ai/dsh-tools'
import { registerChatroomAgentTools } from '../src/agent-tools.js'

describe('chatroom Agent tools', () => {
  it('declares the source coordinates returned for branch-root messages', async () => {
    const definitions: ToolDefinition[] = []
    const ctx = {
      tools: { register: (definition: ToolDefinition) => { definitions.push(definition); return vi.fn() } },
    } as unknown as Context
    registerChatroomAgentTools(ctx, {
      agentCapabilities: vi.fn(async () => ({
        room: 'AI 聊天室',
        scope: 'branch' as const,
        members: ['Alice (alice-id)'],
        inviteCandidates: [],
        recentMessages: [{
          messageId: 'user:7',
          role: 'human' as const,
          displayName: 'Alice',
          text: '主题消息',
          sourceSessionId: 'chatroom-v1-lobby',
          sourceSeq: 7,
        }],
        actions: ['send_message' as const],
      })),
      agentAction: vi.fn(),
    }, 'branch-session')
    const capabilities = definitions.find(definition => definition.name === 'chatroom_capabilities')
    if (capabilities === undefined) throw new Error('chatroom_capabilities was not registered')

    const value = await capabilities.execute({}, {
      signal: new AbortController().signal,
      concludeTurn: vi.fn(),
      deferContext: vi.fn(),
    } as never)

    expect(validateJsonSchemaValue(capabilities.output.schema, value)).toEqual([])
  })
})
