# STATUS

- Date: 2026-06-07
- State: implemented and verified
- Summary: TypeScript MCP server scaffolded with two read-only tools, static rubric/data layout, APX + PT-apxUSD seed assets, and a first-class MCP stdio smoke test (`npm run smoke:mcp`).

## Current artifact

- Runtime package: `projects/front-asset-intel-mcp/`
- MCP tools:
  - `get_asset_summary`
  - `get_asset_research`
- Seed data:
  - `data/assets/ethereum-apxusd/`
  - `data/assets/ethereum-pendle-pt-apxusd-2026-11-05/`
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
- `tools/call get_asset_summary` resolves `PT-apxUSD` and returns the precomputed PT rubric JSON.
