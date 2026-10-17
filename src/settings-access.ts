import type { Config } from './config.js'
import type { ChatroomAccount, ChatroomIdentity } from './types.js'

/** Shared authority for capability hints, operator RPCs and settings invalidations. */
export function canManageNativeSettings(config: Config, identity: ChatroomIdentity | null | undefined): boolean {
  return !config.authEnabled || identity != null && (
    ('role' in identity && (identity as ChatroomAccount).role === 'super-admin')
    || config.settingsAdminParticipantIds.includes(identity.participantId))
}
