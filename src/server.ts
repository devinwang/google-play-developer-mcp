import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { allTools, toolByName } from "./tools/index.js";

export function createServer(): Server {
  const server = new Server(
    {
      name: "google-play-developer-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = toolByName(request.params.name);
    if (!tool) {
      return {
        content: [
          { type: "text", text: `Unknown tool: ${request.params.name}` },
        ],
        isError: true,
      };
    }
    // Cast: MCP SDK's ServerResult shape has optional task metadata we
    // don't populate. Our ToolResult satisfies the response contract.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await tool.handle(request.params.arguments ?? {})) as any;
  });

  return server;
}
