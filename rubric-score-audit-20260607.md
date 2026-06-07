# Rubric score audit — 2026-06-07

## Question

The MCP ranking table shows low-ish scores and decisions such as `review_required` / `blocked_or_cannot_underwrite` for USDat, PT-USDat, apxUSD, PT-apxUSD, deSPXA, PRIME, sUSDat, PT-sUSDat, apyUSD, and PT-apyUSD.

The question is whether this means the source research lacks data, or whether the MCP extractor is extracting / scoring the rubric incorrectly.

## Finding

The current MCP server is not extracting scores from reports at runtime.

`front-asset-intel-mcp` serves precomputed local JSON summaries from `data/assets/<asset-slug>/summary.asset_risk_v1.json`. The full reports are served separately from `data/assets/<asset-slug>/research.md`. Runtime has no LLM, no crawler, no extraction, and no score regeneration.

So the table is coming from authored rubric summaries, not an extractor pass over the Markdown at fetch time.

## Evidence checked

Commands run from `projects/front-asset-intel-mcp/`:

```bash
npm test
```

Result: pass. The smoke output reproduces the table scores and decisions directly from `get_asset_summary`.

Repository checks:

- `src/registry.ts` reads `summary.asset_risk_v1.json` directly for `getAssetSummary`.
- `src/server.ts` returns the summary JSON unchanged from `get_asset_summary`.
- `data/rubrics/asset_risk_v1.json` defines the rubric purpose, dimensions, score thresholds, and the PT inheritance rule.
- The summaries contain explicit numeric scores, e.g. USDat `52`, apxUSD `49`, apyUSD `35`.

Public report check in `/tmp/front-kb-rich-reports`:

- Explicit `/100` scores in public `RESULT.md` files: `0`.
- Explicit `blocked_or_cannot_underwrite` labels in public `RESULT.md` files: `0`.
- Explicit `review_required` labels do exist in some reports, and many reports use plain-English equivalents such as “requires human review” and “should block automated execution”.

Conclusion: the numeric score is not an extracted report fact. It is a precomputed summary-layer judgment.

## What the table actually means

The score is an `asset-quality evidence` score under `asset_risk_v1`, not a report-quality score.

The decision class is an underwriting/readiness gate:

- `review_required`: enough evidence for analyst review, but missing live/user-specific inputs prevent Preview / Execute.
- `blocked_or_cannot_underwrite`: score below threshold or material blocker prevents decision use under current assumptions.

Therefore low scores do not automatically mean the research is thin. They often mean the report found real blockers: holder eligibility, issuer controls, live route capacity, redemption queue state, reserve reconciliation, oracle/accounting mismatch, or current governance state.

## Main problems found

### 1. Score semantics are ambiguous to clients

The table prints `Score` with no qualifier. Consumers can read it as report quality, asset attractiveness, or final approval probability.

Actual meaning is narrower: precomputed asset-quality / underwriting evidence score.

### 2. The score appears over-precise

The MCP returns exact integers (`52/100`, `49/100`, etc.) even though the underlying evidence is mixed, point-in-time, and partly qualitative.

The JSON does not expose enough provenance fields to tell users:

- score was precomputed, not extracted;
- score is not a live market quote;
- score is not final investment advice;
- score is not report completeness.

### 3. PT summaries inherit the underlying score without an explicit split

All PT rows currently match the underlying asset score exactly:

- PT-USDat = USDat = `52`
- PT-apxUSD = apxUSD = `49`
- PT-sUSDat = sUSDat = `40`
- PT-apyUSD = apyUSD = `35`

This is intentional per the current rubric text, but it is not visible enough in the returned summary. PTs should show:

- inherited underlying asset-quality score;
- PT-specific return / maturity / Pendle liquidity / points overlay;
- final PT decision rationale.

Otherwise the table looks like the PT was independently scored but happened to get the exact same score.

### 4. The decision axis mixes underwriting and execution automation

The summaries include one `decision_class`, while the reports distinguish at least three states:

- research evidence is usable as a diligence substrate;
- underwriting remains review-required / cannot-underwrite;
- live execution or automation is blocked until current checks pass.

Collapsing these into one decision class causes confusion.

### 5. Summary quality is inconsistent across assets

A quick data check showed some summaries omit `missing_behavior` on every dimension:

- apxUSD: 7 dimensions missing `missing_behavior`
- apyUSD: 7 dimensions missing `missing_behavior`
- PT-apxUSD: 7 dimensions missing `missing_behavior`
- PT-apyUSD: 7 dimensions missing `missing_behavior`

Other summaries include it consistently.

