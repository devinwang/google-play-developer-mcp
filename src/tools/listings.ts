import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher } from "../auth/client-factory.js";
import { packageNameArg, editIdArg, languageArg } from "../utils/schemas.js";

/**
 * edits.listings — per-locale store listing text. One Listing entry per
 * language. Unlike App Store Connect, Play uses a flat per-locale model
 * with no separate "version metadata" concept.
 */
export const listingTools: Tool[] = [
  defineTool({
    name: "listings_list",
    description: "List every locale listing within an edit.",
    input: z.object({ packageName: packageNameArg, editId: editIdArg }).strict(),
    handler: async ({ packageName, editId }) => {
      const res = await publisher().edits.listings.list({ packageName, editId });
      return res.data;
    },
  }),

  defineTool({
    name: "listings_get",
    description: "Get one locale's listing.",
    input: z
      .object({ packageName: packageNameArg, editId: editIdArg, language: languageArg })
      .strict(),
    handler: async ({ packageName, editId, language }) => {
      const res = await publisher().edits.listings.get({
        packageName,
        editId,
        language,
      });
      return res.data;
    },
  }),

  defineTool({
    name: "listings_update",
    description:
      "Full replacement update of a locale listing. Fields: title (30), shortDescription (80), fullDescription (4000), video (YouTube URL).",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        language: languageArg,
        title: z.string().optional(),
        shortDescription: z.string().optional(),
        fullDescription: z.string().optional(),
        video: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, language, ...body }) => {
      const res = await publisher().edits.listings.update({
        packageName,
        editId,
        language,
        requestBody: { ...body, language },
      });
      return res.data;
    },
  }),

  defineTool({
    name: "listings_patch",
    description: "Partial update — unspecified fields preserved.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        language: languageArg,
        title: z.string().optional(),
        shortDescription: z.string().optional(),
        fullDescription: z.string().optional(),
        video: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, language, ...body }) => {
      const res = await publisher().edits.listings.patch({
        packageName,
        editId,
        language,
        requestBody: { ...body, language },
      });
      return res.data;
    },
  }),

  defineTool({
    name: "listings_delete",
    description: "Delete the listing for one locale.",
    input: z
      .object({ packageName: packageNameArg, editId: editIdArg, language: languageArg })
      .strict(),
    handler: async ({ packageName, editId, language }) => {
      await publisher().edits.listings.delete({ packageName, editId, language });
      return { ok: true };
    },
  }),

  defineTool({
    name: "listings_delete_all",
    description: "Delete ALL locale listings in this edit. Irreversible within the edit.",
    input: z.object({ packageName: packageNameArg, editId: editIdArg }).strict(),
    handler: async ({ packageName, editId }) => {
      await publisher().edits.listings.deleteall({ packageName, editId });
      return { ok: true };
    },
  }),
];
