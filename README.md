# front-asset-intel-mcp

Lightweight local TypeScript MCP server exposing **precomputed** asset research and rubric summaries for analyst agents.

This repo is intentionally runtime-small: the MCP server does not call an LLM, crawl the web, or regenerate research. It only serves validated local files.

## Why this exists

Long Markdown research reports are useful for diligence, but they are not a stable decision interface for an analyst agent. The server exposes two layers:

- `get_asset_summary` — compact rubric JSON with uniform questions, fixed scoring buckets, evidence snippets, blocking unknowns, and optional social/quantitative decision overlays.
- `get_asset_research` — full Markdown report for source review when the summary needs expansion.

## Tools

### `get_asset_summary`

Input accepts any one of:

- `asset_id`
- `symbol`
- slug / alias / token address / PT market address

Returns precomputed JSON.

Example asset lookups:

- `apxUSD`
- `ethereum:0x98a878b1cd98131b271883b390f68d2c90674665`
- `PT-apxUSD`
- `0xaf0349fb9b1ba07d34381870c59b560b31412660`
- `apyUSD`
- `PT-apyUSD`
- `0x30bb9ee8dc6aab322dc3a0d36063cbf06a9e5952`

### `get_asset_research`

Same lookup input. Returns the full Markdown research report.

## Seed assets

- `ethereum-apxusd` — Apyx apxUSD token-level research and `asset_risk_v1` summary, now with APYx social/quant stress overlay.
- `ethereum-pendle-pt-apxusd-2026-11-05` — Pendle PT apxUSD 05 Nov 2026 research and summary, now with risk-adjusted hurdle/points overlay.
- `ethereum-apyusd` — Apyx apyUSD public RESULT.md report, including X/social and quantitative risk/return layers.
- `ethereum-pendle-pt-apyusd-2026-08-27` — Pendle PT apyUSD 27 Aug 2026 report and summary, including the 83-day PT-apyUSD points/recovery trade overlay.

PT markets reuse the underlying asset-risk rubric. The PT only adds a `return_profile` block plus optional `social_research_layer` and `quantitative_risk_return_layer` blocks: maturity, PT price, accounting-asset price, gross ROI, annualized return, expected-loss prior, risk-adjusted return, points hurdle, break-even drawdown, and liquidity snapshot. This keeps issuer/backing/control risk comparable and avoids pretending that a PT wrapper improves underlying asset quality.

## Data layout

```text
data/
  rubrics/
    asset_risk_v1.json
  assets/
    ethereum-apxusd/
      manifest.json
      summary.asset_risk_v1.json
      research.md
    ethereum-pendle-pt-apxusd-2026-11-05/
      manifest.json
      summary.asset_risk_v1.json
      research.md
    ethereum-apyusd/
      manifest.json
      summary.asset_risk_v1.json
      research.md
    ethereum-pendle-pt-apyusd-2026-08-27/
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

Each dimension has fixed answer buckets and score ranges. Summaries store the selected bucket, score, evidence, confidence, blocking unknowns, and — where available — `social_research_layer` / `quantitative_risk_return_layer` overlays that expose points, hurdle, expected-loss, and risk-adjusted-return information without folding those economics into the 100-point asset-quality score.

## Install and verify

```bash
npm install
npm test
```

`npm test` runs:

1. TypeScript build.
2. Data validation against manifests/rubric schema.
3. Registry smoke lookups for apxUSD, apyUSD, PT-apxUSD, and PT-apyUSD.
4. Real MCP stdio smoke test:
   - initializes the MCP server;
   - checks `tools/list` exposes `get_asset_summary` and `get_asset_research`;
   - calls `get_asset_summary` for `PT-apxUSD` and verifies its points hurdle overlay;
   - calls `get_asset_summary` for `PT-apyUSD` and verifies the `5.6168%` points ROI hurdle is present;
   - calls `get_asset_research` for `PT-apyUSD` and verifies the points/recovery-trade conclusion is present.

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

Seed reports were copied or condensed from:

- `projects/front-knowledge-base/dev/implementation/asset-risk-reports-mvp/reports/eth-mainnet-apxusd.md`
- `projects/front-knowledge-base/dev/implementation/asset-risk-reports-mvp/reports/pendle-pt-eth-mainnet-apxusd-2026-11-05.md`
- `front-knowledge-base/dev/implementation/reproducible-runs/apyusd-investment-research-20260604/RESULT.md`
- `projects/front-knowledge-base/dev/implementation/asset-risk-reports-mvp/reports/pendle-pt-eth-mainnet-apyusd-2026-08-27.md`
- `projects/front-knowledge-base/dev/implementation/asset-risk-reports-mvp/x-research/x-research-apxusd-points-stac-pt-2026-11-05.md`
- `projects/front-knowledge-base/dev/implementation/asset-risk-reports-mvp/x-research/x-research-apyusd-points-stac-pt-2026-08-27.md`
- `projects/front-knowledge-base/dev/implementation/asset-risk-reports-mvp/investment-analysis/investment-analyst-report-points-pt-risk-return.md`

Summaries are precomputed from those reports and preserve source pointers back to front KB.
