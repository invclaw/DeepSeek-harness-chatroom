import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** The Workspace UI owns the main-view reference; the catalog owns no selection. */
export function mainSessionId(list: SessionListState): SessionId | undefined {
  return Object.values(list.byId).find(row => (row.retainedBy.mainView ?? 0) > 0)?.id
}
