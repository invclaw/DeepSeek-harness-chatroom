import z from '@deepseek-ai/schemastery';
/** Deployment configuration for one shared AI room. */
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
    sseHeartbeatMs: number;
}
export declare const Config: z<Config>;
/** Validate relationships Schemastery cannot express by individual fields. */
export declare function validateConfig(config: Config): void;
//# sourceMappingURL=config.d.ts.map