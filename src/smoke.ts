import { getAssetResearch, getAssetSummary, getAvailableAssets } from "./registry.js";

type SummaryDimension = {
  id: string;
  score: number;
  max_score: number;
  score_band: string;
  status: string;
  possible_grades?: Array<{ id: string; condition: string; is_selected: boolean; relation_to_selected: string }>;
};

type SimpleTokenReturnEstimate = {
  organic_roi_over_horizon?: number;
  estimated_points_roi_over_horizon?: number;
  risk_adjusted_roi_after_base_points?: number;
  risk_adjusted_annualized_return_after_base_points?: number;
};

type ReturnContext = {
  kind: "direct_or_variable_token_return" | "fixed_maturity_pt_return";
  source_basis: "full_local_research_package";
  token_return_estimate?: SimpleTokenReturnEstimate;
  pt_return_profile?: Record<string, unknown>;
  social_research_layer?: Record<string, unknown>;
  quantitative_risk_return_layer?: Record<string, unknown>;
};

type AgentDisplay = {
  score_display?: string;
  score_sort?: number;
  score_source?: string;
  inherited_asset_quality_score?: number;
  recommended_table_decision?: string;
  decision_label?: string;
  underwriting_status?: string;
  execution_automation_status?: string;
  primary_blockers?: string[];
  next_action?: string;
  fixed_return_metrics?: {
    gross_roi?: number;
    compound_gross_apy?: number;
    risk_adjusted_roi_after_expected_loss_and_exit?: number;
    risk_adjusted_annualized_return_after_expected_loss_and_exit?: number;
    underwriting_hurdle_net_annualized?: number;
  };
  simple_token_return_display?: string;
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
};

