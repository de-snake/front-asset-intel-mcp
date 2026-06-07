# front-asset-intel-mcp — Project Instructions

This project is a lightweight local MCP server for analyst-agent asset intelligence.

## Scope

- TypeScript MCP server.
- Runtime serves only precomputed local files.
- No runtime LLM calls, web crawling, extraction, scoring regeneration, or external API calls.
- Public MCP tools:
  - `list_available_assets`
  - `get_asset_summary`
  - `get_asset_research`

## Data contract

- Full Markdown reports live under `data/assets/<asset-slug>/research.md`.
- Rubric summaries live under `data/assets/<asset-slug>/summary.asset_risk_v1.json`.
- Each asset has a `manifest.json` with lookup aliases and source lineage.
- Shared rubric definitions live under `data/rubrics/`.

PT markets should not get an unrelated risk rubric by default. A PT changes the return/maturity profile and inherits the underlying asset-quality risk unless there is specific PT-level evidence that changes valuation, liquidity, maturity, or oracle risk.

## Commands

```bash
npm install
npm test
npm run build
node dist/server.js
```

Before reporting completion after edits, run `npm test` from this directory.

## Style

- Summaries are decision inputs, not prose notes.
- Preserve `unknown` vs `bad`: missing evidence can score conservatively, but the answer must say if the fact is unknown.
- Every scored answer needs evidence pointers.
- Blocking unknowns should name the specific missing input that prevents automation or underwriting.
