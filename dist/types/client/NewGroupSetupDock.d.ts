import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ChatroomView } from './store.js';
interface NewGroupSetupInjected {
    useChatroom<T>(selector: (snapshot: ChatroomView) => T): T;
    registerNewSession(sessionId: string): void;
    chooseNewSessionMode(sessionId: string, mode: 'group' | 'solo'): Promise<boolean>;
}
type NewGroupSetupDockProps = PropsRuntime<'conversation.input.dock'> & NewGroupSetupInjected;
/** Native blank-Session choice between a shared room and one-person Agent work. */
export declare function NewGroupSetupDock(props: NewGroupSetupDockProps): JSX.Element | null;
export {};
//# sourceMappingURL=NewGroupSetupDock.d.ts.map