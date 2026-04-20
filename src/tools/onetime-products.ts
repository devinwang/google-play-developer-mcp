import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher, publisherAny } from "../auth/client-factory.js";
import { packageNameArg, productIdArg } from "../utils/schemas.js";

/**
 * monetization.onetimeproducts — the new (2025+) catalog API for
 * non-subscription products. Replaces the deprecated `inappproducts`
 * endpoint. Uses a three-level hierarchy:
 *   one-time product (what the user is buying)
 *     └─ purchase option (how they buy it: one-off, rent, discount)
 *          └─ offer (promotional price on a purchase option)
 */
export const onetimeProductTools: Tool[] = [
  // ---------- onetimeproducts ----------
  defineTool({
    name: "onetime_products_list",
    description: "List all one-time products.",
    input: z
      .object({
        packageName: packageNameArg,
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await publisher().monetization.onetimeproducts.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_products_get",
    description: "Get a single one-time product.",
    input: z
      .object({ packageName: packageNameArg, productId: productIdArg })
      .strict(),
    handler: async (args) => {
      const res = await publisher().monetization.onetimeproducts.get(args);
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_products_create",
    description: "Create a one-time product. Pass the full OneTimeProduct body.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        product: z.record(z.any()).describe("OneTimeProduct resource body"),
        regionsVersion: z.record(z.any()).optional(),
      })
      .strict(),
    handler: async ({ packageName, productId, product, regionsVersion }) => {
      const res = await publisherAny().monetization.onetimeproducts.patch({
        packageName,
        productId,
        requestBody: product,
        regionsVersion,
        allowMissing: true,
        latencyTolerance: "PRODUCT_UPDATE_LATENCY_TOLERANCE_LATENCY_TOLERANT",
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_products_update",
    description: "Update a one-time product (patch semantics, with updateMask).",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        product: z.record(z.any()),
        updateMask: z.string().optional(),
        regionsVersion: z.record(z.any()).optional(),
        latencyTolerance: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, productId, product, updateMask, regionsVersion, latencyTolerance }) => {
      const res = await publisherAny().monetization.onetimeproducts.patch({
        packageName,
        productId,
        updateMask,
        requestBody: product,
        regionsVersion,
        latencyTolerance,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_products_delete",
    description: "Delete a one-time product.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        latencyTolerance: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      await publisher().monetization.onetimeproducts.delete(args);
      return { ok: true };
    },
  }),
  defineTool({
    name: "onetime_products_batch_get",
    description: "Fetch up to 100 one-time products in one call.",
    input: z
      .object({
        packageName: packageNameArg,
        productIds: z.array(z.string()),
      })
      .strict(),
    handler: async ({ packageName, productIds }) => {
      const res = await publisher().monetization.onetimeproducts.batchGet({
        packageName,
        productIds,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_products_batch_update",
    description: "Update up to 100 one-time products in one call.",
    input: z
      .object({
        packageName: packageNameArg,
        requests: z
          .array(z.record(z.any()))
          .describe("Array of UpdateOneTimeProductRequest"),
      })
      .strict(),
    handler: async ({ packageName, requests }) => {
      const res = await publisher().monetization.onetimeproducts.batchUpdate({
        packageName,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_products_batch_delete",
    description: "Delete up to 100 one-time products in one call.",
    input: z
      .object({
        packageName: packageNameArg,
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, requests }) => {
      const res = await publisher().monetization.onetimeproducts.batchDelete({
        packageName,
        requestBody: { requests },
      });
      return res.data;
    },
  }),

  // ---------- onetimeproducts.purchaseOptions ----------
  defineTool({
    name: "onetime_product_purchase_options_batch_update",
    description: "Update or create up to 100 purchase options for a one-time product.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, requests }) => {
      const res = await publisherAny().monetization.onetimeproducts.purchaseOptions.batchUpdate({
        packageName,
        productId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_product_purchase_options_batch_update_states",
    description: "Activate or deactivate up to 100 purchase options in one call.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, requests }) => {
      const res = await publisher().monetization.onetimeproducts.purchaseOptions.batchUpdateStates({
        packageName,
        productId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_product_purchase_options_batch_delete",
    description: "Delete up to 100 purchase options.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, requests }) => {
      const res = await publisher().monetization.onetimeproducts.purchaseOptions.batchDelete({
        packageName,
        productId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),

  // ---------- onetimeproducts.purchaseOptions.offers ----------
  defineTool({
    name: "onetime_product_offers_list",
    description:
      "List offers attached to a purchase option. `purchaseOptionId` is required — use '-' to list across all options.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        purchaseOptionId: z.string(),
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, productId, purchaseOptionId, pageSize, pageToken }) => {
      const res = await publisher().monetization.onetimeproducts.purchaseOptions.offers.list({
        packageName,
        productId,
        purchaseOptionId,
        pageSize,
        pageToken,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_product_offers_get",
    description: "Get one offer on a purchase option.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        purchaseOptionId: z.string(),
        offerId: z.string(),
      })
      .strict(),
    handler: async (args) => {
      const res = await publisherAny().monetization.onetimeproducts.purchaseOptions.offers.get(args);
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_product_offers_batch_get",
    description: "Batch-get up to 100 offers.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        purchaseOptionId: z.string(),
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, purchaseOptionId, requests }) => {
      const res = await publisher().monetization.onetimeproducts.purchaseOptions.offers.batchGet({
        packageName,
        productId,
        purchaseOptionId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_product_offers_batch_update",
    description: "Batch-update up to 100 offers (creates or updates).",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        purchaseOptionId: z.string(),
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, purchaseOptionId, requests }) => {
      const res = await publisher().monetization.onetimeproducts.purchaseOptions.offers.batchUpdate({
        packageName,
        productId,
        purchaseOptionId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_product_offers_batch_update_states",
    description: "Activate/deactivate/cancel up to 100 offers.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        purchaseOptionId: z.string(),
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, purchaseOptionId, requests }) => {
      const res = await publisher().monetization.onetimeproducts.purchaseOptions.offers.batchUpdateStates({
        packageName,
        productId,
        purchaseOptionId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "onetime_product_offers_batch_delete",
    description: "Delete up to 100 offers.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        purchaseOptionId: z.string(),
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, purchaseOptionId, requests }) => {
      const res = await publisher().monetization.onetimeproducts.purchaseOptions.offers.batchDelete({
        packageName,
        productId,
        purchaseOptionId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
];
