import type { IncomingHttpHeaders } from 'node:http';
import type { KvTable } from '@deepseek-ai/dsh-storage-domain';
import type { Config } from './config.js';
import type { AccountRecord, AuthProviderRecord, AuthSessionRecord, AuthSettingsRecord, ExternalAccountRecord } from './domain.js';
import type { ChatroomAccount, ChatroomAccountRole, ChatroomAdminOverview, ChatroomAuthProvider, ChatroomAuthProviderAdmin, ChatroomAuthState } from './types.js';
interface ProviderInput {
    readonly id: string;
    readonly label: string;
    readonly enabled: boolean;
    readonly issuer: string;
    readonly clientId: string;
    readonly clientSecret?: string;
    readonly scopes: string;
    readonly usernameClaim: string;
    readonly displayNameClaim: string;
    readonly autoCreateUsers: boolean;
}
interface AccountInput {
    readonly username: string;
    readonly password: string;
    readonly displayName: string;
    readonly avatarId?: string;
    readonly role?: ChatroomAccountRole;
    readonly bootstrapToken?: string;
}
export interface ChatroomAccountResolution {
    readonly account?: ChatroomAccount;
    readonly renewalCookie?: string;
}
/** Authentication failure with text safe to return to the requesting browser. */
export declare class ChatroomAuthError extends Error {
}
/** Login throttle result carrying an HTTP-compatible retry delay. */
export declare class ChatroomAuthRateLimitError extends ChatroomAuthError {
    readonly retryAfterSeconds: number;
    constructor(retryAfterSeconds: number);
}
/** Durable local accounts, OIDC providers, dsh-auth adoption, and opaque sessions. */
export declare class ChatroomAuth {
    readonly config: Config;
    private readonly accounts;
    private readonly sessions;
    private readonly settingsTable;
    private readonly providersTable;
    private readonly externalAccounts;
    private readonly pendingOidc;
    private readonly oidcConfigurations;
    private readonly loginBuckets;
    private accountAdmission;
    private readonly encryptionKey;
    constructor(config: Config, accounts: KvTable<string, AccountRecord>, sessions: KvTable<string, AuthSessionRecord>, settingsTable: KvTable<string, AuthSettingsRecord>, providersTable: KvTable<string, AuthProviderRecord>, externalAccounts: KvTable<string, ExternalAccountRecord>);
    /** Seed dynamic settings and remove expired login sessions. */
    start(now?: number): Promise<void>;
    /** Bring accounts created by the pre-profile adapter onto the stable subject/role model. */
    private migrateExternalAccounts;
    /** Resolve one local opaque token without trusting browser-supplied identity fields. */
    account(token: string | undefined, now?: number): ChatroomAccount | undefined;
    /** Resolve a request account and, in dsh-auth-only mode, revalidate the upstream session periodically. */
    accountForRequest(token: string | undefined, headers: IncomingHttpHeaders, originalUri?: string, now?: number): Promise<ChatroomAccountResolution>;
    /** Browser-safe authentication state; unauthenticated callers receive no room metadata. */
    state(account?: ChatroomAccount): ChatroomAuthState;
    /** Enabled external sign-in choices shown on the login form. */
    providers(): readonly ChatroomAuthProvider[];
    /** Register the bootstrap super administrator or a policy-permitted member account. */
    register(input: AccountInput): Promise<{
        token: string;
        account: ChatroomAccount;
    }>;
    /** Verify local credentials and issue a new opaque session. */
    login(username: string, password: string): Promise<{
        token: string;
        account: ChatroomAccount;
    }>;
    /** Revoke only the supplied browser session. */
    logout(token: string | undefined): Promise<void>;
    /** Replace one local password after verifying the current credential and revoke older sessions. */
    changePassword(actor: ChatroomAccount, currentPassword: string, newPassword: string): Promise<{
        token: string;
        account: ChatroomAccount;
    }>;
    /** Adopt one dsh-auth verified identity, applying the configured subject role policy. */
    adoptDshAuth(headers: IncomingHttpHeaders, originalUri?: string): Promise<{
        token: string;
        account: ChatroomAccount;
        renewalCookie?: string;
    } | undefined>;
    /** Refresh the signed-in account from the currently verified dsh-auth profile. */
    synchronizeDshAuthProfile(headers: IncomingHttpHeaders, account: ChatroomAccount, originalUri?: string): Promise<ChatroomAccount>;
    /** Public dsh-auth password-login location returning through the local adapter. */
    dshAuthLoginUrl(returnTo: string, callbackPath: string): URL;
    /** Build one PKCE and nonce-protected enterprise OIDC authorization redirect. */
    startOidc(providerId: string, returnTo: string): Promise<URL>;
    /** Exchange and validate one OIDC callback, then bind or create its local account. */
    completeOidc(providerId: string, currentUrl: URL): Promise<{
        token: string;
        account: ChatroomAccount;
        returnTo: string;
    }>;
    /** Super-administrator account, policy, and OIDC configuration snapshot. */
    overview(actor: ChatroomAccount): ChatroomAdminOverview;
    /** Create one local account from the super-administrator console. */
    createUser(actor: ChatroomAccount, input: AccountInput): Promise<ChatroomAccount>;
    /** Change global role or activation state without allowing the final super administrator to disappear. */
    updateUser(actor: ChatroomAccount, userId: string, patch: {
        readonly role?: ChatroomAccountRole;
        readonly status?: 'active' | 'disabled';
    }): Promise<ChatroomAccount>;
    /** Enable or disable autonomous password registration. */
    updateSettings(actor: ChatroomAccount, patch: {
        readonly allowSelfRegistration?: boolean;
        readonly autoRedirectProviderId?: string | null;
    }): Promise<void>;
    /** Add or replace one encrypted generic OIDC provider. */
    saveProvider(actor: ChatroomAccount, input: ProviderInput): Promise<ChatroomAuthProviderAdmin>;
    /** Remove one OIDC provider without deleting accounts already linked to it. */
    deleteProvider(actor: ChatroomAccount, providerId: string): Promise<void>;
    /** Active public accounts for user search and private messaging. */
    activeAccounts(): readonly ChatroomAccount[];
    /** Stable subject for consumers of Chatroom's own forward-auth response. */
    verifiedSubject(account: ChatroomAccount): string;
    private createAccount;
    private externalAccount;
    private resolveExternalAccount;
    private externalProfile;
    private externalAvatarUrl;
    private serializeAccounts;
    private issueSession;
    private settings;
    private findUsername;
    private activeSuperAdmins;
    private revokeUserSessions;
    private requireProvider;
    private oidcConfiguration;
    private dshAuthIdentity;
    private consumeLoginAttempt;
    private callbackUrl;
    private pruneOidc;
    private encrypt;
    private decrypt;
    private assertEnabled;
    private assertSuperAdmin;
}
/** Map one durable account to its public and message-compatible identity. */
export declare function publicAccount(account: AccountRecord): ChatroomAccount;
export {};
//# sourceMappingURL=auth.d.ts.map