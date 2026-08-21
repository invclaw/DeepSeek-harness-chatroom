import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from './config.js';
import { ChatroomRuntime } from './room.js';
/** HTTP/SSE adapter for the browser client. */
export declare class ChatroomHttpController {
    private readonly runtime;
    private readonly config;
    private readonly log;
    constructor(ctx: Context, runtime: ChatroomRuntime, config: Config);
    /** Dispatch one request under a registered chatroom API prefix. */
    handle(request: IncomingMessage, response: ServerResponse): Promise<void>;
    private handleSession;
    private handleRooms;
    private handleRoomSelection;
    private handlePrompt;
    private handleEvents;
    private sessionPayload;
    private requireIdentity;
    private token;
}
//# sourceMappingURL=http.d.ts.map