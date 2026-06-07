import { getAssetResearch, getAssetSummary } from "./registry.js";

type SummaryDimension = { id: string; score: number; max_score: number; score_band: string; status: string };

type Summary = {
  rubric?: { score?: number; score_label?: string; decision_class?: string };
  dimensions?: SummaryDimension[];
  return_profile?: {
    gross_roi?: number;
    compound_gross_apy?: number;
    points_roi_required_to_clear_10pct_hurdle?: number;
  };
  quantitative_risk_return_layer?: {
    points_roi_required_to_clear_hurdle?: number;
    conclusion?: string;
  };
};

function pickSummary(summary: Summary): Record<string, unknown> {
  const selected: Record<string, unknown> = {
    score: summary.rubric?.score,
    score_label: summary.rubric?.score_label,
    decision_class: summary.rubric?.decision_class,
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
    selected.points_roi_required_to_clear_hurdle =
      summary.quantitative_risk_return_layer.points_roi_required_to_clear_hurdle;
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
