import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher } from "../auth/client-factory.js";
import { packageNameArg, editIdArg, trackArg } from "../utils/schemas.js";

/**
 * edits.tracks — the core release mechanism. A Track ("internal",
 * "alpha", "beta", "production", or a custom closed-testing id) holds
 * one or more Releases. Each Release has versionCodes, a status
 * (draft/inProgress/halted/completed), a userFraction for staged
 * rollouts, and optional release notes.
 *
 * edits.testers — control the allowlist for internal/closed tracks.
 *
 * applications.tracks.releases — outside the edits model, used to
 * read production traffic data (non-edit operations).
 */
export const trackTools: Tool[] = [
  defineTool({
    name: "tracks_list",
    description: "List every track visible in this edit (includes default internal/alpha/beta/production + any custom closed-testing tracks).",
    input: z.object({ packageName: packageNameArg, editId: editIdArg }).strict(),
    handler: async ({ packageName, editId }) => {
      const res = await publisher().edits.tracks.list({ packageName, editId });
      return res.data;
    },
  }),
  defineTool({
    name: "tracks_get",
    description: "Get one track — includes all releases currently staged.",
    input: z
      .object({ packageName: packageNameArg, editId: editIdArg, track: trackArg })
      .strict(),
    handler: async ({ packageName, editId, track }) => {
      const res = await publisher().edits.tracks.get({ packageName, editId, track });
      return res.data;
    },
  }),
  defineTool({
    name: "tracks_update",
    description:
      "Full replacement of track state. `releases` is an array of release objects — versionCodes, status (draft|inProgress|halted|completed), userFraction (0-1 for staged rollout), inAppUpdatePriority (0-5), countryTargeting, and releaseNotes.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        track: trackArg,
        releases: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, editId, track, releases }) => {
      const res = await publisher().edits.tracks.update({
        packageName,
        editId,
        track,
        requestBody: { track, releases },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "tracks_patch",
    description: "Partial update of track state.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        track: trackArg,
        releases: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, editId, track, releases }) => {
      const res = await publisher().edits.tracks.patch({
        packageName,
        editId,
        track,
        requestBody: { track, releases },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "tracks_create",
    description:
      "Create a brand-new custom closed-testing track. The new id is set on the server. Type can only be closedTesting.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        trackConfigurations: z.array(z.record(z.any())).optional(),
        track: z.string().describe("Id of the new track"),
        type: z.enum(["closedTesting"]).optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, ...body }) => {
      const res = await publisher().edits.tracks.create({
        packageName,
        editId,
        requestBody: body,
      });
      return res.data;
    },
  }),

  // ---------- testers ----------
  defineTool({
    name: "testers_get",
    description: "Get the current tester allowlist for a track.",
    input: z
      .object({ packageName: packageNameArg, editId: editIdArg, track: trackArg })
      .strict(),
    handler: async ({ packageName, editId, track }) => {
      const res = await publisher().edits.testers.get({ packageName, editId, track });
      return res.data;
    },
  }),
  defineTool({
    name: "testers_update",
    description: "Full replacement of the tester allowlist.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        track: trackArg,
        googleGroups: z.array(z.string()).optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, track, ...body }) => {
      const res = await publisher().edits.testers.update({
        packageName,
        editId,
        track,
        requestBody: body,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "testers_patch",
    description: "Partial update of the tester allowlist.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        track: trackArg,
        googleGroups: z.array(z.string()).optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, track, ...body }) => {
      const res = await publisher().edits.testers.patch({
        packageName,
        editId,
        track,
        requestBody: body,
      });
      return res.data;
    },
  }),
];