type Summary = {
  rubric?: { score?: number; score_label?: string; decision_class?: string };
  agent_display?: AgentDisplay;
  dimensions?: SummaryDimension[];
  return_profile?: {
    gross_roi?: number;
    compound_gross_apy?: number;
    risk_adjusted_roi_after_expected_loss_and_exit?: number;
    risk_adjusted_annualized_return_after_expected_loss_and_exit?: number;
  };
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
  return_context?: ReturnContext;
  quantitative_risk_return_layer?: {
    risk_adjusted_roi_after_expected_loss_and_exit?: number;
    risk_adjusted_annualized_return_after_expected_loss_and_exit?: number;
    conclusion?: string;
  };
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function pickSummary(summary: Summary): Record<string, unknown> {
  const selected: Record<string, unknown> = {
    legacy_score: summary.rubric?.score,
    legacy_score_label: summary.rubric?.score_label,
    legacy_decision_class: summary.rubric?.decision_class,
    score_display: summary.agent_display?.score_display,
    score_sort: summary.agent_display?.score_sort,
    score_source: summary.agent_display?.score_source,
    inherited_asset_quality_score: summary.agent_display?.inherited_asset_quality_score,
    recommended_table_decision: summary.agent_display?.recommended_table_decision,
    decision_label: summary.agent_display?.decision_label,
    underwriting_status: summary.agent_display?.underwriting_status,
    execution_automation_status: summary.agent_display?.execution_automation_status,
    primary_blockers: summary.agent_display?.primary_blockers?.slice(0, 2),
    next_action: summary.agent_display?.next_action,
    return_context_kind: summary.return_context?.kind,
    return_context_source_basis: summary.return_context?.source_basis,
    social_x_context: Boolean(summary.return_context?.social_research_layer),
    quantitative_return_context: Boolean(summary.return_context?.quantitative_risk_return_layer),
    dimension_statuses: summary.dimensions?.map((dimension) => ({
      id: dimension.id,
      score: `${dimension.score}/${dimension.max_score}`,
      score_band: dimension.score_band,
      status: dimension.status,
      possible_grade_buckets: dimension.possible_grades?.length,
      selected_grade: dimension.possible_grades?.find((grade) => grade.is_selected)?.id,
    })),
  };

  if (summary.return_profile) {
    selected.gross_roi = summary.return_profile.gross_roi;
    selected.compound_gross_apy = summary.return_profile.compound_gross_apy;
  }

  if (summary.simple_token_return_estimate) {
    selected.simple_token_return_display = summary.agent_display?.simple_token_return_display;
    selected.organic_roi_over_horizon = summary.simple_token_return_estimate.organic_roi_over_horizon;
    selected.estimated_points_roi_over_horizon = summary.simple_token_return_estimate.estimated_points_roi_over_horizon;
    selected.risk_adjusted_roi_after_base_points = summary.simple_token_return_estimate.risk_adjusted_roi_after_base_points;
    selected.risk_adjusted_annualized_return_after_base_points =
      summary.simple_token_return_estimate.risk_adjusted_annualized_return_after_base_points;
  }

  if (summary.quantitative_risk_return_layer) {
    selected.risk_adjusted_roi_after_expected_loss_and_exit =
      summary.quantitative_risk_return_layer.risk_adjusted_roi_after_expected_loss_and_exit;
    selected.risk_adjusted_annualized_return_after_expected_loss_and_exit =
      summary.quantitative_risk_return_layer.risk_adjusted_annualized_return_after_expected_loss_and_exit;
    selected.conclusion = summary.quantitative_risk_return_layer.conclusion;
  }

  return selected;
}

const availableAssets = await getAvailableAssets();
assert(availableAssets.endpoint === "list_available_assets", "available assets endpoint name mismatch");
assert(availableAssets.available_asset_count === availableAssets.assets.length, "available asset count mismatch");
assert(availableAssets.available_asset_count >= 11, "available assets list should include the current seed set");
assert(availableAssets.usage.summary_tool.includes("get_asset_summary"), "available assets usage missing summary tool guidance");
assert(availableAssets.usage.research_tool.includes("get_asset_research"), "available assets usage missing research tool guidance");
assert(availableAssets.usage.if_agent_knows_symbol.includes("symbol"), "available assets usage missing symbol guidance");
assert(availableAssets.usage.if_agent_knows_address.includes("asset_id"), "available assets usage missing address guidance");
const availableBySymbol = new Map(availableAssets.assets.map((asset) => [asset.symbol, asset]));
const apxAvailable = availableBySymbol.get("apxUSD");
assert(apxAvailable, "available assets missing apxUSD");
assert(apxAvailable.recommended_calls.some((call) => call.tool === "get_asset_summary" && call.arguments.symbol === "apxUSD"), "apxUSD missing summary-by-symbol call guidance");
assert(apxAvailable.recommended_calls.some((call) => call.tool === "get_asset_research" && call.arguments.asset_id === "0x98A878b1Cd98131B271883B390f68D2c90674665"), "apxUSD missing research-by-address call guidance");
assert(apxAvailable.accepted_lookup_values.includes("ethereum:0x98a878b1cd98131b271883b390f68d2c90674665"), "apxUSD missing chain-prefixed token lookup value");
const usdcAvailable = availableBySymbol.get("USDC");
assert(usdcAvailable, "available assets missing USDC");
assert(usdcAvailable.accepted_lookup_values.includes("USDC"), "USDC missing symbol lookup value");
assert(usdcAvailable.accepted_lookup_values.includes("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"), "USDC missing address lookup value");
assert(usdcAvailable.accepted_lookup_values.includes("ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"), "USDC missing chain-prefixed token lookup value");
assert(usdcAvailable.recommended_calls.some((call) => call.tool === "get_asset_summary" && call.arguments.symbol === "USDC"), "USDC missing summary-by-symbol call guidance");
const ptUsdatAvailable = availableBySymbol.get("PT-USDat-2026-08-27");
assert(ptUsdatAvailable, "available assets missing PT-USDat");
assert(ptUsdatAvailable.accepted_lookup_values.includes("PT-USDat"), "PT-USDat missing short-symbol alias lookup value");
assert(ptUsdatAvailable.accepted_lookup_values.includes("0x9afe7a057a09cf5da748d952078c9c99938b4329"), "PT-USDat missing market-address lookup value");
assert(ptUsdatAvailable.accepted_lookup_values.includes("ethereum:0x9afe7a057a09cf5da748d952078c9c99938b4329"), "PT-USDat missing chain-prefixed market lookup value");
const ptUsdatByChainPrefixedMarket = (await getAssetSummary({ asset_id: "ethereum:0x9afe7a057a09cf5da748d952078c9c99938b4329" })) as Summary;
assert(ptUsdatByChainPrefixedMarket.agent_display?.score_source === "pt_fixed_return_trade_score", "chain-prefixed PT market lookup should resolve PT-USDat summary");

const summaries = {
  apxUSD: (await getAssetSummary({ symbol: "apxUSD" })) as Summary,
  apyUSD: (await getAssetSummary({ symbol: "apyUSD" })) as Summary,
  PRIME: (await getAssetSummary({ symbol: "PRIME" })) as Summary,
  deSPXA: (await getAssetSummary({ symbol: "deSPXA" })) as Summary,
  USDC: (await getAssetSummary({ symbol: "USDC" })) as Summary,
  USDat: (await getAssetSummary({ symbol: "USDat" })) as Summary,
  sUSDat: (await getAssetSummary({ symbol: "sUSDat" })) as Summary,
  pt_apxUSD: (await getAssetSummary({ symbol: "PT-apxUSD" })) as Summary,
  pt_apyUSD: (await getAssetSummary({ symbol: "PT-apyUSD" })) as Summary,
  pt_USDat: (await getAssetSummary({ symbol: "PT-USDat" })) as Summary,
  pt_sUSDat: (await getAssetSummary({ symbol: "PT-sUSDat" })) as Summary,
};

const simpleResearch = {
  apxUSD: await getAssetResearch({ symbol: "apxUSD" }),
  apyUSD: await getAssetResearch({ symbol: "apyUSD" }),
  PRIME: await getAssetResearch({ symbol: "PRIME" }),
  deSPXA: await getAssetResearch({ symbol: "deSPXA" }),
  USDC: await getAssetResearch({ symbol: "USDC" }),
  USDat: await getAssetResearch({ symbol: "USDat" }),
  sUSDat: await getAssetResearch({ symbol: "sUSDat" }),
};

for (const [key, research] of Object.entries(simpleResearch)) {
  const summary = summaries[key as keyof typeof simpleResearch] as Summary;
  assert(research.simple_token_return_display === summary.agent_display?.simple_token_return_display, `${key} research display missing simple-token ROI line`);
  assert(
    JSON.stringify(research.simple_token_return_estimate) === JSON.stringify(summary.simple_token_return_estimate),
    `${key} research estimate must mirror summary estimate`,
  );
  assert(summary.return_context?.kind === "direct_or_variable_token_return", `${key} summary missing direct/variable return context`);
  assert(research.return_context?.kind === "direct_or_variable_token_return", `${key} research missing direct/variable return context`);
  assert(
    JSON.stringify(research.return_context) === JSON.stringify(summary.return_context),
    `${key} research return_context must mirror summary return_context`,
  );
}

const research = {
  pt_apxUSD: await getAssetResearch({ asset_id: "0xaf0349fb9b1ba07d34381870c59b560b31412660" }),
  pt_apyUSD: await getAssetResearch({ asset_id: "0x30bb9ee8dc6aab322dc3a0d36063cbf06a9e5952" }),
  pt_USDat: await getAssetResearch({ asset_id: "0x9afe7a057a09cf5da748d952078c9c99938b4329" }),
  pt_sUSDat: await getAssetResearch({ asset_id: "0x91bc86899c8391b6caaf26535b9cd82efe49a189" }),
};

for (const [key, ptResearch] of Object.entries(research)) {
  assert(!ptResearch.simple_token_return_display, `${key} PT research must not expose simple-token points display`);
  assert(!ptResearch.simple_token_return_estimate, `${key} PT research must not expose simple-token points estimate`);
  const summary = summaries[key as keyof typeof research] as Summary;
  assert(summary.return_context?.kind === "fixed_maturity_pt_return", `${key} summary missing fixed-maturity PT return context`);
  assert(ptResearch.return_context?.kind === "fixed_maturity_pt_return", `${key} research missing fixed-maturity PT return context`);
  assert(
    JSON.stringify(ptResearch.return_context) === JSON.stringify(summary.return_context),
    `${key} research return_context must mirror summary return_context`,
  );
}

console.log(
  JSON.stringify(
    {
      ok: true,
      available_assets: {
        count: availableAssets.available_asset_count,
        first_tool_example: availableAssets.usage.examples[0],
        apxUSD_lookup_values: apxAvailable.accepted_lookup_values.slice(0, 6),
        pt_USDat_lookup_values: ptUsdatAvailable.accepted_lookup_values.slice(0, 8),
      },
      assets: Object.fromEntries(Object.entries(summaries).map(([key, summary]) => [key, pickSummary(summary)])),
      simple_research_chars: Object.fromEntries(Object.entries(simpleResearch).map(([key, value]) => [key, value.markdown.length])),
      research_chars: Object.fromEntries(Object.entries(research).map(([key, value]) => [key, value.markdown.length])),
    },
    null,
    2,
  ),
);
