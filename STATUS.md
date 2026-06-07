# STATUS

- Date: 2026-06-07
- State: implemented and verified
- Summary: TypeScript MCP server scaffolded with three read-only tools (`list_available_assets`, `get_asset_summary`, `get_asset_research`), static rubric/data layout, APX/APY/PRIME/deSPXA/Saturn seed assets, PT fixed-return overlays, table-facing `agent_display` decisions, scoring-helper `dimensions[].possible_grades` anchors, and a shared normalized `return_context` for both summary JSON and research Markdown. The return layer covers PT fixed-maturity ROI, non-PT/direct organic or variable ROI, modeled farming value, expected-loss/exit-cost bands, risk-adjusted ROI, and social/X plus quantitative overlays. The latest public rich token report branch (`front-knowledge-base` commit `b954049`) is normalized into returned summaries and reports.

## Current artifact

- Runtime package: `projects/front-asset-intel-mcp/`
- MCP tools:
  - `list_available_assets`
  - `get_asset_summary`
  - `get_asset_research`
- Seed data:
  - `data/assets/ethereum-apxusd/`
  - `data/assets/ethereum-apyusd/`
  - `data/assets/ethereum-prime/`
  - `data/assets/base-despxa/`
  - `data/assets/ethereum-usdat/`
  - `data/assets/ethereum-susdat/`
  - `data/assets/ethereum-pendle-pt-apxusd-2026-11-05/`
  - `data/assets/ethereum-pendle-pt-apyusd-2026-08-27/`
  - `data/assets/ethereum-pendle-pt-usdat-2026-08-27/`
  - `data/assets/ethereum-pendle-pt-susdat-2026-08-27/`
- Rubric:
  - `data/rubrics/asset_risk_v1.json`
- Summary contract:
  - Token summaries use `summary_schema_version: asset_summary_v1.2` with direct asset-quality table scores.
  - `get_asset_summary` enriches each `dimensions[]` topic with `possible_grades`: all rubric options with conditions, score ranges, selected/higher/lower relation, and default status/evidence state, so analyst agents can compare the current asset state against nearby weaker/stronger buckets instead of reading a terse score in isolation.
  - Both public tools expose the same `return_context` derived from the saved local summary/report package, so research callers and summary callers see the same ROI basis rather than a copied bolt-on block.
  - Non-PT/direct token summaries expose `return_context.kind = direct_or_variable_token_return`, including organic/variable ROI, fresh-farming points ROI backed by `points_farming_thesis`, expected-loss low/base/high scenarios, and base/band risk-adjusted ROI.
  - PT summaries expose `return_context.kind = fixed_maturity_pt_return`, including `return_profile` fixed discount-to-maturity ROI/APY, expected-loss/exit-cost assumptions, break-even drawdown, liquidity, and risk-adjusted ROI/annualized return. Variable yield/incentive economics remain separated into YT and are not counted as PT-holder base ROI.
  - `return_context` carries available social/X and quantitative risk/return overlays for both kinds.
  - Points estimates no longer use cheap safe floors as the visible decision case: APYx and Saturn rows carry route-specific farming formulas with allocation, remaining season, multipliers, FDV scenarios, raw TVL proxy, weighted-denominator scenarios, evidence, and confidence/freshness limits; PRIME/deSPXA keep zero points with `no_confirmed_points_program`.
  - PT summaries use `summary_schema_version: asset_summary_v1.3` with `agent_display.score_source: pt_fixed_return_trade_score`; inherited asset-quality risk remains in `agent_display.inherited_asset_quality_score` / legacy `rubric.score`.
  - `agent_display.score_display`, `decision_label`, `underwriting_status`, `execution_automation_status`, `primary_blockers`, and `next_action` are the preferred table/ranking fields.
  - Legacy `rubric.score` / `rubric.decision_class` remain for backward compatibility and deterministic validation only.

## Verification

Passed on 2026-06-07:

```bash
npm test
python3 scripts/workspace_sync.py --check
python3 scripts/workspace_policy_check.py --all
```

`npm test` includes:

- TypeScript build.
- Data validation.
- Registry smoke lookup.
- MCP stdio smoke (`npm run smoke:mcp`).

MCP stdio smoke verified:

- `tools/list` exposes `list_available_assets`, `get_asset_summary`, and `get_asset_research`.
- `tools/call list_available_assets` returns the 10-asset capability map with accepted lookup values and example summary/research calls.
- `tools/call get_asset_summary` resolves all 10 seed assets: apxUSD, apyUSD, PRIME, deSPXA, USDat, sUSDat, PT-apxUSD, PT-apyUSD, PT-USDat, and PT-sUSDat.
- `tools/call get_asset_summary` verifies scoring-helper metadata and 3 comparable `possible_grades` buckets per rubric dimension, including backing/NAV anchors from monthly/no-granularity through daily aggregated attestations to realtime/daily granular reconciled reporting.
- Direct/variable-token summaries return normalized `return_context` with organic ROI, fresh-farming points ROI, expected-loss low/base/high bands, social/X context, and risk-adjusted ROI estimates for apxUSD, apyUSD, PRIME, deSPXA, USDat, and sUSDat.
- PT overlays return fixed-return table scores and risk-adjusted APY after expected loss / exit cost:
  - PT-apxUSD: `62/100`, `8.89%` risk-adjusted APY.
  - PT-apyUSD: `11/100`, `-14.70%` risk-adjusted APY.
  - PT-USDat: `27/100`, `3.41%` risk-adjusted APY.
  - PT-sUSDat: `31/100`, `-8.94%` risk-adjusted APY.
- `tools/call get_asset_research` resolves apxUSD, apyUSD, PRIME, deSPXA, USDat, and sUSDat and verifies the inline normalized return context includes organic/variable ROI, fresh-farming points ROI, risk-adjusted ROI, and social/X context mirrored from summary JSON.
- `tools/call get_asset_research` resolves PT-apyUSD, PT-USDat, and PT-sUSDat and verifies their fixed-return risk-adjusted conclusions are present without simple-token points assumptions.
