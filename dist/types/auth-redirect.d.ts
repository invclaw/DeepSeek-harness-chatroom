import type { ChatroomAuthProvider, ChatroomAuthState } from './types.js';
/** Build the plugin-owned start route for one external identity provider. */
export declare function authProviderStartLocation(prefix: string, provider: ChatroomAuthProvider, returnTo: string): string;
/** Resolve an immediate SSO redirect while preserving bootstrap and local-login recovery. */
export declare function automaticAuthRedirect(prefix: string, state: ChatroomAuthState, returnTo: string, requestUrl: URL): string | undefined;
/** Detect the local recovery switch on either the auth page or original application URL. */
export declare function localLoginRequested(requestUrl: URL, returnTo: string): boolean;
//# sourceMappingURL=auth-redirect.d.ts.map