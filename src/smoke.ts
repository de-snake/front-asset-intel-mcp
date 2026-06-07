import { getAssetResearch, getAssetSummary } from "./registry.js";

type SummaryDimension = { id: string; score: number; max_score: number; score_band: string; status: string };

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
  quantitative_risk_return_layer?: {
    risk_adjusted_roi_after_expected_loss_and_exit?: number;
    risk_adjusted_annualized_return_after_expected_loss_and_exit?: number;
    conclusion?: string;
  };
};

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

const research = {
  pt_apxUSD: await getAssetResearch({ asset_id: "0xaf0349fb9b1ba07d34381870c59b560b31412660" }),
  pt_apyUSD: await getAssetResearch({ asset_id: "0x30bb9ee8dc6aab322dc3a0d36063cbf06a9e5952" }),
  pt_USDat: await getAssetResearch({ asset_id: "0x9afe7a057a09cf5da748d952078c9c99938b4329" }),
  pt_sUSDat: await getAssetResearch({ asset_id: "0x91bc86899c8391b6caaf26535b9cd82efe49a189" }),
};

console.log(
  JSON.stringify(
    {
      ok: true,
      assets: Object.fromEntries(Object.entries(summaries).map(([key, summary]) => [key, pickSummary(summary)])),
      research_chars: Object.fromEntries(Object.entries(research).map(([key, value]) => [key, value.markdown.length])),
    },
    null,
    2,
  ),
);
