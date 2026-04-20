import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher, reporting } from "../auth/client-factory.js";
import { packageNameArg } from "../utils/schemas.js";

/**
 * Note: the Android Publisher API does not expose a raw "list all apps
 * under this developer" endpoint. The standard workaround is to use the
 * Reporting API's `apps.search`, which enumerates every app the service
 * account has access to. `apps_get` wraps the Publisher's app-details
 * metadata via an edit.
 */
export const appsTools: Tool[] = [
  defineTool({
    name: "apps_list",
    description:
      "List every Android app the active service account can access. Uses the Play Developer Reporting API's apps.search.",
    input: z
      .object({
        pageSize: z.number().int().positive().optional(),
        pageToken: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await reporting().apps.search({
        pageSize: args.pageSize,
        pageToken: args.pageToken,
      });
      return res.data;
    },
  }),

  defineTool({
    name: "apps_get",
    description:
      "Open a fresh edit and return the details resource (contact email/phone/website + default language) for one app.",
    input: z.object({ packageName: packageNameArg }).strict(),
    handler: async ({ packageName }) => {
      const api = publisher();
      const edit = await api.edits.insert({ packageName, requestBody: {} });
      try {
        const details = await api.edits.details.get({
          packageName,
          editId: edit.data.id!,
        });
        return details.data;
      } finally {
        await api.edits.delete({ packageName, editId: edit.data.id! }).catch(() => {});
      }
    },
  }),
];
