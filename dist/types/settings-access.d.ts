import type { Config } from './config.js';
import type { ChatroomIdentity } from './types.js';
/** Shared authority for capability hints, operator RPCs and settings invalidations. */
export declare function canManageNativeSettings(config: Config, identity: ChatroomIdentity | null | undefined): boolean;
//# sourceMappingURL=settings-access.d.ts.map