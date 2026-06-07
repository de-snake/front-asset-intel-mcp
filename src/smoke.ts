import { getAssetResearch, getAssetSummary } from "./registry.js";

const apxSummary = await getAssetSummary({ symbol: "apxUSD" }) as { rubric?: { score?: number; decision_class?: string } };
const ptSummary = await getAssetSummary({ symbol: "PT-apxUSD" }) as {
  rubric?: { score?: number; decision_class?: string };
  return_profile?: { compound_gross_apy?: number };
};
const ptResearch = await getAssetResearch({ asset_id: "0xaf0349fb9b1ba07d34381870c59b560b31412660" });

console.log(
  JSON.stringify(
    {
      ok: true,
      apxUSD: {
        score: apxSummary.rubric?.score,
        decision_class: apxSummary.rubric?.decision_class,
      },
      pt_apxUSD: {
        score: ptSummary.rubric?.score,
        decision_class: ptSummary.rubric?.decision_class,
        compound_gross_apy: ptSummary.return_profile?.compound_gross_apy,
        research_chars: ptResearch.markdown.length,
      },
    },
    null,
    2,
  ),
);
