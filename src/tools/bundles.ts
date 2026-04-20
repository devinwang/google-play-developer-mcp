import fs from "node:fs";
import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher } from "../auth/client-factory.js";
import { packageNameArg, editIdArg } from "../utils/schemas.js";

/**
 * Covers edits.bundles (AAB), edits.apks (legacy APK uploads + external
 * hosting), edits.deobfuscationfiles (ProGuard mapping), and
 * edits.expansionfiles (OBB, for apps still shipping expansion data).
 */
export const bundleTools: Tool[] = [
  // ---------- bundles ----------
  defineTool({
    name: "bundles_list",
    description: "List all AAB uploads in the current edit.",
    input: z.object({ packageName: packageNameArg, editId: editIdArg }).strict(),
    handler: async ({ packageName, editId }) => {
      const res = await publisher().edits.bundles.list({ packageName, editId });
      return res.data;
    },
  }),
  defineTool({
    name: "bundles_upload",
    description:
      "Upload a new App Bundle (.aab). Returns versionCode and sha256. Commit the edit separately to publish to a track.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        file: z.string().describe("Absolute path to the .aab file"),
        ackBundleInstallationWarning: z.boolean().optional(),
        deviceTierConfigId: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, file, ...rest }) => {
      if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
      const res = await publisher().edits.bundles.upload({
        packageName,
        editId,
        ackBundleInstallationWarning: rest.ackBundleInstallationWarning,
        deviceTierConfigId: rest.deviceTierConfigId,
        media: {
          mimeType: "application/octet-stream",
          body: fs.createReadStream(file),
        },
      });
      return res.data;
    },
  }),

  // ---------- apks ----------
  defineTool({
    name: "apks_list",
    description: "List all APK uploads in the edit.",
    input: z.object({ packageName: packageNameArg, editId: editIdArg }).strict(),
    handler: async ({ packageName, editId }) => {
      const res = await publisher().edits.apks.list({ packageName, editId });
      return res.data;
    },
  }),
  defineTool({
    name: "apks_upload",
    description: "Upload a new APK. Prefer AAB via `bundles_upload`.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        file: z.string().describe("Absolute path to the .apk file"),
      })
      .strict(),
    handler: async ({ packageName, editId, file }) => {
      if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
      const res = await publisher().edits.apks.upload({
        packageName,
        editId,
        media: {
          mimeType: "application/vnd.android.package-archive",
          body: fs.createReadStream(file),
        },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "apks_add_externally_hosted",
    description:
      "Register an APK that is hosted outside Google Play (enterprise-only, requires allowlist).",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        externallyHostedApk: z
          .record(z.any())
          .describe("ExternallyHostedApk resource body"),
      })
      .strict(),
    handler: async ({ packageName, editId, externallyHostedApk }) => {
      const res = await publisher().edits.apks.addexternallyhosted({
        packageName,
        editId,
        requestBody: { externallyHostedApk },
      });
      return res.data;
    },
  }),

  // ---------- deobfuscation files ----------
  defineTool({
    name: "deobfuscation_files_upload",
    description:
      "Upload a ProGuard mapping file for a specific version code. Use deobfuscationFileType='proguard' or 'nativeCode'.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        apkVersionCode: z.number().int(),
        deobfuscationFileType: z.enum(["proguard", "nativeCode"]),
        file: z.string().describe("Absolute path to the mapping file"),
      })
      .strict(),
    handler: async ({ packageName, editId, apkVersionCode, deobfuscationFileType, file }) => {
      if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
      const res = await publisher().edits.deobfuscationfiles.upload({
        packageName,
        editId,
        apkVersionCode,
        deobfuscationFileType,
        media: {
          mimeType: "application/octet-stream",
          body: fs.createReadStream(file),
        },
      });
      return res.data;
    },
  }),

  // ---------- expansion files (OBB) ----------
  defineTool({
    name: "expansion_files_get",
    description: "Get expansion file metadata for a version code.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        apkVersionCode: z.number().int(),
        expansionFileType: z.enum(["main", "patch"]),
      })
      .strict(),
    handler: async (args) => {
      const res = await publisher().edits.expansionfiles.get(args);
      return res.data;
    },
  }),
  defineTool({
    name: "expansion_files_upload",
    description: "Upload expansion file contents (OBB).",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        apkVersionCode: z.number().int(),
        expansionFileType: z.enum(["main", "patch"]),
        file: z.string(),
      })
      .strict(),
    handler: async ({ packageName, editId, apkVersionCode, expansionFileType, file }) => {
      if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
      const res = await publisher().edits.expansionfiles.upload({
        packageName,
        editId,
        apkVersionCode,
        expansionFileType,
        media: {
          mimeType: "application/octet-stream",
          body: fs.createReadStream(file),
        },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "expansion_files_update",
    description: "Full update of expansion file metadata.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        apkVersionCode: z.number().int(),
        expansionFileType: z.enum(["main", "patch"]),
        fileSize: z.string().optional(),
        referencesVersion: z.number().int().optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, apkVersionCode, expansionFileType, ...body }) => {
      const res = await publisher().edits.expansionfiles.update({
        packageName,
        editId,
        apkVersionCode,
        expansionFileType,
        requestBody: body,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "expansion_files_patch",
    description: "Partial update of expansion file metadata.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        apkVersionCode: z.number().int(),
        expansionFileType: z.enum(["main", "patch"]),
        fileSize: z.string().optional(),
        referencesVersion: z.number().int().optional(),
      })
      .strict(),
    handler: async ({ packageName, editId, apkVersionCode, expansionFileType, ...body }) => {
      const res = await publisher().edits.expansionfiles.patch({
        packageName,
        editId,
        apkVersionCode,
        expansionFileType,
        requestBody: body,
      });
      return res.data;
    },
  }),
];
