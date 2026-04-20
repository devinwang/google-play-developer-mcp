import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher } from "../auth/client-factory.js";
import { packageNameArg, editIdArg } from "../utils/schemas.js";

/**
 * Raw Edits operations. Every write on the Android Publisher API runs
 * in the context of an edit: insert → modify via edits.* → commit.
 * These tools expose that lifecycle directly so the caller can hold an
 * edit open across many tool calls (the most common multi-step flow).
 */
export const editTools: Tool[] = [
  defineTool({
    name: "edits_insert",
    description:
      "Open a new edit session for an app. Returns the edit id plus its expiry. Subsequent edits.* tool calls must pass this id.",
    input: z.object({ packageName: packageNameArg }).strict(),
    handler: async ({ packageName }) => {
      const res = await publisher().edits.insert({ packageName, requestBody: {} });
      return res.data;
    },
  }),

  defineTool({
    name: "edits_get",
    description: "Fetch an existing edit — useful to check expiry before work.",
    input: z.object({ packageName: packageNameArg, editId: editIdArg }).strict(),
    handler: async ({ packageName, editId }) => {
      const res = await publisher().edits.get({ packageName, editId });
      return res.data;
    },
  }),

  defineTool({
    name: "edits_validate",
    description: "Validate an edit without committing. Catches schema/media errors before you publish.",
    input: z.object({ packageName: packageNameArg, editId: editIdArg }).strict(),
    handler: async ({ packageName, editId }) => {
      const res = await publisher().edits.validate({ packageName, editId });
      return res.data;
    },
  }),

  defineTool({
    name: "edits_commit",
    description:
      "Commit and publish all changes in the edit. Pass changesNotSentForReview=true to skip automatic review submission.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        changesNotSentForReview: z.boolean().optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, changesNotSentForReview }) => {
      const res = await publisher().edits.commit({
        packageName,
        editId,
        changesNotSentForReview,
      });
      return res.data;
    },
  }),

  defineTool({
    name: "edits_delete",
    description: "Abandon an edit. All pending changes are discarded.",
    input: z.object({ packageName: packageNameArg, editId: editIdArg }).strict(),
    handler: async ({ packageName, editId }) => {
      await publisher().edits.delete({ packageName, editId });
      return { ok: true };
    },
  }),

  // ---------- edits.details ----------
  defineTool({
    name: "details_get",
    description: "Get app-level details (contact email/phone/website + default language).",
    input: z.object({ packageName: packageNameArg, editId: editIdArg }).strict(),
    handler: async ({ packageName, editId }) => {
      const res = await publisher().edits.details.get({ packageName, editId });
      return res.data;
    },
  }),
  defineTool({
    name: "details_update",
    description: "Overwrite app-level details. Full replacement — unspecified fields are cleared.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        contactWebsite: z.string().optional(),
        defaultLanguage: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, ...body }) => {
      const res = await publisher().edits.details.update({
        packageName,
        editId,
        requestBody: body,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "details_patch",
    description: "Partial update — only the provided fields change.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        contactWebsite: z.string().optional(),
        defaultLanguage: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, ...body }) => {
      const res = await publisher().edits.details.patch({
        packageName,
        editId,
        requestBody: body,
      });
      return res.data;
    },
  }),

  // ---------- edits.countryavailability ----------
  defineTool({
    name: "country_availability_get",
    description: "Fetch per-country availability for a given track within an edit.",
    input: z
      .object({ packageName: packageNameArg, editId: editIdArg, track: z.string() })
      .strict(),
    handler: async ({ packageName, editId, track }) => {
      const res = await publisher().edits.countryavailability.get({
        packageName,
        editId,
        track,
      });
      return res.data;
    },
  }),
];
