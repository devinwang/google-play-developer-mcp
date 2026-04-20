import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher, publisherAny } from "../auth/client-factory.js";
import { packageNameArg, purchaseTokenArg, productIdArg } from "../utils/schemas.js";

/**
 * Purchase verification — what the backend calls to check whether a
 * user has entitlement, and to acknowledge/refund/revoke purchases.
 *
 * All latest-gen endpoints:
 *   • purchases.productsv2  (replaces purchases.products)
 *   • purchases.subscriptionsv2  (replaces purchases.subscriptions)
 *     — with 2025-2026 features: cancel/defer/revoke, OfferPhase,
 *       outOfAppPurchaseContext, price step-up consent.
 *   • purchases.voidedpurchases — chargeback/refund feed.
 */
export const purchaseTools: Tool[] = [
  // ---------- purchases.productsv2 ----------
  defineTool({
    name: "purchases_products_v2_get",
    description:
      "Get current state of a one-time product purchase. Supports multiple purchase options + offers (replaces legacy purchases.products).",
    input: z
      .object({ packageName: packageNameArg, token: purchaseTokenArg })
      .strict(),
    handler: async ({ packageName, token }) => {
      const res = await (await publisher()).purchases.productsv2.getproductpurchasev2({
        packageName,
        token,
      });
      return res.data;
    },
  }),

  // ---------- purchases.subscriptionsv2 ----------
  defineTool({
    name: "purchases_subscriptions_v2_get",
    description:
      "Get full state of a subscription purchase (SubscriptionPurchaseV2). Includes OfferPhase (2026), outOfAppPurchaseContext, latestSuccessfulOrderId, priceChangeState, priceStepUpConsentDetails.",
    input: z
      .object({ packageName: packageNameArg, token: purchaseTokenArg })
      .strict(),
    handler: async ({ packageName, token }) => {
      const res = await (await publisher()).purchases.subscriptionsv2.get({
        packageName,
        token,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "purchases_subscriptions_v2_revoke",
    description:
      "Revoke a subscription (refund + terminate access). 2025-05 added `itemBasedRefund` option for per-item refunds.",
    input: z
      .object({
        packageName: packageNameArg,
        token: purchaseTokenArg,
        revocationContext: z
          .record(z.any())
          .optional()
          .describe("RevocationContext — e.g. { proratedRefund: {}, fullRefund: {}, itemBasedRefund: {} }"),
      })
      .strict(),
    handler: async ({ packageName, token, revocationContext }) => {
      const res = await (await publisher()).purchases.subscriptionsv2.revoke({
        packageName,
        token,
        requestBody: revocationContext ? { revocationContext } : {},
      });
      return res.data;
    },
  }),
  defineTool({
    name: "purchases_subscriptions_v2_cancel",
    description:
      "Cancel a subscription (2025-09+). `cancellationType`: USER_REQUESTED, DEVELOPER_REQUESTED, or SYSTEM_INITIATED.",
    input: z
      .object({
        packageName: packageNameArg,
        token: purchaseTokenArg,
        cancellationType: z
          .enum(["USER_REQUESTED", "DEVELOPER_REQUESTED", "SYSTEM_INITIATED"])
          .optional(),
        cancelSurveyReason: z.record(z.any()).optional(),
      })
      .strict(),
    handler: async ({ packageName, token, ...body }) => {
      const res = await (await publisherAny()).purchases.subscriptionsv2.cancel({
        packageName,
        token,
        requestBody: body,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "purchases_subscriptions_v2_defer",
    description:
      "Defer billing for a subscription (2026-01 supports subscriptions with add-ons too). Pass DeferralInfo with expectedExpiryTime + desiredExpiryTime.",
    input: z
      .object({
        packageName: packageNameArg,
        token: purchaseTokenArg,
        deferralInfo: z.record(z.any()),
      })
      .strict(),
    handler: async ({ packageName, token, deferralInfo }) => {
      const res = await (await publisherAny()).purchases.subscriptionsv2.defer({
        packageName,
        token,
        requestBody: { deferralInfo },
      });
      return res.data;
    },
  }),

  // ---------- purchases.subscriptions (v1) — acknowledge only, still supported ----------
  defineTool({
    name: "purchases_subscriptions_acknowledge",
    description:
      "Acknowledge a subscription purchase. 2025-11+ accepts optional `externalAccountId` for account-linking. (v1 endpoint retained for compatibility.)",
    input: z
      .object({
        packageName: packageNameArg,
        subscriptionId: z
          .string()
          .optional()
          .describe("Optional since 2025-05; recommended to pass."),
        token: purchaseTokenArg,
        developerPayload: z.string().optional(),
        externalAccountId: z.string().optional(),
      })
      .strict(),
    handler: async ({ packageName, subscriptionId, token, ...body }) => {
      const res = await (await publisher()).purchases.subscriptions.acknowledge({
        packageName,
        subscriptionId: subscriptionId ?? "-",
        token,
        requestBody: body,
      });
      return res.data;
    },
  }),

  // ---------- purchases.voidedpurchases ----------
  defineTool({
    name: "purchases_voided_list",
    description:
      "List voided purchases (refunded/charged-back). Supports filtering by time range + voided source.",
    input: z
      .object({
        packageName: packageNameArg,
        maxResults: z.number().int().optional(),
        startIndex: z.number().int().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        token: z.string().optional(),
        includeQuantityBasedPartialRefunds: z.boolean().optional(),
        type: z.number().int().optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisher()).purchases.voidedpurchases.list(args);
      return res.data;
    },
  }),
];
