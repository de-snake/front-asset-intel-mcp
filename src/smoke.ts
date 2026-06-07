import { getAssetResearch, getAssetSummary } from "./registry.js";

type Summary = {
  rubric?: { score?: number; decision_class?: string };
  return_profile?: {
    compound_gross_apy?: number;
    points_roi_required_to_clear_10pct_hurdle?: number;
  };
  quantitative_risk_return_layer?: {
    points_roi_required_to_clear_hurdle?: number;
    conclusion?: string;
  };
};

const apxSummary = (await getAssetSummary({ symbol: "apxUSD" })) as Summary;
const apySummary = (await getAssetSummary({ symbol: "apyUSD" })) as Summary;
const ptApxSummary = (await getAssetSummary({ symbol: "PT-apxUSD" })) as Summary;
const ptApySummary = (await getAssetSummary({ symbol: "PT-apyUSD" })) as Summary;
const ptApxResearch = await getAssetResearch({ asset_id: "0xaf0349fb9b1ba07d34381870c59b560b31412660" });
const ptApyResearch = await getAssetResearch({ asset_id: "0x30bb9ee8dc6aab322dc3a0d36063cbf06a9e5952" });

console.log(
  JSON.stringify(
    {
      ok: true,
      apxUSD: {
        score: apxSummary.rubric?.score,
        decision_class: apxSummary.rubric?.decision_class,
      },
      apyUSD: {
        score: apySummary.rubric?.score,
        decision_class: apySummary.rubric?.decision_class,
      },
      pt_apxUSD: {
        score: ptApxSummary.rubric?.score,
        decision_class: ptApxSummary.rubric?.decision_class,
        compound_gross_apy: ptApxSummary.return_profile?.compound_gross_apy,
        points_roi_required_to_clear_hurdle:
          ptApxSummary.quantitative_risk_return_layer?.points_roi_required_to_clear_hurdle,
        research_chars: ptApxResearch.markdown.length,
      },
      pt_apyUSD: {
        score: ptApySummary.rubric?.score,
        decision_class: ptApySummary.rubric?.decision_class,
        compound_gross_apy: ptApySummary.return_profile?.compound_gross_apy,
        points_roi_required_to_clear_hurdle:
          ptApySummary.quantitative_risk_return_layer?.points_roi_required_to_clear_hurdle,
        conclusion: ptApySummary.quantitative_risk_return_layer?.conclusion,
        research_chars: ptApyResearch.markdown.length,
      },
    },
    null,
    2,
  ),
);
