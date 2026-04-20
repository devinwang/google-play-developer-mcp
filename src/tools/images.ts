import fs from "node:fs";
import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher } from "../auth/client-factory.js";
import { packageNameArg, editIdArg, languageArg } from "../utils/schemas.js";

const imageType = z.enum([
  "featureGraphic",
  "icon",
  "phoneScreenshots",
  "promoGraphic",
  "sevenInchScreenshots",
  "tenInchScreenshots",
  "tvBanner",
  "tvScreenshots",
  "wearScreenshots",
]);

/**
 * edits.images — every visual asset on the listing. Uploads are
 * multipart; the googleapis client wants `media: { body: <stream> }`.
 * All image types are bounded per-locale.
 */
export const imageTools: Tool[] = [
  defineTool({
    name: "images_list",
    description: "List uploaded images for a specific type and locale.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        language: languageArg,
        imageType,
      })
      .strict(),
    handler: async ({ packageName, editId, language, imageType }) => {
      const res = await publisher().edits.images.list({
        packageName,
        editId,
        language,
        imageType,
      });
      return res.data;
    },
  }),

  defineTool({
    name: "images_upload",
    description:
      "Upload a new image. `file` is a local filesystem path. MIME is auto-detected from extension (png/jpg).",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        language: languageArg,
        imageType,
        file: z.string().describe("Absolute path to the image file"),
      })
      .strict(),
    handler: async ({ packageName, editId, language, imageType, file }) => {
      if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
      const ext = file.toLowerCase().split(".").pop();
      const mimeType =
        ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : "application/octet-stream";
      const res = await publisher().edits.images.upload({
        packageName,
        editId,
        language,
        imageType,
        media: { mimeType, body: fs.createReadStream(file) },
      });
      return res.data;
    },
  }),

  defineTool({
    name: "images_delete",
    description: "Delete a single image by id.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        language: languageArg,
        imageType,
        imageId: z.string(),
      })
      .strict(),
    handler: async (args) => {
      await publisher().edits.images.delete(args);
      return { ok: true };
    },
  }),

  defineTool({
    name: "images_delete_all",
    description: "Delete every image of a given type in one locale.",
    input: z
      .object({
        packageName: packageNameArg,
        editId: editIdArg,
        language: languageArg,
        imageType,
      })
      .strict(),
    handler: async (args) => {
      const res = await publisher().edits.images.deleteall(args);
      return res.data;
    },
  }),
];
