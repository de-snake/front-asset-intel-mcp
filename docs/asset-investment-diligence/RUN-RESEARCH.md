# Run research for a new asset

This repo serves precomputed asset intel. It does not research unknown tokens at MCP runtime.

Use this copied workflow when you need to produce a new `research.md` / `summary.asset_risk_v1.json` package before importing it into `data/assets/<asset-slug>/`.

## Inputs needed

Minimum token scope:

```json
{
  "chain_id": 1,
  "chain": "Ethereum mainnet",
  "symbol": "TOKEN",
  "token_address": "0x...",
  "issuer_or_protocol_hint": "Issuer/protocol if known",
  "intended_use": "candidate collateral diligence"
}
```

If the asset is a Pendle PT, also provide maturity and known market/PT addresses when available. If they are unknown, keep the fields as `null`; do not delete them.

## Run scope policy for MCP-quality reports

- Always run S1 token evidence mining.
- Always run S2 token analyst report.
- Run S3 PT market/economics only for a PT token or explicit PT market scope.
- Always include S4/S5 X/social research and synthesis for the final MCP-quality package.
- Always include S6 quantitative underwriting / return context for the final MCP-quality package.
- Finish with S7 verification.

Do not treat the output as an investment recommendation or execution instruction. Unknown issuer, redemption, freeze, oracle, liquidity, eligibility, admin, or route state must remain visible as `review_required`, `block_automation`, or `cannot_underwrite` behavior.

## Suggested prompt

```text
Run the asset investment diligence workflow for a new asset.

Repo: /Users/ilya/ai-assistant/projects/front-asset-intel-mcp
Workflow docs: docs/asset-investment-diligence/
Run artifact root: research-runs/<run-slug>

Token:
chain_id: <chain_id>
chain: <chain name>
symbol: <symbol>
token_address: <0x...>
issuer_or_protocol_hint: <issuer if known>
intended_use: candidate collateral diligence

Scope:
- Run S1 and S2 for the token.
- Run S3 only if this is a PT token / PT market scope.
- Run S4/S5 social research and synthesis.
- Run S6 quantitative underwriting / return context.
- Run S7 final verification.

Rules:
- Do not choose extra tokens.
- Write all artifacts under the run root.
- Keep source URLs, access dates, confidence, and missing-data behavior.
- Return only the run root, index path, report paths, verification result, and unresolved blockers.
```

## Import into the MCP data set

After the research package is reviewed, create:

```text
data/assets/<asset-slug>/
  manifest.json
  summary.asset_risk_v1.json
  research.md
```

For a direct token, `manifest.json` needs `asset_type: "token"` and `address`.
For a Pendle PT, use `asset_type: "pendle_pt"` and include `market_address`, `pt_address`, `sy_address`, `yt_address`, and `underlying_asset_id`.

Then run:

```bash
npm test
```

If adding a new direct-token slug, check `src/validate-data.ts`: some direct-token return-estimate validation is intentionally strict and may need the new slug added once the summary carries the required return context.
