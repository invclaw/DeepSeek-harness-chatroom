import type { ChatroomBranchLink } from './store.js';
/** Parse an native branch deep link. */
export declare function branchLinkFromLocation(location: Pick<Location, 'search'>): ChatroomBranchLink | undefined;
/** Return a URL-selected room when no branch is addressed. */
export declare function invitedRoomFromLocation(location: Pick<Location, 'search'>, branchLink: ChatroomBranchLink | undefined): string | undefined;
//# sourceMappingURL=branch-link.d.ts.map