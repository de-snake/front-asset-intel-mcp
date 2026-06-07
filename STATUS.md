# STATUS

- Date: 2026-06-07
- State: implemented and verified
- Summary: TypeScript MCP server scaffolded with two read-only tools, static rubric/data layout, APX + APY + PT seed assets, and a first-class MCP stdio smoke test (`npm run smoke:mcp`). The 2026-06-04 APYx social/quant overlay is now included in returned summaries and reports.

## Current artifact

- Runtime package: `projects/front-asset-intel-mcp/`
- MCP tools:
  - `get_asset_summary`
  - `get_asset_research`
- Seed data:
  - `data/assets/ethereum-apxusd/`
  - `data/assets/ethereum-pendle-pt-apxusd-2026-11-05/`
  - `data/assets/ethereum-apyusd/`
  - `data/assets/ethereum-pendle-pt-apyusd-2026-08-27/`
- Rubric:
  - `data/rubrics/asset_risk_v1.json`

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
- `tools/call get_asset_summary` resolves `PT-apxUSD` and returns the precomputed PT rubric JSON with the 0.4671% points hurdle overlay.
- `tools/call get_asset_summary` resolves `PT-apyUSD` and returns the 83-day quantitative overlay with 5.6168% required points ROI.
- `tools/call get_asset_research` resolves `PT-apyUSD` and returns the report section concluding it is a points/recovery trade, not clean carry.
