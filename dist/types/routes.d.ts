/** Canonical API prefix carried through the Host's existing plugin proxy route. */
export declare const CHATROOM_API_PREFIX = "/plugins/deepseek-harness-chatroom/api";
/** Original API prefix retained for direct Harness Web deployments. */
export declare const LEGACY_CHATROOM_API_PREFIX = "/chatroom/api";
/** Every Host prefix accepted by the chatroom HTTP adapter. */
export declare const CHATROOM_API_PREFIXES: readonly ["/plugins/deepseek-harness-chatroom/api", "/chatroom/api"];
/** Resolve a request pathname to its matched chatroom API prefix and endpoint. */
export declare function matchChatroomApi(pathname: string): {
    prefix: string;
    endpoint: string;
} | undefined;
//# sourceMappingURL=routes.d.ts.map