import z from '@deepseek-ai/schemastery';
/** Deployment configuration for shared AI rooms. */
export interface Config {
    dataDirectory?: string;
    roomId: string;
    roomTitle: string;
    aiDisplayName: string;
    sessionId: string;
    cwd: string;
    agentPreset: string;
    cookieName: string;
    cookieMaxAgeSeconds: number;
    maxDisplayNameChars: number;
    maxRoomTitleChars: number;
    maxMessageTextChars: number;
    maxFileBytes: number;
    maxFilesPerMessage: number;
    maxMessageFileBytes: number;
    maxImageSidePixels: number;
    settingsAdminParticipantIds: string[];
    maxSettingsRequestBytes: number;
    sseHeartbeatMs: number;
    authEnabled: boolean;
    authCookieName: string;
    authSessionMaxAgeSeconds: number;
    authSecret: string;
    authPublicOrigin: string;
    authBootstrapToken: string;
    authAllowSelfRegistration: boolean;
    authDshAuthHeaders: boolean;
    authDshAuthVerifyUrl: string;
    authDshAuthLoginPath: string;
    /** Authentication topology. Omitted by older callers and treated as local. */
    authMode?: 'local' | 'hybrid' | 'dsh-auth-only';
    authDshAuthSuperAdminSubjects?: string[];
    authDshAuthAvatarUrlTemplate?: string;
    authDshAuthAvatarAllowedOrigins?: string[];
    authDshAuthRevalidateSeconds?: number;
}
export declare const Config: z<Config>;
/** Validate relationships Schemastery cannot express by individual fields. */
export declare function validateConfig(config: Config): void;
//# sourceMappingURL=config.d.ts.map