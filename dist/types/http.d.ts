import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from './config.js';
import { ChatroomRuntime } from './room.js';
/** HTTP/SSE adapter for the browser client. */
export declare class ChatroomHttpController {
    private readonly runtime;
    private readonly config;
    private readonly log;
    private readonly configurationApi;
    constructor(ctx: Context, runtime: ChatroomRuntime, config: Config);
    /** Dispatch one request under a registered chatroom API prefix. */
    handle(request: IncomingMessage, response: ServerResponse): Promise<void>;
    private handleSession;
    private handleAuthentication;
    private handleAdministration;
    private handleAccount;
    private handleDirect;
    private handleDirectMessages;
    private handleRooms;
    private handleRoomEnsure;
    private handleRoomSelection;
    private handleRoomManagement;
    private handleThreadOpen;
    private handleThreadPrompt;
    private handlePrompt;
    private handleReactionToggle;
    private handleForward;
    private handleFile;
    private handleImage;
    private handleEvents;
    private handleNotifications;
    private handleConfiguration;
    private sessionPayload;
    private requireIdentity;
    private requireAccount;
    private token;
    private authToken;
    private setAuthCookie;
}
/** Whether the remote administrator bridge exposes one API Proxy method. */
export declare function isRemoteConfigurationMethod(method: string): boolean;
/** Whether one authenticated chatroom identity may use the remote model-settings bridge. */
export declare function canManageRemoteSettings(config: Config, participantId: string): boolean;
//# sourceMappingURL=http.d.ts.map