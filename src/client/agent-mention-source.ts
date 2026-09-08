import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type { ChatroomClientStore } from './store.js'

/** @-menu source for room AI participants: every enabled member with its own model routing. */
export function createChatroomAgentProfileSource(store: ChatroomClientStore): InputTriggerSource {
  return {
    trigger: '@',
    name: 'AI 成员',
    order: -95,
    async candidates(session, { query }) {
      const room = store.roomForSession(String(session.sessionId))
      if (room === undefined) return []
      await store.ensureAgentProfiles()
      const needle = query.toLocaleLowerCase()
      return (store.getSnapshot().agentProfiles?.profiles ?? [])
        .filter(profile => profile.roomId === room.id && profile.enabled)
        .map(profile => ({
          name: profile.name,
          hint: '◆',
          description: `${profile.role} · ${profile.model}${profile.reasoningEffort === undefined ? '' : ` · ${profile.reasoningEffort}`}`,
          value: profile.id,
        }))
        .filter(candidate => candidate.name.toLocaleLowerCase().includes(needle))
    },
    lexicon(session) {
      const room = store.roomForSession(String(session.sessionId))
      if (room === undefined) return []
      return (store.getSnapshot().agentProfiles?.profiles ?? [])
        .filter(profile => profile.roomId === room.id && profile.enabled)
        .map(profile => profile.name)
    },
    subscribeLexicon(_session, listener) {
      return store.subscribe(listener)
    },
    onPick({ candidate }) {
      return { text: `@${candidate.name} ` }
    },
  }
}
