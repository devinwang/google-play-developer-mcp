import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher } from "../auth/client-factory.js";

/**
 * Developer-account user management.
 *
 * users   — account-level team members & roles
 * grants  — per-app permission grants (finer grain than users)
 *
 * The API names parent as "developers/{developerAccount}" — callers
 * must know the account id, which is visible on the Play Console URL.
 */
export const userTools: Tool[] = [
  defineTool({
    name: "users_list",
    description:
      "List all users on a developer account. `parent` is the developer account id in the form `developers/{developerId}` (find it in the Play Console URL).",
    input: z
      .object({
        parent: z.string(),
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).users.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "users_create",
    description:
      "Add a new team member to the developer account. Pass the user resource with email + roles + optional expirationTime.",
    input: z
      .object({
        parent: z.string(),
        user: z.record(z.any()),
      })
      .strict(),
    handler: async ({ parent, user }) => {
      const res = await (await publisher()).users.create({ parent, requestBody: user });
      return res.data;
    },
  }),
  defineTool({
    name: "users_update",
    description: "Patch-update a team member (roles, access level).",
    input: z
      .object({
        name: z.string().describe("Full user resource name: developers/{dev}/users/{user}"),
        user: z.record(z.any()),
        updateMask: z.string().optional(),
      })
      .strict(),
    handler: async ({ name, user, updateMask }) => {
      const res = await (await publisher()).users.patch({
        name,
        updateMask,
        requestBody: user,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "users_delete",
    description: "Remove a user from the developer account.",
    input: z
      .object({
        name: z.string().describe("Full user resource name: developers/{dev}/users/{user}"),
      })
      .strict(),
    handler: async ({ name }) => {
      await (await publisher()).users.delete({ name });
      return { ok: true };
    },
  }),

  // ---------- grants ----------
  defineTool({
    name: "grants_create",
    description:
      "Grant a user access to one app. `parent` is developers/{dev}/users/{user}. Grant body contains packageName + appLevelPermissions.",
    input: z
      .object({
        parent: z.string(),
        grant: z.record(z.any()),
      })
      .strict(),
    handler: async ({ parent, grant }) => {
      const res = await (await publisher()).grants.create({ parent, requestBody: grant });
      return res.data;
    },
  }),
  defineTool({
    name: "grants_update",
    description: "Patch a grant (change appLevelPermissions).",
    input: z
      .object({
        name: z.string(),
        grant: z.record(z.any()),
        updateMask: z.string().optional(),
      })
      .strict(),
    handler: async ({ name, grant, updateMask }) => {
      const res = await (await publisher()).grants.patch({
        name,
        updateMask,
        requestBody: grant,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "grants_delete",
    description: "Revoke a grant.",
    input: z.object({ name: z.string() }).strict(),
    handler: async ({ name }) => {
      await (await publisher()).grants.delete({ name });
      return { ok: true };
    },
  }),
];
