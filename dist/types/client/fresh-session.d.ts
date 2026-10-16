import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client';
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { IWorkspaces } from '@deepseek-ai/dsh-api-workspace-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types';
/** Host operation that creates a new Session instead of resolving a reusable blank one. */
export type FreshSessionCreator = (workspaceId: WorkspaceId) => Promise<SessionId>;
/**
 * Make the native New Session action create a distinct shared-session candidate.
 * Harness normally reuses any blank Session in the Workspace, but chatroom and
 * branch Sessions may contain durable human messages before an Agent turn starts.
 * @param workspaces - Native Workspace navigation service used by the sidebar.
 * @param sessions - Native Session service used to create and open the candidate.
 * @param createSession - Host operation that always creates a new Session.
 * @returns disposer restoring the original New Session implementation.
 */
export declare function installFreshSessionStart(navigation: UiWorkspace, workspaces: IWorkspaces, sessions: ISessions, createSession: FreshSessionCreator): () => void;
//# sourceMappingURL=fresh-session.d.ts.map