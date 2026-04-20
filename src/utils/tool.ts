import { z } from "zod";
import { toJsonSchema } from "./schemas.js";
import { handler, type ToolResult } from "./mcp.js";

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handle: (args: unknown) => Promise<ToolResult>;
}

/**
 * Define a tool from a zod schema + typed handler. The wrapper also
 * validates arguments at runtime so bad calls produce a clean error
 * rather than a TypeError somewhere deep in googleapis.
 */
export function defineTool<Schema extends z.ZodTypeAny>(config: {
  name: string;
  description: string;
  input: Schema;
  handler: (args: z.infer<Schema>) => Promise<unknown>;
}): Tool {
  const safe = handler(async (args: unknown) => {
    const parsed = config.input.parse(args ?? {});
    return config.handler(parsed);
  });
  return {
    name: config.name,
    description: config.description,
    inputSchema: toJsonSchema(config.input),
    handle: safe,
  };
}
