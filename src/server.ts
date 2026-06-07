#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getAssetResearch, getAssetSummary, getAvailableAssets } from "./registry.js";
import type { AssetLookupArgs, AssetResearchResult, AssetReturnContext, SimpleTokenReturnEstimate } from "./types.js";

// Stdio transport can have many concurrent large tool responses in smoke tests and
// agent clients; raise the listener cap to avoid false EventEmitter warnings while
// preserving normal backpressure behavior.
process.stdout.setMaxListeners(50);

const assetLookupSchema = {
  asset_id: z
    .string()
    .optional()
    .describe("Canonical asset id, slug, token address, Pendle market address, PT address, chain-prefixed address, or alias."),
  symbol: z.string().optional().describe("Asset symbol or alias, for example apxUSD, PRIME, USDat, or PT-USDat."),
};

const server = new McpServer({
  name: "front-asset-intel-mcp",
  version: "0.1.0",
});

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatUsd(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${value.toFixed(0)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecordValue(record: Record<string, unknown> | undefined, keys: string[]): unknown {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function getRecordNumber(record: Record<string, unknown> | undefined, keys: string[]): number | undefined {
  const value = getRecordValue(record, keys);
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getRecordString(record: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  const value = getRecordValue(record, keys);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function formatPercentLine(label: string, value: number | undefined): string | undefined {
  return value === undefined ? undefined : `- ${label}: ${formatPercent(value)}`;
}

function formatSocialQuantLines(context: AssetReturnContext): string[] {
  const social = isRecord(context.social_research_layer) ? context.social_research_layer : undefined;
  const quant = isRecord(context.quantitative_risk_return_layer) ? context.quantitative_risk_return_layer : undefined;
  const sourceRefs = getRecordValue(social, ["source_refs"]);
  const sourceRefLine = Array.isArray(sourceRefs) && sourceRefs.length > 0
    ? `- Social/X sources: ${sourceRefs.slice(0, 3).join("; ")}${sourceRefs.length > 3 ? `; +${sourceRefs.length - 3} more` : ""}`
    : undefined;

  return [
    getRecordString(quant, ["conclusion"]) ? `- Quantitative overlay: ${getRecordString(quant, ["conclusion"])}` : undefined,
    getRecordString(quant, ["decision_trigger"]) ? `- Quant decision trigger: ${getRecordString(quant, ["decision_trigger"])}` : undefined,
    getRecordString(social, ["decision_effect"]) ? `- Social/X overlay: ${getRecordString(social, ["decision_effect"])}` : undefined,
    getRecordString(social, ["confidence"]) ? `- Social/X confidence: ${getRecordString(social, ["confidence"])}` : undefined,
    sourceRefLine,
  ].filter((line): line is string => line !== undefined);
}

function formatTokenReturnLines(estimate: SimpleTokenReturnEstimate, display?: string): string[] {
  const loss = estimate.expected_loss_prior_scenarios;
  const riskAdjusted = estimate.risk_adjusted_roi_scenarios_after_base_points;
  const thesis = estimate.points_farming_thesis;
  const thesisLines = thesis.kind === "fresh_quant_farming_thesis"
    ? [
        `- Points thesis: ${thesis.program}; route ${thesis.route} (${thesis.route_multiplier}x); as of ${thesis.as_of}`,
        thesis.fdv_scenarios_usd
          ? `- FDV scenarios: low ${formatUsd(thesis.fdv_scenarios_usd.low)}, base ${formatUsd(thesis.fdv_scenarios_usd.base)}, high ${formatUsd(thesis.fdv_scenarios_usd.high)}`
          : undefined,
        thesis.weighted_denominator_scenarios_usd
          ? `- Weighted points denominator scenarios: low ${formatUsd(thesis.weighted_denominator_scenarios_usd.low)}, base ${formatUsd(thesis.weighted_denominator_scenarios_usd.base)}, high ${formatUsd(thesis.weighted_denominator_scenarios_usd.high)}`
          : undefined,
        thesis.raw_tvl_proxy_usd ? `- Raw TVL proxy: ${formatUsd(thesis.raw_tvl_proxy_usd)} (${thesis.raw_tvl_proxy_source})` : undefined,
        `- Points formula: ${thesis.formula}`,
        `- Points freshness: ${thesis.freshness_status}`,
      ]
    : [`- Points thesis: ${thesis.program}; ${thesis.freshness_status}`];

  return [
    "### Direct / variable-token ROI",
    "",
    display ? `- Display: ${display}` : undefined,
    `- Organic / variable ROI over ${estimate.horizon_days}d: ${formatPercent(estimate.organic_roi_over_horizon)} (${formatPercent(estimate.organic_yield_apy_estimate)} APY estimate)`,
    `- Fresh farming points ROI over ${estimate.horizon_days}d: ${formatPercent(estimate.estimated_points_roi_over_horizon)} (${estimate.points_program})`,
    `- Expected-loss prior: ${formatPercent(estimate.expected_loss_prior)} base; band ${formatPercent(loss.low)} / ${formatPercent(loss.base)} / ${formatPercent(loss.high)}`,
    `- Exit-cost assumption: ${formatPercent(estimate.exit_cost_assumption)}`,
    `- Risk-adjusted ROI before points: ${formatPercent(estimate.risk_adjusted_roi_before_points)}`,
    `- Risk-adjusted ROI after base points: ${formatPercent(estimate.risk_adjusted_roi_after_base_points)} (${formatPercent(estimate.risk_adjusted_annualized_return_after_base_points)} annualized)`,
    `- Risk-adjusted ROI band after base points: ${formatPercent(riskAdjusted.high_loss)} to ${formatPercent(riskAdjusted.low_loss)} under high-loss to low-loss cases; base ${formatPercent(riskAdjusted.base)}`,
    ...thesisLines,
    `- Confidence: ${estimate.confidence}`,
  ].filter((line): line is string => line !== undefined);
}

function formatPtReturnLines(context: AssetReturnContext): string[] {
  const profile = isRecord(context.pt_return_profile) ? context.pt_return_profile : undefined;
  if (!profile) return [];

  const horizon = getRecordValue(profile, ["horizon_days", "user_supplied_days_to_maturity"]);
  const accountingAsset = getRecordString(profile, ["accounting_asset", "accounting_asset_symbol", "underlying_token"]);
  const ptPrice = getRecordNumber(profile, ["pt_price_usd", "pt_price_usd_snapshot"]);
  const accountingPrice = getRecordNumber(profile, ["accounting_asset_price_usd", "accounting_asset_price_usd_snapshot"]);
  const liquidity = getRecordNumber(profile, ["liquidity_snapshot_usd", "liquidity_usd_snapshot"]);
  const interpretation = getRecordString(profile, ["interpretation"]);

  return [
    "### PT fixed-maturity ROI",
    "",
    accountingAsset ? `- Accounting asset: ${accountingAsset}` : undefined,
    typeof horizon === "number" || typeof horizon === "string" ? `- Horizon / days to maturity: ${horizon}` : undefined,
    ptPrice !== undefined || accountingPrice !== undefined
      ? `- Price snapshot: PT ${ptPrice === undefined ? "n/a" : formatUsd(ptPrice)}; accounting asset ${accountingPrice === undefined ? "n/a" : formatUsd(accountingPrice)}`
      : undefined,
    formatPercentLine("Gross ROI to accounting asset", getRecordNumber(profile, ["gross_roi_to_accounting_asset", "gross_roi"])),
    formatPercentLine("Simple gross APR", getRecordNumber(profile, ["simple_gross_apr"])),
    formatPercentLine("Compound gross APY", getRecordNumber(profile, ["compound_gross_apy", "pendle_implied_apy_snapshot"])),
    formatPercentLine("Expected-loss prior", getRecordNumber(profile, ["expected_loss_prior"])),
    formatPercentLine("Exit-cost assumption", getRecordNumber(profile, ["exit_cost_assumption"])),
    formatPercentLine(
      "Risk-adjusted ROI after expected loss and exit",
      getRecordNumber(profile, ["risk_adjusted_roi_after_expected_loss_and_exit"]),
    ),
    formatPercentLine(
      "Risk-adjusted annualized return after expected loss and exit",
      getRecordNumber(profile, ["risk_adjusted_annualized_return_after_expected_loss_and_exit"]),
    ),
    formatPercentLine("Break-even accounting-asset drawdown", getRecordNumber(profile, ["break_even_accounting_asset_drawdown"])),
    liquidity !== undefined ? `- Liquidity snapshot: ${formatUsd(liquidity)}` : undefined,
    interpretation ? `- Interpretation: ${interpretation}` : undefined,
  ].filter((line): line is string => line !== undefined);
}

function formatReturnContext(context: AssetReturnContext): string {
  const branchLines = context.kind === "direct_or_variable_token_return" && context.token_return_estimate
    ? formatTokenReturnLines(context.token_return_estimate, context.display)
    : formatPtReturnLines(context);
  const lines = [
    "## Normalized return context",
    "",
    "This section is derived from the same local research package as `get_asset_summary`: ROI fields, PT fixed-return economics, direct/variable token estimates, and social/X + quantitative overlays are carried together with the source report for auditability.",
    "",
    `- Context kind: ${context.kind}`,
    `- Source basis: ${context.source_basis}`,
    context.summary_mode ? `- Summary mode: ${context.summary_mode}` : undefined,
    ...context.notes.map((note) => `- ${note}`),
    "",
    ...branchLines,
    "",
    ...formatSocialQuantLines(context),
    "",
    "```json",
    JSON.stringify(context, null, 2),
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
    `return_context: ${result.return_context ? "included" : "none"}`,
    result.return_context ? `return_context_kind: ${result.return_context.kind}` : undefined,
    "---",
    "",
  ].filter((line): line is string => line !== undefined);

  const returnContext = result.return_context
    ? [formatReturnContext(result.return_context), "## Source research report", ""]
    : [];

  return [...header, ...returnContext, result.markdown].join("\n");
}

server.registerTool(
  "list_available_assets",
  {
    title: "List available assets and lookup guidance",
    description:
      "Return the static list of assets this MCP can answer about, all accepted lookup values, and explicit examples for calling get_asset_summary or get_asset_research when an agent already knows a symbol, token address, Pendle market address, PT address, chain-prefixed address, canonical asset_id, slug, or alias. Call this first when you are unsure which asset identifiers are available; this server cannot dynamically fetch unknown assets.",
    inputSchema: {},
  },
  async () => {
    const result = await getAvailableAssets();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "get_asset_summary",
  {
    title: "Get asset rubric summary",
    description:
      "Return the precomputed rubric-style JSON summary for an asset, including the normalized return_context derived from the full local research package. Accepts asset_id or symbol; asset_id may be a canonical asset id, slug, raw token/Pendle market/PT address, chain-prefixed address, or alias. If unsure what assets or lookup strings are available, call list_available_assets first. This is the scoring-helper surface for analyst agents: each dimension includes the asset-specific answer plus dimensions[].possible_grades with every fixed rubric bucket, score range, status, and selected/higher/lower relation so agents can compare the current state against alternatives. For tables and analyst-agent routing, prefer agent_display.score_display, agent_display.decision_label, underwriting_status, execution_automation_status, primary_blockers, next_action, and return_context over the legacy rubric.score/decision_class fields.",
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
      "Return the full precomputed Markdown research report for an asset, with the same normalized return_context used by get_asset_summary carried inline for auditability. Accepts the same lookup inputs as get_asset_summary; if the agent only knows an address or symbol and is unsure whether it is available, call list_available_assets first for exact examples. The context covers PT fixed-maturity ROI, direct/non-PT organic or variable ROI, quantitatively modeled farming value, expected-loss/exit-cost bands, risk-adjusted ROI, and social/X plus quantitative overlays where present. Use this when the rubric answer needs source context or audit detail.",
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
