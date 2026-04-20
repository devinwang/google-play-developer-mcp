import fs from "node:fs";
import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher } from "../auth/client-factory.js";
import { packageNameArg } from "../utils/schemas.js";

/**
 * Covers:
 *   • applications.deviceTierConfigs — device-tier targeting for AAB
 *   • apprecovery — app recovery actions (remote rollback-ish flows)
 *   • generatedapks — generated APKs from an AAB (download split APKs)
 *   • systemapks.variants — system APK variants for preloaded apps
 *   • internalappsharingartifacts — upload artifacts for internal link sharing
 */
export const distributionTools: Tool[] = [
  // ---------- deviceTierConfigs ----------
  defineTool({
    name: "device_tier_configs_list",
    description: "List all device-tier configs for an app.",
    input: z
      .object({
        packageName: packageNameArg,
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).applications.deviceTierConfigs.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "device_tier_configs_create",
    description: "Create a new device-tier config.",
    input: z
      .object({
        packageName: packageNameArg,
        deviceTierConfig: z.record(z.any()),
        allowUnknownDevices: z.boolean().optional(),
      })
      .strict(),
    handler: async ({ packageName, deviceTierConfig, allowUnknownDevices }) => {
      const res = await (await publisher()).applications.deviceTierConfigs.create({
        packageName,
        allowUnknownDevices,
        requestBody: deviceTierConfig,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "device_tier_configs_get",
    description: "Get a device-tier config by id.",
    input: z
      .object({
        packageName: packageNameArg,
        deviceTierConfigId: z.string(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).applications.deviceTierConfigs.get(args);
      return res.data;
    },
  }),

  // ---------- apprecovery ----------
  defineTool({
    name: "app_recovery_list",
    description: "List app recovery actions for a versionCode.",
    input: z
      .object({
        packageName: packageNameArg,
        versionCode: z.string(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).apprecovery.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "app_recovery_create",
    description: "Create an app recovery action.",
    input: z
      .object({
        packageName: packageNameArg,
        appRecoveryAction: z.record(z.any()),
      })
      .strict(),
    handler: async ({ packageName, appRecoveryAction }) => {
      const res = await (await publisher()).apprecovery.create({
        packageName,
        requestBody: appRecoveryAction,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "app_recovery_deploy",
    description: "Deploy an app recovery action to users.",
    input: z
      .object({
        packageName: packageNameArg,
        appRecoveryId: z.string(),
      })
      .strict(),
    handler: async ({ packageName, appRecoveryId }) => {
      const res = await (await publisher()).apprecovery.deploy({
        packageName,
        appRecoveryId,
        requestBody: {},
      });
      return res.data;
    },
  }),
  defineTool({
    name: "app_recovery_cancel",
    description: "Cancel an in-flight app recovery action.",
    input: z
      .object({
        packageName: packageNameArg,
        appRecoveryId: z.string(),
      })
      .strict(),
    handler: async ({ packageName, appRecoveryId }) => {
      const res = await (await publisher()).apprecovery.cancel({
        packageName,
        appRecoveryId,
        requestBody: {},
      });
      return res.data;
    },
  }),
  defineTool({
    name: "app_recovery_add_targeting",
    description: "Add targeting (country/locale/version) to an in-progress recovery action.",
    input: z
      .object({
        packageName: packageNameArg,
        appRecoveryId: z.string(),
        targetingUpdate: z.record(z.any()),
      })
      .strict(),
    handler: async ({ packageName, appRecoveryId, targetingUpdate }) => {
      const res = await (await publisher()).apprecovery.addTargeting({
        packageName,
        appRecoveryId,
        requestBody: targetingUpdate,
      });
      return res.data;
    },
  }),

  // ---------- generatedapks ----------
  defineTool({
    name: "generated_apks_list",
    description: "List generated (split + standalone) APKs for a given bundle versionCode.",
    input: z
      .object({
        packageName: packageNameArg,
        versionCode: z.number().int(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).generatedapks.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "generated_apks_download",
    description:
      "Download a specific generated APK. `downloadId` is the id from `generated_apks_list`. Returns the binary as a base64 string.",
    input: z
      .object({
        packageName: packageNameArg,
        versionCode: z.number().int(),
        downloadId: z.string(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).generatedapks.download(args, {
        responseType: "arraybuffer",
      });
      const buf = Buffer.from(res.data as ArrayBuffer);
      return { base64: buf.toString("base64"), bytes: buf.length };
    },
  }),

  // ---------- systemapks.variants ----------
  defineTool({
    name: "system_apks_variants_list",
    description: "List system APK variants created for a given versionCode.",
    input: z
      .object({
        packageName: packageNameArg,
        versionCode: z.string(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).systemapks.variants.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "system_apks_variants_create",
    description: "Create a new system APK variant for a versionCode.",
    input: z
      .object({
        packageName: packageNameArg,
        versionCode: z.string(),
        variant: z.record(z.any()),
      })
      .strict(),
    handler: async ({ packageName, versionCode, variant }) => {
      const res = await (await publisher()).systemapks.variants.create({
        packageName,
        versionCode,
        requestBody: variant,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "system_apks_variants_get",
    description: "Get a system APK variant.",
    input: z
      .object({
        packageName: packageNameArg,
        versionCode: z.string(),
        variantId: z.number().int(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).systemapks.variants.get(args);
      return res.data;
    },
  }),
  defineTool({
    name: "system_apks_variants_download",
    description: "Download a built system APK variant. Returns base64.",
    input: z
      .object({
        packageName: packageNameArg,
        versionCode: z.string(),
        variantId: z.number().int(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).systemapks.variants.download(args, {
        responseType: "arraybuffer",
      });
      const buf = Buffer.from(res.data as ArrayBuffer);
      return { base64: buf.toString("base64"), bytes: buf.length };
    },
  }),

  // ---------- internalappsharingartifacts ----------
  defineTool({
    name: "internal_app_sharing_upload_apk",
    description:
      "Upload an APK for internal app sharing. Returns a link you can distribute internally.",
    input: z
      .object({
        packageName: packageNameArg,
        file: z.string().describe("Absolute path to the .apk file"),
      })
      .strict(),
    handler: async ({ packageName, file }) => {
      if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
      const res = await (await publisher()).internalappsharingartifacts.uploadapk({
        packageName,
        media: {
          mimeType: "application/vnd.android.package-archive",
          body: fs.createReadStream(file),
        },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "internal_app_sharing_upload_bundle",
    description: "Upload an AAB for internal app sharing.",
    input: z
      .object({
        packageName: packageNameArg,
        file: z.string(),
      })
      .strict(),
    handler: async ({ packageName, file }) => {
      if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
      const res = await (await publisher()).internalappsharingartifacts.uploadbundle({
        packageName,
        media: {
          mimeType: "application/octet-stream",
          body: fs.createReadStream(file),
        },
      });
      return res.data;
    },
  }),
];
