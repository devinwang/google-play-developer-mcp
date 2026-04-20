import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher, publisherAny } from "../auth/client-factory.js";
import { packageNameArg, productIdArg } from "../utils/schemas.js";

/**
 * monetization.subscriptions — catalog for subscription products.
 * Three-level hierarchy:
 *   Subscription (product id + region-level listings)
 *     └─ BasePlan (monthly / annual; each has a price per region)
 *          └─ Offer (free trial / discount bound to a base plan)
 */
export const subscriptionTools: Tool[] = [
  // ---------- subscriptions ----------
  defineTool({
    name: "subscriptions_list",
    description: "List all subscriptions.",
    input: z
      .object({
        packageName: packageNameArg,
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
        showArchived: z.boolean().optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).monetization.subscriptions.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "subscriptions_get",
    description: "Get a single subscription.",
    input: z
      .object({ packageName: packageNameArg, productId: productIdArg })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).monetization.subscriptions.get(args);
      return res.data;
    },
  }),
  defineTool({
    name: "subscriptions_create",
    description: "Create a subscription.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        subscription: z.record(z.any()).describe("Subscription resource body"),
        regionsVersion: z.record(z.any()).optional(),
      })
      .strict(),
    handler: async ({ packageName, productId, subscription, regionsVersion }) => {
      const res = await (await publisherAny()).monetization.subscriptions.create({
        packageName,
        productId,
        requestBody: subscription,
        regionsVersion,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscriptions_update",
    description: "Patch-update a subscription. Pass `updateMask` to limit the fields updated.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        subscription: z.record(z.any()),
        updateMask: z.string().optional(),
        regionsVersion: z.record(z.any()).optional(),
        latencyTolerance: z.string().optional(),
        allowMissing: z.boolean().optional(),
      })
      .strict(),
    handler: async ({ packageName, productId, subscription, ...rest }) => {
      const res = await (await publisher()).monetization.subscriptions.patch({
        packageName,
        productId,
        requestBody: subscription,
        ...rest,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscriptions_delete",
    description: "Delete a subscription. Only works on subscriptions with no active base plans/offers.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        latencyTolerance: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      await (await publisher()).monetization.subscriptions.delete(args);
      return { ok: true };
    },
  }),
  defineTool({
    name: "subscriptions_archive",
    description:
      "Archive a subscription. Archived subscriptions are hidden from new purchases but existing subscribers keep access.",
    input: z
      .object({ packageName: packageNameArg, productId: productIdArg })
      .strict(),
    handler: async ({ packageName, productId }) => {
      const res = await (await publisher()).monetization.subscriptions.archive({
        packageName,
        productId,
        requestBody: {},
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscriptions_batch_get",
    description: "Get up to 100 subscriptions in one call.",
    input: z
      .object({
        packageName: packageNameArg,
        productIds: z.array(z.string()),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).monetization.subscriptions.batchGet(args);
      return res.data;
    },
  }),
  defineTool({
    name: "subscriptions_batch_update",
    description: "Update up to 100 subscriptions in one call.",
    input: z
      .object({
        packageName: packageNameArg,
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, requests }) => {
      const res = await (await publisher()).monetization.subscriptions.batchUpdate({
        packageName,
        requestBody: { requests },
      });
      return res.data;
    },
  }),

  // ---------- subscriptions.basePlans ----------
  defineTool({
    name: "subscription_base_plans_activate",
    description: "Activate a base plan — starts making it available for purchase.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.activate({
        packageName,
        productId,
        basePlanId,
        requestBody: {},
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_base_plans_deactivate",
    description: "Deactivate a base plan — no new purchases; existing subscribers unaffected.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.deactivate({
        packageName,
        productId,
        basePlanId,
        requestBody: {},
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_base_plans_delete",
    description: "Delete a base plan (must be inactive).",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
      })
      .strict(),
    handler: async (args) => {
      await (await publisher()).monetization.subscriptions.basePlans.delete(args);
      return { ok: true };
    },
  }),
  defineTool({
    name: "subscription_base_plans_migrate_prices",
    description: "Apply a price change to existing subscribers of a base plan in specific regions.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        regionalPriceMigrations: z.array(z.record(z.any())),
        regionsVersion: z.record(z.any()).optional(),
        latencyTolerance: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId, ...body }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.migratePrices({
        packageName,
        productId,
        basePlanId,
        requestBody: body,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_base_plans_batch_migrate_prices",
    description: "Migrate prices on up to 100 base plans in one call.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, requests }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.batchMigratePrices({
        packageName,
        productId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_base_plans_batch_update",
    description: "Upsert up to 100 base plans.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, requests }) => {
      const res = await (await publisherAny()).monetization.subscriptions.basePlans.batchUpdate({
        packageName,
        productId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_base_plans_batch_update_states",
    description: "Activate/deactivate up to 100 base plans.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, requests }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.batchUpdateStates({
        packageName,
        productId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),

  // ---------- subscriptions.basePlans.offers ----------
  defineTool({
    name: "subscription_offers_list",
    description: "List offers for a base plan. `basePlanId` supports '-' wildcard to list across all.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.offers.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_offers_get",
    description: "Get a single offer.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        offerId: z.string(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.offers.get(args);
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_offers_create",
    description: "Create an offer on a base plan (free trial, intro pricing, etc.).",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        offerId: z.string(),
        offer: z.record(z.any()),
        regionsVersion: z.record(z.any()).optional(),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId, offerId, offer, regionsVersion }) => {
      const res = await (await publisherAny()).monetization.subscriptions.basePlans.offers.create({
        packageName,
        productId,
        basePlanId,
        offerId,
        regionsVersion,
        requestBody: offer,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_offers_update",
    description: "Patch-update an offer.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        offerId: z.string(),
        offer: z.record(z.any()),
        updateMask: z.string().optional(),
        regionsVersion: z.record(z.any()).optional(),
        allowMissing: z.boolean().optional(),
        latencyTolerance: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId, offerId, offer, ...rest }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.offers.patch({
        packageName,
        productId,
        basePlanId,
        offerId,
        requestBody: offer,
        ...rest,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_offers_delete",
    description: "Delete an offer.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        offerId: z.string(),
      })
      .strict(),
    handler: async (args) => {
      await (await publisher()).monetization.subscriptions.basePlans.offers.delete(args);
      return { ok: true };
    },
  }),
  defineTool({
    name: "subscription_offers_activate",
    description: "Activate an offer — starts making it available for purchase.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        offerId: z.string(),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId, offerId }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.offers.activate({
        packageName,
        productId,
        basePlanId,
        offerId,
        requestBody: {},
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_offers_deactivate",
    description: "Deactivate an offer.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        offerId: z.string(),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId, offerId }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.offers.deactivate({
        packageName,
        productId,
        basePlanId,
        offerId,
        requestBody: {},
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_offers_batch_get",
    description: "Batch-get up to 100 offers.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId, requests }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.offers.batchGet({
        packageName,
        productId,
        basePlanId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_offers_batch_update",
    description: "Upsert up to 100 offers.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId, requests }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.offers.batchUpdate({
        packageName,
        productId,
        basePlanId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),
  defineTool({
    name: "subscription_offers_batch_update_states",
    description: "Activate/deactivate up to 100 offers.",
    input: z
      .object({
        packageName: packageNameArg,
        productId: productIdArg,
        basePlanId: z.string(),
        requests: z.array(z.record(z.any())),
      })
      .strict(),
    handler: async ({ packageName, productId, basePlanId, requests }) => {
      const res = await (await publisher()).monetization.subscriptions.basePlans.offers.batchUpdateStates({
        packageName,
        productId,
        basePlanId,
        requestBody: { requests },
      });
      return res.data;
    },
  }),

  // ---------- convert region prices (monetization-level helper) ----------
  defineTool({
    name: "monetization_convert_region_prices",
    description:
      "Utility: convert a price in one region to comparable prices in every other region. Use before setting prices on a base plan.",
    input: z
      .object({
        packageName: packageNameArg,
        price: z.record(z.any()).describe("Money resource: currencyCode + units/nanos"),
      })
      .strict(),
    handler: async ({ packageName, price }) => {
      const res = await (await publisher()).monetization.convertRegionPrices({
        packageName,
        requestBody: { price },
      });
      return res.data;
    },
  }),
];
