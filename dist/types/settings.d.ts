/** Host-only replacement for the native ui-settings entry; retains its namespace and preferences. */
import type { Context } from '@deepseek-ai/cordis';
export { Config } from '@deepseek-ai/dsh-client-ui-settings';
declare module '@deepseek-ai/cordis' {
    interface Context {
        chatroomManagedSettings: boolean;
    }
}
export declare function apply(ctx: Context): void;
//# sourceMappingURL=settings.d.ts.map