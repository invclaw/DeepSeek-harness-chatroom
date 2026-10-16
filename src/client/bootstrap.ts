import { CHATROOM_API_PREFIX } from '../routes.js'
import type { ChatroomSessionResponse } from '../types.js'

/** Establish the room cookie before native controllers open their authenticated streams. */
export async function bootstrapChatroom(fetcher: typeof fetch = fetch): Promise<ChatroomSessionResponse> {
  const deadline = Date.now() + 15000
  for (;;) {
    const response = await fetcher(`${CHATROOM_API_PREFIX}/session`, { credentials: 'same-origin', signal: AbortSignal.timeout(15000) })
    if (response.status === 503 && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 250))
      continue
    }
    if (!response.ok) throw new Error(`群聊暂时无法加载（${response.status}），请刷新重试。`)
    return await response.json() as ChatroomSessionResponse
  }
}
