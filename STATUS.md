# STATUS

- Date: 2026-06-07
- State: implemented and verified
- Summary: TypeScript MCP server scaffolded with two read-only tools, static rubric/data layout, APX/APY/PRIME/deSPXA/Saturn seed assets, PT market overlays, table-facing `agent_display` decisions, and a first-class MCP stdio smoke test (`npm run smoke:mcp`). The latest public rich token report branch (`front-knowledge-base` commit `b954049`) is normalized into returned summaries and reports.

## Current artifact

- Runtime package: `projects/front-asset-intel-mcp/`
- MCP tools:
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
  - `summary_schema_version: asset_summary_v1.2`
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

- `tools/list` exposes `get_asset_summary` and `get_asset_research`.
- `tools/call get_asset_summary` resolves all 10 seed assets: apxUSD, apyUSD, PRIME, deSPXA, USDat, sUSDat, PT-apxUSD, PT-apyUSD, PT-USDat, and PT-sUSDat.
- PT overlays return the expected points hurdle values:
  - PT-apxUSD: `0.4671%`
  - PT-apyUSD: `5.6168%`
  - PT-USDat: `1.4993%`
  - PT-sUSDat: `4.3075%`
- `tools/call get_asset_research` resolves PT-apyUSD, PT-USDat, and PT-sUSDat and verifies their points / risk-adjusted-return conclusions are present.
