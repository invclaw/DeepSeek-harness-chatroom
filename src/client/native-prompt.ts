import type { IApiClient, PromptContentPart } from '@deepseek-ai/dsh-client-connection/client'
import type { ChatroomClientStore } from './store.js'

/** Prefix one native prompt with the browser participant visible to every room member. */
export function identifyPrompt(
  content: readonly PromptContentPart[],
  displayName: string,
): PromptContentPart[] {
  let identified = false
  const output = content.map((part): PromptContentPart => {
    if (identified || part.type !== 'text') return part
    identified = true
    return { ...part, text: `${displayName}：${part.text}` }
  })
  return identified
    ? output
    : [{ type: 'text', text: `${displayName} 发送了一张图片。` }, ...output]
}

/** Route only the configured shared Session through the identity decorator. */
export function installNativePromptIdentity(
  api: IApiClient,
  store: ChatroomClientStore,
): () => void {
  const original = api.sessions.prompt
  const wrapped: IApiClient['sessions']['prompt'] = (payload, signal) => {
    const room = store.getSnapshot()
    if (room.room === undefined || String(payload.sessionId) !== room.room.sessionId) {
      return original(payload, signal)
    }
    if (room.identity === undefined) {
      return Promise.reject(new Error('请先选择聊天室身份。'))
    }
    return original({
      ...payload,
      content: identifyPrompt(payload.content, room.identity.displayName),
    }, signal)
  }
  api.sessions.prompt = wrapped
  return () => {
    if (api.sessions.prompt === wrapped) api.sessions.prompt = original
  }
}
