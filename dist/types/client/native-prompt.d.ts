import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client';
import { identifyPrompt } from '../message.js';
import { type ChatroomClientStore } from './store.js';
export { identifyPrompt };
/** Route shared room chat through human-first admission while preserving native slash commands. */
export declare function installNativePromptIdentity(api: IApiClient, store: ChatroomClientStore): () => void;
//# sourceMappingURL=native-prompt.d.ts.map