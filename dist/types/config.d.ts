import z from '@deepseek-ai/schemastery';
/** Deployment configuration for shared AI rooms. */
export interface Config {
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
}
export declare const Config: z<Config>;
/** Validate relationships Schemastery cannot express by individual fields. */
export declare function validateConfig(config: Config): void;
//# sourceMappingURL=config.d.ts.map