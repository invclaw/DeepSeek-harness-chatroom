import type { Context } from '@deepseek-ai/cordis'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { CHATROOM_REACTION_EMOJIS, type ChatroomReactionEmoji } from './reactions.js'

export const CHATROOM_AGENT_ACTIONS = [
  'send_message',
  'send_file',
  'react',
  'reply',
  'start_branch',
  'invite_members',
  'recall_message',
] as const

export type ChatroomAgentAction = typeof CHATROOM_AGENT_ACTIONS[number]

/** Validated arguments passed from the model-facing action tool to the room runtime. */
export interface ChatroomAgentActionInput {
  readonly action: ChatroomAgentAction
  readonly text?: string
  readonly messageId?: string
  readonly emoji?: ChatroomReactionEmoji
  readonly participantIds?: readonly string[]
  readonly path?: string
  readonly caption?: string
}

/** Small runtime surface consumed by Agent-scoped chatroom tools. */
export interface ChatroomAgentToolsHost {
  agentCapabilities(sessionId: string): Promise<{
    readonly room: string
    readonly scope: 'room' | 'branch'
    readonly members: string[]
    readonly inviteCandidates: string[]
    readonly recentMessages: Array<{
      readonly messageId: string
      readonly role: 'human' | 'ai'
      readonly displayName: string
      readonly text: string
    }>
    readonly actions: ChatroomAgentAction[]
  }>
  agentAction(sessionId: string, input: ChatroomAgentActionInput): Promise<{
    readonly action: ChatroomAgentAction
    readonly summary: string
    readonly followupText?: string
  }>
}

/** Register room-aware collaboration tools on one room or branch Agent context. */
export function registerChatroomAgentTools(
  ctx: Context,
  host: ChatroomAgentToolsHost,
  sessionId: string,
): void {
  ctx.tools.register(defineTool({
    name: 'chatroom_capabilities',
    description: 'List the current chatroom or branch scope, members, invite candidates, and the collaboration actions you can perform.',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          room: { type: 'string', required: true },
          scope: { type: 'string', required: true, enum: ['room', 'branch'] },
          members: { type: 'array', required: true, items: { type: 'string' } },
          inviteCandidates: { type: 'array', required: true, items: { type: 'string' } },
          recentMessages: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                messageId: { type: 'string', required: true },
                role: { type: 'string', required: true, enum: ['human', 'ai'] },
                displayName: { type: 'string', required: true },
                text: { type: 'string', required: true },
              },
            },
          },
          actions: { type: 'array', required: true, items: { type: 'string', enum: [...CHATROOM_AGENT_ACTIONS] } },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Chatroom ${value.room}: ${value.actions.join(', ')}` }],
    },
    execute: () => host.agentCapabilities(sessionId),
    presentCall: () => ({ card: 'generic', title: 'Inspect chatroom capabilities', kind: 'read' }),
  }))

  ctx.tools.register(defineTool({
    name: 'chatroom_action',
    description: 'Perform a collaboration action in the current chatroom. Use send_message for a proactive room message; reply quotes a message; send_file uploads a workspace file; react adds an emoji; start_branch opens a branch from a room message; invite_members adds accounts to the group; recall_message recalls one of your own room messages.',
    parameters: {
      action: { type: 'string', required: true, enum: [...CHATROOM_AGENT_ACTIONS] },
      text: { type: 'string', description: 'Message text for send_message or reply.' },
      messageId: { type: 'string', description: 'Target message id from chatroom_capabilities for react, reply, start_branch, or recall_message.' },
      emoji: { type: 'string', enum: [...CHATROOM_REACTION_EMOJIS], description: 'Reaction emoji for react.' },
      participantIds: { type: 'array', items: { type: 'string' }, description: 'Account ids, usernames, or display names for invite_members.' },
      path: { type: 'string', description: 'Workspace-relative file path for send_file.' },
      caption: { type: 'string', description: 'Optional text shown with a sent file.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string', required: true, enum: [...CHATROOM_AGENT_ACTIONS] },
          summary: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
    },
    async execute(args, exec) {
      const result = await host.agentAction(sessionId, args)
      if (result.followupText !== undefined) {
        exec.deferContext(createUserMessage({
          content: [
            {
              type: 'text',
              text: 'The chatroom action succeeded. Send the next content block as your entire next assistant response. Preserve it exactly, including invisible metadata. Do not explain the action and do not call another tool.',
            },
            { type: 'text', text: result.followupText },
          ],
          source: {
            kind: 'plugin',
            plugin: 'deepseek-harness-chatroom',
            form: 'notice',
            summary: `Deliver ${result.action} output to the chatroom`,
          },
        }))
      }
      const { followupText: _followupText, ...output } = result
      return output
    },
    presentCall: args => ({ card: 'generic', title: `Chatroom: ${args.action}`, kind: 'other', rawInput: args }),
  }))
}
