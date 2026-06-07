#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getAssetResearch, getAssetSummary } from "./registry.js";
import type { AssetLookupArgs } from "./types.js";

const assetLookupSchema = {
  asset_id: z
    .string()
    .optional()
    .describe("Canonical asset id, slug, token address, market address, PT address, or alias."),
  symbol: z.string().optional().describe("Asset symbol or alias, for example apxUSD or PT-apxUSD."),
};

const server = new McpServer({
  name: "front-asset-intel-mcp",
  version: "0.1.0",
});

server.registerTool(
  "get_asset_summary",
  {
    title: "Get asset rubric summary",
    description:
      "Return the precomputed rubric-style JSON summary for an asset. Use this for standardized analyst-agent decisions before reading the full report.",
    inputSchema: assetLookupSchema,
  },
  async (args: AssetLookupArgs) => {
    const summary = await getAssetSummary(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(summary, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "get_asset_research",
  {
    title: "Get full asset research",
    description:
      "Return the full precomputed Markdown research report for an asset. Use this when the rubric answer needs source context or audit detail.",
    inputSchema: assetLookupSchema,
  },
  async (args: AssetLookupArgs) => {
    const { manifest, markdown } = await getAssetResearch(args);
    return {
      content: [
        {
          type: "text",
          text: `---\nasset_id: ${manifest.asset_id}\nsymbol: ${manifest.symbol}\nasset_type: ${manifest.asset_type}\nrubric_version: ${manifest.rubric_version}\n---\n\n${markdown}`,
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
