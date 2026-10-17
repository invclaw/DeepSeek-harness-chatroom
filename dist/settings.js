// src/settings.ts
import { apply as applyNative } from "@deepseek-ai/dsh-client-ui-settings";
import { Config } from "@deepseek-ai/dsh-client-ui-settings";
function apply(ctx) {
  ctx.provide("chatroomManagedSettings", true);
  applyNative(ctx);
}
export {
  Config,
  apply
};
//# sourceMappingURL=settings.js.map