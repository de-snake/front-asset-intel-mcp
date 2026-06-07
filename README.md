# front-asset-intel-mcp

Lightweight local TypeScript MCP server exposing **precomputed** asset research and rubric summaries for analyst agents.

This repo is intentionally runtime-small: the MCP server does not call an LLM, crawl the web, or regenerate research. It only serves validated local files.

## Why this exists

Long Markdown research reports are useful for diligence, but they are not a stable decision interface for an analyst agent. The server exposes two layers:

- `get_asset_summary` — compact rubric JSON with uniform questions, fixed scoring buckets, table-facing `agent_display` fields, per-rubric score/status/evidence-state fields, evidence snippets, blocking unknowns, and optional social/quantitative decision overlays.
- `get_asset_research` — full Markdown report for source review when the summary needs expansion.

## Tools

### `get_asset_summary`

Input accepts any one of:

- `asset_id`
- `symbol`
- slug / alias / token address / PT market address

Returns precomputed JSON.

For table/ranking UIs, use the `agent_display` block first:

- `agent_display.score_display` — explains whether the table score is direct asset-quality evidence or fixed-return PT economics with inherited underlying risk shown separately.
- `agent_display.decision_label` — human-usable action label such as "Block Preview/Execute", "Conditional PT candidate", or "Do not underwrite" instead of the legacy coarse `review_required` bucket.
- `agent_display.underwriting_status` and `agent_display.execution_automation_status` — separate research/underwriting readiness from automation safety.
- `agent_display.primary_blockers` and `agent_display.next_action` — the concrete reason the row is not executable and what input is needed next.

`rubric.score` / `rubric.decision_class` remain for backward compatibility and deterministic score validation. Do not use those two fields alone as the table decision: PT rows expose a separate fixed-return table score, and `review_required` is only a legacy score-bucket class.

For non-PT/simple-token rows, summaries also expose `simple_token_return_estimate` at the top level and mirrored in `agent_display.simple_token_return_estimate`, plus a compact `agent_display.simple_token_return_display`. These estimates separate: organic return from holding the token (`organic_yield_apy_estimate`, `organic_roi_over_horizon`), modeled points value (`estimated_points_roi_over_horizon`, `estimated_points_annualized_return`, `points_roi_scenarios_over_horizon`), expected-loss scenarios (`expected_loss_prior`, `expected_loss_prior_scenarios`), and the net analyst hurdle line (`risk_adjusted_roi_before_points`, `risk_adjusted_roi_after_base_points`, `risk_adjusted_roi_scenarios_after_base_points`, `risk_adjusted_annualized_return_after_base_points`).

The normalized base formula is `risk_adjusted_roi_after_base_points = organic_roi_over_horizon + estimated_points_roi_over_horizon - expected_loss_prior - exit_cost_assumption`, then annualized linearly over `horizon_days` for table comparability. `expected_loss_prior_scenarios` keeps low/base/high loss cases so a conservative stress haircut is not mistaken for the only average estimate; `risk_adjusted_roi_scenarios_after_base_points` recomputes the same formula under the low-loss/base/high-loss cases while holding base points ROI constant.

Source assumptions are precomputed from the local report packages and named inside each estimate `basis` / `evidence`; where no live quant pass or points program exists, the estimate is deliberately low-confidence and points ROI is `0`, not omitted.

Example asset lookups:

- `apxUSD`
- `apyUSD`
- `PRIME`
- `deSPXA`
- `USDat`
- `sUSDat`
- `PT-apxUSD`
- `PT-apyUSD`
- `PT-USDat`
- `PT-sUSDat`
- `ethereum:0x98a878b1cd98131b271883b390f68d2c90674665`
- `0xaf0349fb9b1ba07d34381870c59b560b31412660`
- `0x30bb9ee8dc6aab322dc3a0d36063cbf06a9e5952`
- `0x9afe7a057a09cf5da748d952078c9c99938b4329`
- `0x91bc86899c8391b6caaf26535b9cd82efe49a189`

### `get_asset_research`

Same lookup input. Returns the full Markdown research report. For non-PT/simple-token rows, the MCP response also prepends a validated `## Precomputed simple-token return estimate` block copied from the summary JSON, so research-only callers receive organic ROI, estimated points ROI, expected-loss low/base/high bands, and risk-adjusted ROI before the source report body. PT research responses keep `simple_token_return_estimate: none` and do not add points assumptions.

## Seed assets

- `ethereum-apxusd` — Apyx apxUSD token-level research and `asset_risk_v1` summary, refreshed from the public rich report package.
- `ethereum-pendle-pt-apxusd-2026-11-05` — Pendle PT apxUSD 05 Nov 2026 research and summary with fixed-return risk-adjusted APY / hurdle overlay.
- `ethereum-apyusd` — Apyx apyUSD public RESULT.md report, including X/social and quantitative risk/return layers.
- `ethereum-pendle-pt-apyusd-2026-08-27` — Pendle PT apyUSD 27 Aug 2026 report and summary, including the 83-day fixed-return recovery trade overlay.
- `ethereum-prime` — Hastra PRIME rich public report package normalized into the asset-quality rubric.
- `base-despxa` — Centrifuge deSPXA rich public report package normalized into the asset-quality rubric.
- `ethereum-usdat` — Saturn USDat collateral package with Gearbox feed/oracle context, X/social layer, and public asset reports.
- `ethereum-susdat` — Saturn sUSDat collateral package with ERC-4626/feed context, X/social layer, and public asset reports.
- `ethereum-pendle-pt-usdat-2026-08-27` — Pendle PT USDat 27 Aug 2026 PT market dossier plus quantitative fixed-return hurdle overlay.
- `ethereum-pendle-pt-susdat-2026-08-27` — Pendle PT sUSDat 27 Aug 2026 PT market dossier plus quantitative fixed-return hurdle overlay.

