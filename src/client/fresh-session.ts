import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

export type FreshSessionCreator = (workspaceId: WorkspaceId) => Promise<SessionId>

/** Keep native navigation while making every New Session an individually owned candidate. */
export function installFreshSessionStart(
  navigation: Pick<UiWorkspace, 'connectWorkspace'>,
  createSession: FreshSessionCreator,
): () => void {
  const original = navigation.connectWorkspace
  navigation.connectWorkspace = createSession
  return () => {
    if (navigation.connectWorkspace === createSession) navigation.connectWorkspace = original
  }
}
