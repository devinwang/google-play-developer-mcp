import { formatError } from "./errors.js";

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function ok(data: unknown): ToolResult {
  const text =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: "text", text }] };
}

export function fail(err: unknown): ToolResult {
  return {
    content: [{ type: "text", text: formatError(err) }],
    isError: true,
  };
}

/**
 * Wrap a handler so thrown errors become structured tool errors instead
 * of blowing up the MCP transport. Every tool goes through this.
 */
export function handler<Args, Ret>(
  fn: (args: Args) => Promise<Ret>,
): (args: Args) => Promise<ToolResult> {
  return async (args: Args) => {
    try {
      const result = await fn(args);
      return ok(result);
    } catch (err) {
      return fail(err);
    }
  };
}
