# front-asset-intel-mcp

Lightweight local TypeScript MCP server exposing **precomputed** asset research and rubric summaries for analyst agents.

This repo is intentionally runtime-small: the MCP server does not call an LLM, crawl the web, or regenerate research. It only serves validated local files.

## Why this exists

Long Markdown research reports are useful for diligence, but they are not a stable decision interface for an analyst agent. The server exposes two layers:

- `get_asset_summary` — compact rubric JSON with uniform questions, fixed scoring buckets, evidence snippets, and blocking unknowns.
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

### `get_asset_research`

Same lookup input. Returns the full Markdown research report.

## Seed assets

- `ethereum-apxusd` — Apyx apxUSD token-level research and `asset_risk_v1` summary.
- `ethereum-pendle-pt-apxusd-2026-11-05` — Pendle PT apxUSD 05 Nov 2026 research and summary.

PT markets reuse the underlying asset-risk rubric. The PT only adds a `return_profile` block: maturity, PT price, accounting-asset price, gross ROI, annualized return, break-even drawdown, and liquidity snapshot. This keeps issuer/backing/control risk comparable and avoids pretending that a PT wrapper improves underlying asset quality.

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

Each dimension has fixed answer buckets and score ranges. Summaries store the selected bucket, score, evidence, confidence, and blocking unknowns.

## Install and verify

```bash
npm install
npm test
```

`npm test` runs:

1. TypeScript build.
2. Data validation against manifests/rubric schema.
3. Registry smoke lookups for apxUSD and PT-apxUSD.
4. Real MCP stdio smoke test:
   - initializes the MCP server;
   - checks `tools/list` exposes `get_asset_summary` and `get_asset_research`;
   - calls `get_asset_summary` for `PT-apxUSD`;
   - calls `get_asset_research` for `apxUSD`.

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

Seed reports were copied from:

- `projects/front-knowledge-base/dev/implementation/asset-risk-reports-mvp/reports/eth-mainnet-apxusd.md`
- `projects/front-knowledge-base/dev/implementation/asset-risk-reports-mvp/reports/pendle-pt-eth-mainnet-apxusd-2026-11-05.md`

Summaries are precomputed from those reports and preserve source pointers back to front KB.
