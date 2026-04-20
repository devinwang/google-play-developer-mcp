import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { verifyAuth } from "../auth/client-factory.js";
import { getCurrentAccount } from "../auth/account-store.js";

export const authTools: Tool[] = [
  defineTool({
    name: "auth_status",
    description:
      "Verify that the active account can acquire a Google OAuth token. Returns the service-account email plus whether a token was obtained.",
    input: z.object({}).strict(),
    handler: async () => {
      const account = getCurrentAccount();
      if (!account) {
        return {
          ok: false,
          message: "No active account. Run `accounts_add` then `accounts_switch`.",
        };
      }
      const result = await verifyAuth();
      return { ok: result.tokenAcquired, account: account.name, ...result };
    },
  }),
];
