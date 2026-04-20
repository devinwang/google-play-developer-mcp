import { z } from "zod";

/**
 * Shared argument fragments. Keeping them in one place lets us evolve
 * naming in lockstep and stops copy/paste drift between ~130 tool
 * definitions.
 */
export const packageNameArg = z
  .string()
  .describe("Android application package name, e.g. com.example.app");

export const editIdArg = z
  .string()
  .describe("Edit id returned by `edits_insert` — required for all edits.* writes");

export const languageArg = z
  .string()
  .describe("BCP-47 locale, e.g. en-US, fr-FR, zh-Hans");

export const productIdArg = z
  .string()
  .describe("Product id / SKU — stable identifier you assign in Play Console");

export const trackArg = z
  .string()
  .describe(
    "Track name: internal, alpha, beta, production — or a custom closed-testing track id",
  );

export const purchaseTokenArg = z
  .string()
  .describe("Purchase token returned by the Play Billing library");

export const optionalAutoCommit = z
  .boolean()
  .optional()
  .describe("Default true. When true, the MCP opens an edit, applies the change, and commits.");

/**
 * Convert a zod schema to MCP's JSON Schema representation. The SDK
 * accepts JSON Schema but zod is nicer to write; json-schema isn't a
 * dependency so we roll a tiny subset that covers our tools.
 */
export function toJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  return zodNode(schema);
}

function zodNode(node: z.ZodTypeAny): Record<string, unknown> {
  const def = (node as { _def: { typeName?: string; description?: string } })
    ._def;
  const description = node.description;
  const base: Record<string, unknown> = {};
  if (description) base.description = description;

  switch (def.typeName) {
    case "ZodString":
      return { ...base, type: "string" };
    case "ZodNumber":
      return { ...base, type: "number" };
    case "ZodBoolean":
      return { ...base, type: "boolean" };
    case "ZodArray": {
      const inner = (node as unknown as { element: z.ZodTypeAny }).element;
      return { ...base, type: "array", items: zodNode(inner) };
    }
    case "ZodObject": {
      const shape = (
        node as unknown as { shape: Record<string, z.ZodTypeAny> }
      ).shape;
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = zodNode(value);
        if (!(value as unknown as { isOptional: () => boolean }).isOptional()) {
          required.push(key);
        }
      }
      return {
        ...base,
        type: "object",
        properties,
        required,
        additionalProperties: false,
      };
    }
    case "ZodOptional":
    case "ZodDefault":
    case "ZodNullable":
      return zodNode(
        (node as unknown as { unwrap: () => z.ZodTypeAny }).unwrap(),
      );
    case "ZodEnum": {
      const values = (node as unknown as { _def: { values: string[] } })._def
        .values;
      return { ...base, type: "string", enum: values };
    }
    case "ZodLiteral": {
      const value = (
        node as unknown as { _def: { value: unknown } }
      )._def.value;
      return { ...base, const: value };
    }
    case "ZodRecord":
      return { ...base, type: "object", additionalProperties: true };
    case "ZodAny":
    case "ZodUnknown":
      return { ...base };
    case "ZodUnion": {
      const options = (
        node as unknown as { _def: { options: z.ZodTypeAny[] } }
      )._def.options;
      return { ...base, anyOf: options.map(zodNode) };
    }
    default:
      return { ...base };
  }
}
