import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { publisher, publisherAny } from "../auth/client-factory.js";
import { packageNameArg } from "../utils/schemas.js";

/**
 * orders + externaltransactions.
 *
 * Orders: any payment including one-time, subscription renewals,
 * refunds. May-2025 added `get` and `batchGet`; Nov-2025 added
 * `offerPhaseDetails` field.
 *
 * External Transactions: Alternative Billing (Korea etc.) — developer
 * reports transactions processed outside Play.
 */
export const orderTools: Tool[] = [
  // ---------- orders ----------
  defineTool({
    name: "orders_list",
    description:
      "List orders within a time window. Returns OrderId, productId, purchase state, quantity, offerPhaseDetails.",
    input: z
      .object({
        packageName: packageNameArg,
        maxResults: z.number().int().optional(),
        pageToken: z.string().optional(),
        startTime: z
          .string()
          .optional()
          .describe("ISO-8601 timestamp; inclusive lower bound"),
        endTime: z.string().optional(),
        orderIds: z.array(z.string()).optional(),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisherAny()).orders.list(args);
      return res.data;
    },
  }),
  defineTool({
    name: "orders_get",
    description: "Get one order by order id.",
    input: z
      .object({ packageName: packageNameArg, orderId: z.string() })
      .strict(),
    handler: async (args) => {
      const res = await (await publisherAny()).orders.get(args);
      return res.data;
    },
  }),
  defineTool({
    name: "orders_batch_get",
    description: "Get up to 100 orders in one call.",
    input: z
      .object({
        packageName: packageNameArg,
        orderIds: z.array(z.string()),
      })
      .strict(),
    handler: async (args) => {
      const res = await (await publisherAny()).orders.batchGet(args);
      return res.data;
    },
  }),
  defineTool({
    name: "orders_refund",
    description:
      "Refund an order. Pass `revoke=true` to also cancel the entitlement (subscription) or consumable.",
    input: z
      .object({
        packageName: packageNameArg,
        orderId: z.string(),
        revoke: z.boolean().optional(),
      })
      .strict(),
    handler: async ({ packageName, orderId, revoke }) => {
      const res = await (await publisher()).orders.refund({ packageName, orderId, revoke });
      return res.data;
    },
  }),

  // ---------- externaltransactions ----------
  defineTool({
    name: "external_transactions_get",
    description: "Get an external transaction (Alternative Billing).",
    input: z
      .object({
        parent: z.string().describe("Format: applications/{packageName}"),
        externalTransactionId: z.string(),
      })
      .strict(),
    handler: async ({ parent, externalTransactionId }) => {
      const res = await (await publisher()).externaltransactions.getexternaltransaction({
        name: `${parent}/externalTransactions/${externalTransactionId}`,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "external_transactions_create",
    description: "Register a new external transaction (Alternative Billing).",
    input: z
      .object({
        parent: z.string().describe("Format: applications/{packageName}"),
        externalTransactionId: z.string(),
        transaction: z.record(z.any()).describe("ExternalTransaction resource body"),
      })
      .strict(),
    handler: async ({ parent, externalTransactionId, transaction }) => {
      const res = await (await publisher()).externaltransactions.createexternaltransaction({
        parent,
        externalTransactionId,
        requestBody: transaction,
      });
      return res.data;
    },
  }),
  defineTool({
    name: "external_transactions_refund",
    description: "Report a refund on an external transaction.",
    input: z
      .object({
        parent: z.string().describe("Format: applications/{packageName}"),
        externalTransactionId: z.string(),
        refund: z.record(z.any()),
      })
      .strict(),
    handler: async ({ parent, externalTransactionId, refund }) => {
      const res = await (await publisher()).externaltransactions.refundexternaltransaction({
        name: `${parent}/externalTransactions/${externalTransactionId}`,
        requestBody: refund,
      });
      return res.data;
    },
  }),
];