The validator currently checks dimension score sums and max-score bounds, but does not require `missing_behavior`, evidence pointers, score-bucket consistency, or PT inheritance declarations.

## Recommended improvements

### P0 — clarify score provenance without breaking existing clients

Keep the current `rubric.score` and `rubric.decision_class` fields for compatibility, but add an explicit interpretation block:

```json
"score_interpretation": {
  "score_kind": "asset_quality_evidence_score",
  "score_source": "precomputed_summary_json",
  "not_extracted_from_report": true,
  "not_report_quality_score": true,
  "not_live_market_score": true,
  "not_investment_recommendation": true
}
```

Add this to every summary.

### P0 — split decision layers

Add a backwards-compatible `decision_layers` object:

```json
"decision_layers": {
  "research_quality": {
    "status": "usable_for_review",
    "rationale": "Report contains source-linked diligence and named missing inputs."
  },
  "underwriting": {
    "status": "review_required",
    "blocking_inputs": ["live route quote", "holder eligibility", "current admin state"]
  },
  "execution_automation": {
    "status": "blocked_until_live_preview",
    "blocking_inputs": ["Preview route quote", "allowed-token check", "wallet restriction check"]
  }
}
```

This fixes the false impression that `review_required` means “bad research”.

### P0 — make PT inheritance explicit

For every `pendle_pt` summary, add:

```json
"pt_score_model": {
  "asset_quality_score_policy": "inherits_underlying_asset_score",
  "underlying_asset_id": "...",
  "underlying_asset_score": 52,
  "pt_overlay_is_scored_separately": false,
  "pt_overlay_fields": ["return_profile", "quantitative_risk_return_layer", "social_research_layer"]
}
```

Then UI/table clients should display:

- `Underlying score`: 52/100
- `PT overlay`: e.g. gross APY, risk-adjusted annualized return, points hurdle
- `Decision`: review_required / blocked

not just one generic score.

### P1 — harden validation

Extend `src/validate-data.ts` to require:

1. `selected_option` exists in the rubric.
2. dimension `score` falls inside the selected option’s configured `score_range`.
3. every dimension has:
   - `selected_option`
   - `answer`
   - `evidence`
   - `missing_behavior`
4. `rubric.decision_class` matches score thresholds unless an explicit override explains why.
5. PT summaries include:
   - `underlying_asset_id`
   - `return_profile`
   - `pt_score_model`
   - at least one PT-specific evidence pointer.
6. no summary can silently omit provenance fields.

### P1 — normalize missing-input taxonomy

Replace unstructured `blocking_unknowns` strings with typed entries while preserving the old array:

```json
"blocking_inputs": [
  {
    "id": "holder_eligibility",
    "scope": "user_specific",
    "blocks": ["underwriting", "execution_automation"],
    "evidence_pointer": "RESULT.md:39"
  },
  {
    "id": "live_route_quote",
    "scope": "live_market",
    "blocks": ["execution_automation"],
    "evidence_pointer": "RESULT.md:35"
  }
]
```

### P1 — improve table presentation

A client table should not show only `Score` and `Decision`. Better columns:

- Symbol
- Type
- Chain
- Asset-quality score
- Research status
- Underwriting status
- Automation status
- PT overlay / points hurdle
- Main blocking inputs

### P2 — preserve current two-tool MCP surface

The project instructions say to keep exactly two public MCP tools unless asked otherwise. These improvements can fit inside `get_asset_summary` without adding tools.

Do not add a new public tool unless the product need is strong. If later needed, add a hidden/dev script rather than an MCP tool first.

## Implementation slices

1. Data-only compatibility patch:
   - add `score_interpretation`, `decision_layers`, and `pt_score_model` fields;
   - fill missing `missing_behavior` fields;
   - run `npm test`.

2. Validator hardening:
   - enforce score-range / selected-option consistency;
   - enforce evidence and provenance fields;
   - enforce PT inheritance declarations;
   - run `npm test`.

3. UI/table guidance:
   - update README examples and smoke output to label scores as `asset_quality_score`;
   - show PT overlays separately.

4. Optional future schema version:
   - introduce `asset_risk_v2` only after clients have adopted the compatibility fields.
   - avoid breaking the current `rubric.score` consumer contract prematurely.

## Bottom line

The source research is not the main problem. It contains real evidence and intentionally names unresolved production blockers.

The MCP summary layer needs clearer semantics and stricter validation. The numeric score should be presented as a precomputed asset-quality evidence score, PT rows should expose inherited-underlying-score vs PT-specific economics, and the single `decision_class` should be split into research / underwriting / automation layers.
