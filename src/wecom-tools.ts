import type { Context } from '@deepseek-ai/cordis'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { identifyExternalCardText } from './message.js'
import { inferWecomCard, WECOM_SERVICES, type WecomCliClient, type WecomService } from './wecom.js'

const COMMAND_PART = /^[a-z][a-z0-9_-]*$/u

/** Register schema-driven official Enterprise WeChat tools on one Agent context. */
export function registerWecomAgentTools(ctx: Context, resolveClient: () => WecomCliClient): void {
  ctx.tools.register(defineTool({
    name: 'wecom_schema',
    description: 'Read the official wecom-cli JSON schema for one Enterprise WeChat calendar, meeting, document, sheet, smart sheet, smart document, contact, or identity operation. Always call this before an unfamiliar action.',
    parameters: {
      service: { type: 'string', required: true, enum: [...WECOM_SERVICES] },
      resource: { type: 'array', items: { type: 'string' }, description: 'Optional nested resource tokens, for example ["schedules", "free"].' },
      method: { type: 'string', required: true, description: 'Final CLI method token, for example create, list, get, update, append, overwrite, or search.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: { schemaJson: { type: 'string', required: true } },
      },
      render: (_args, value) => [{ type: 'text', text: value.schemaJson }],
    },
    async execute(args) {
      const resource = commandParts(args.resource ?? [])
      const method = commandPart(args.method)
      const value = await resolveClient().schema(args.service as WecomService, resource, method)
      return { schemaJson: JSON.stringify(value) }
    },
    presentCall: args => ({ card: 'generic', title: `企微接口定义 · ${args.service}`, kind: 'read', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'wecom_action',
    description: 'Execute one official wecom-cli operation. Supports calendar CRUD/free-busy/rooms, meetings and transcripts, document search/permissions, online sheets, smart sheets, smart documents, contact resolution, and identity. Resolve people first, never invent internal IDs, and call wecom_schema before writes.',
    parameters: {
      service: { type: 'string', required: true, enum: [...WECOM_SERVICES] },
      resource: { type: 'array', items: { type: 'string' }, description: 'Optional nested resource tokens.' },
      method: { type: 'string', required: true },
      parametersJson: { type: 'string', required: true, description: 'A JSON object matching the official method schema.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: { resultJson: { type: 'string', required: true } },
      },
      render: (_args, value) => [{ type: 'text', text: value.resultJson }],
    },
    async execute(args, exec) {
      const service = args.service as WecomService
      const resource = commandParts(args.resource ?? [])
      const method = commandPart(args.method)
      const parameters = parseObject(args.parametersJson)
      const result = await resolveClient().invoke(service, resource, method, parameters)
      const card = inferWecomCard(service, method, parameters, result)
      if (card !== undefined) {
        exec.deferContext(createUserMessage({
          content: [
            {
              type: 'text',
              text: 'The Enterprise WeChat operation succeeded. Send the next content block as your entire next assistant response. Preserve it exactly, including invisible metadata. Do not expose internal IDs and do not call another tool.',
            },
            { type: 'text', text: identifyExternalCardText(card) },
          ],
          source: {
            kind: 'plugin',
            plugin: 'deepseek-harness-chatroom',
            form: 'notice',
            summary: `Render Enterprise WeChat ${card.kind} card`,
          },
        }))
      }
      return { resultJson: JSON.stringify(result) }
    },
    presentCall: args => ({ card: 'generic', title: `企微 · ${args.service} ${args.method}`, kind: 'other', rawInput: args }),
  }))
}

function commandParts(parts: readonly string[]): string[] {
  return parts.map(commandPart)
}

function commandPart(value: string): string {
  if (!COMMAND_PART.test(value)) throw new Error(`Invalid wecom-cli command token ${JSON.stringify(value)}`)
  return value
}

function parseObject(value: string): Record<string, unknown> {
  let parsed: unknown
  try { parsed = JSON.parse(value) as unknown } catch { throw new Error('parametersJson must contain valid JSON') }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('parametersJson must contain a JSON object')
  }
  return parsed as Record<string, unknown>
}
