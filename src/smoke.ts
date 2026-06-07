import { getAssetResearch, getAssetSummary } from "./registry.js";

type SummaryDimension = { id: string; score: number; max_score: number; score_band: string; status: string };

type SimpleTokenReturnEstimate = {
  organic_roi_over_horizon?: number;
  estimated_points_roi_over_horizon?: number;
  risk_adjusted_roi_after_base_points?: number;
  risk_adjusted_annualized_return_after_base_points?: number;
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
    dimension_statuses: summary.dimensions?.map((dimension) => ({
      id: dimension.id,
      score: `${dimension.score}/${dimension.max_score}`,
      score_band: dimension.score_band,
      status: dimension.status,
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

const summaries = {
  apxUSD: (await getAssetSummary({ symbol: "apxUSD" })) as Summary,
  apyUSD: (await getAssetSummary({ symbol: "apyUSD" })) as Summary,
  PRIME: (await getAssetSummary({ symbol: "PRIME" })) as Summary,
  deSPXA: (await getAssetSummary({ symbol: "deSPXA" })) as Summary,
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
}

console.log(
  JSON.stringify(
    {
      ok: true,
      assets: Object.fromEntries(Object.entries(summaries).map(([key, summary]) => [key, pickSummary(summary)])),
      simple_research_chars: Object.fromEntries(Object.entries(simpleResearch).map(([key, value]) => [key, value.markdown.length])),
      research_chars: Object.fromEntries(Object.entries(research).map(([key, value]) => [key, value.markdown.length])),
    },
    null,
    2,
  ),
);