PT markets reuse the underlying asset-risk rubric for inherited issuer/backing/control context, but table ranking uses PT-specific fixed-return economics. The PT adds a `return_profile` block plus optional `social_research_layer` and `quantitative_risk_return_layer` blocks: maturity, PT price, accounting-asset price, gross ROI, annualized return, expected-loss prior, risk-adjusted return after expected loss/exit cost, break-even drawdown, and liquidity snapshot. PT holders underwrite the fixed discount-to-maturity; variable yield is separated into YT and not part of the PT-holder return.

## Data layout

```text
data/
  rubrics/
    asset_risk_v1.json
  assets/
    <asset-slug>/
      manifest.json
      summary.asset_risk_v1.json
      research.md
src/
  server.ts
  registry.ts
  validate-data.ts
  smoke.ts
```

## Rubric model

`asset_risk_v1` totals 100 points:

- Backing / NAV evidence: 18
- Redemption and holder eligibility: 18
- Market liquidity and peg behavior: 18
- Issuer controls and governance: 14
- Oracle / accounting alignment: 10
- Audits and security review: 12
- Incidents and social stress: 10

Each dimension has fixed answer buckets and score ranges. Summaries store the selected bucket, score, `score_band`, dimension-level action `status`, `evidence_state`, evidence, confidence, blocking unknowns, and — where available — `social_research_layer` / `quantitative_risk_return_layer` overlays that expose fixed-return APY, hurdle, expected-loss, and risk-adjusted-return information without folding those economics into the 100-point asset-quality score.

Dimension `status` values are action-oriented:

- `usable_for_review` — this dimension has usable evidence and does not itself force a review gate.
- `review_required` — evidence is partial, stale, or size/holder-specific enough that an analyst must review it.
- `block_automation` — the dimension can be discussed, but automated Preview/Execute should not proceed until the missing input is resolved.
- `cannot_underwrite` — the dimension contains a material valuation/risk gap or negative evidence that prevents underwriting under current assumptions.

`score_band` is the scoring bucket quality (`strong`, `partial`, `weak`). `evidence_state` preserves whether the status came from verified support, partial support, source inconclusiveness, missing/unknown evidence, or negative evidence.

## Install and verify

```bash
npm install
npm test
```

`npm test` runs:

1. TypeScript build.
2. Data validation against manifests/rubric schema.
3. Registry smoke lookups for apxUSD, apyUSD, PRIME, deSPXA, USDat, sUSDat, and PT assets.
4. Real MCP stdio smoke test:
   - initializes the MCP server;
   - checks `tools/list` exposes `get_asset_summary` and `get_asset_research`;
   - calls `get_asset_summary` for APYx, Saturn, PRIME, and deSPXA assets;
   - verifies PT fixed-return table scores and risk-adjusted APY values for `PT-apxUSD`, `PT-apyUSD`, `PT-USDat`, and `PT-sUSDat`;
   - calls `get_asset_research` for all simple-token reports and verifies the prepended organic ROI / estimated points ROI / risk-adjusted ROI block mirrors the summary estimate;
   - calls `get_asset_research` for PT reports and verifies the fixed-return risk-adjusted conclusions are present without simple-token points assumptions.

For only the MCP protocol smoke after a build:

```bash
npm run build
npm run smoke:mcp
```

## Run as local MCP server

```bash
npm run build
node dist/server.js
```

Example MCP client command config:

```json
{
  "mcpServers": {
    "front-asset-intel": {
      "command": "node",
      "args": ["/absolute/path/to/front-asset-intel-mcp/dist/server.js"]
    }
  }
}
```

From this workspace, the absolute command target is:

```text
/Users/ilya/ai-assistant/projects/front-asset-intel-mcp/dist/server.js
```

## Source lineage

Seed reports were copied or condensed from the public Front KB rich-report branch (`de-snake/front-knowledge-base`, commit `b954049`):

- `dev/implementation/reproducible-runs/apxusd-investment-research-20260604/RESULT.md`
- `dev/implementation/reproducible-runs/apyusd-investment-research-20260604/RESULT.md`
- `dev/implementation/reproducible-runs/prime-investment-research-20260604/RESULT.md`
- `dev/implementation/reproducible-runs/despxa-investment-research-20260604/RESULT.md`
- `dev/implementation/reproducible-runs/usdat-susdat-collateral-20260606/RESULT.md`
- PT market and overlay support files under those run directories, plus the older `asset-risk-reports-mvp` X/social and quantitative risk/return files where the public RESULT package incorporated them.

Summaries are precomputed from those reports and preserve source pointers back to front KB.
