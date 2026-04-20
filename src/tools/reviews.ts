import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher } from "../auth/client-factory.js";
import { packageNameArg } from "../utils/schemas.js";

/**
 * reviews — public Play Store reviews. Developer can list and reply.
 * Only the latest 7 days of reviews are returned by list.
 */
export const reviewTools: Tool[] = [
  defineTool({
    name: "reviews_list",
    description:
      "List reviews from the last 7 days. Use token from the previous page for pagination. Optional filters: language, translationLanguage, device.",
    input: z
      .object({
        packageName: packageNameArg,
        maxResults: z.number().int().optional(),
        startIndex: z.number().int().optional(),
        token: z.string().optional(),
        translationLanguage: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).reviews.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "reviews_get",
    description: "Get a single review by id.",
    input: z
      .object({
        packageName: packageNameArg,
        reviewId: z.string(),
        translationLanguage: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).reviews.get(args);
      return res.data;
    },
  }),
  defineTool({
    name: "reviews_reply",
    description: "Post a public reply to a review. Replies can be edited by calling this again.",
    input: z
      .object({
        packageName: packageNameArg,
        reviewId: z.string(),
        replyText: z.string(),
      })
      .strict(),
    handler: async ({ packageName, reviewId, replyText }) => {
      const res = await (await publisher()).reviews.reply({
        packageName,
        reviewId,
        requestBody: { replyText },
      });
      return res.data;
    },
  }),
];
