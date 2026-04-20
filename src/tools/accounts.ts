import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import {
  addAccount,
  loadAccounts,
  removeAccount,
  switchAccount,
  updateAccount,
  getCurrentAccount,
} from "../auth/account-store.js";
import { invalidateAuth } from "../auth/client-factory.js";

export const accountTools: Tool[] = [
  defineTool({
    name: "accounts_list",
    description: "List every Play Console account registered with the MCP server (names + key-file paths, no secrets).",
    input: z.object({}).strict(),
    handler: async () => loadAccounts(),
  }),

  defineTool({
    name: "accounts_current",
    description: "Show which account is currently active. All subsequent API calls target this account.",
    input: z.object({}).strict(),
    handler: async () => getCurrentAccount(),
  }),

  defineTool({
    name: "accounts_add",
    description:
      "Register a new Play Console account. Provide a local filesystem path to a Google Cloud service-account JSON key. The key stays on disk — the MCP only records its path.",
    input: z
      .object({
        name: z
          .string()
          .describe("Short identifier used to switch accounts, e.g. 'my-app' or 'client-acme'"),
        keyFile: z.string().describe("Absolute path to the service-account JSON key file"),
        description: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      addAccount(args);
      invalidateAuth();
      return { added: args.name };
    },
  }),

  defineTool({
    name: "accounts_remove",
    description: "Remove an account from the local registry. Does NOT delete the key file.",
    input: z.object({ name: z.string() }).strict(),
    handler: async ({ name }) => {
      removeAccount(name);
      invalidateAuth();
      return { removed: name };
    },
  }),

  defineTool({
    name: "accounts_switch",
    description: "Make an existing registered account the active one.",
    input: z.object({ name: z.string() }).strict(),
    handler: async ({ name }) => {
      switchAccount(name);
      invalidateAuth();
      return { current: name };
    },
  }),

  defineTool({
    name: "accounts_update",
    description: "Change the key-file path or description of an existing account.",
    input: z
      .object({
        name: z.string(),
        keyFile: z.string().optional(),
        description: z.string().optional(),
      })
      .strict(),
    handler: async ({ name, ...patch }) => {
      updateAccount(name, patch);
      invalidateAuth();
      return { updated: name };
    },
  }),
];
