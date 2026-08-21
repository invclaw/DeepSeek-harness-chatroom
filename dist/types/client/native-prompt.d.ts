import type { IApiClient, PromptContentPart } from '@deepseek-ai/dsh-client-connection/client';
import type { ChatroomIdentity } from '../types.js';
import type { ChatroomClientStore } from './store.js';
/** Prefix one native prompt with the browser participant visible to every room member. */
export declare function identifyPrompt(content: readonly PromptContentPart[], identity: ChatroomIdentity): PromptContentPart[];
/** Route only the configured shared Session through the identity decorator. */
export declare function installNativePromptIdentity(api: IApiClient, store: ChatroomClientStore): () => void;
//# sourceMappingURL=native-prompt.d.ts.map