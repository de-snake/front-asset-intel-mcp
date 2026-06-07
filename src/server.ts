#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getAssetResearch, getAssetSummary } from "./registry.js";
import type { AssetLookupArgs, AssetResearchResult, SimpleTokenReturnEstimate } from "./types.js";

const assetLookupSchema = {
  asset_id: z
    .string()
    .optional()
    .describe("Canonical asset id, slug, token address, market address, PT address, or alias."),
  symbol: z.string().optional().describe("Asset symbol or alias, for example apxUSD, PRIME, USDat, or PT-USDat."),
};

const server = new McpServer({
  name: "front-asset-intel-mcp",
  version: "0.1.0",
});

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatSimpleTokenReturnEstimate(estimate: SimpleTokenReturnEstimate, display?: string): string {
  const loss = estimate.expected_loss_prior_scenarios;
  const riskAdjusted = estimate.risk_adjusted_roi_scenarios_after_base_points;
  const lines = [
    "## Precomputed simple-token return estimate",
    "",
    "This block is copied from the validated summary JSON so asset-research callers see the same organic / points / risk-adjusted ROI line without making a separate `get_asset_summary` call.",
    "",
    display ? `- Display: ${display}` : undefined,
    `- Organic ROI over ${estimate.horizon_days}d: ${formatPercent(estimate.organic_roi_over_horizon)} (${formatPercent(estimate.organic_yield_apy_estimate)} APY estimate)`,
    `- Estimated points ROI over ${estimate.horizon_days}d: ${formatPercent(estimate.estimated_points_roi_over_horizon)} (${estimate.points_program})`,
    `- Expected-loss prior: ${formatPercent(estimate.expected_loss_prior)} base; band ${formatPercent(loss.low)} / ${formatPercent(loss.base)} / ${formatPercent(loss.high)}`,
    `- Exit-cost assumption: ${formatPercent(estimate.exit_cost_assumption)}`,
    `- Risk-adjusted ROI before points: ${formatPercent(estimate.risk_adjusted_roi_before_points)}`,
    `- Risk-adjusted ROI after base points: ${formatPercent(estimate.risk_adjusted_roi_after_base_points)} (${formatPercent(estimate.risk_adjusted_annualized_return_after_base_points)} annualized)`,
    `- Risk-adjusted ROI band after base points: ${formatPercent(riskAdjusted.high_loss)} to ${formatPercent(riskAdjusted.low_loss)} under high-loss to low-loss cases; base ${formatPercent(riskAdjusted.base)}`,
    `- Confidence: ${estimate.confidence}`,
    "",
    "```json",
    JSON.stringify(estimate, null, 2),
    "```",
    "",
  ].filter((line): line is string => line !== undefined);

  return lines.join("\n");
}

function formatAssetResearch(result: AssetResearchResult): string {
  const header = [
    "---",
    `asset_id: ${result.manifest.asset_id}`,
    `symbol: ${result.manifest.symbol}`,
    `asset_type: ${result.manifest.asset_type}`,
    `rubric_version: ${result.manifest.rubric_version}`,
    `simple_token_return_estimate: ${result.simple_token_return_estimate ? "included" : "none"}`,
    "---",
    "",
  ];

  const estimate = result.simple_token_return_estimate
    ? [formatSimpleTokenReturnEstimate(result.simple_token_return_estimate, result.simple_token_return_display), "## Source research report", ""]
    : [];

  return [...header, ...estimate, result.markdown].join("\n");
}

server.registerTool(
  "get_asset_summary",
  {
    title: "Get asset rubric summary",
    description:
      "Return the precomputed rubric-style JSON summary for an asset. For tables and analyst-agent routing, prefer agent_display.score_display, agent_display.decision_label, underwriting_status, execution_automation_status, primary_blockers, and next_action over the legacy rubric.score/decision_class fields. The payload also includes per-rubric dimension score, score band, status, evidence state, and evidence pointers.",
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
      "Return the full precomputed Markdown research report for an asset. For simple-token assets, the MCP response prepends the validated simple_token_return_estimate from summary JSON so research callers get organic ROI, estimated points ROI, expected-loss bands, and risk-adjusted ROI without a second tool call. Use this when the rubric answer needs source context or audit detail.",
    inputSchema: assetLookupSchema,
  },
  async (args: AssetLookupArgs) => {
    const research = await getAssetResearch(args);
    return {
      content: [
        {
          type: "text",
          text: formatAssetResearch(research),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
