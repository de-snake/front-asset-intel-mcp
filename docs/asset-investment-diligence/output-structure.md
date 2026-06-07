# Output structure — asset investment diligence workflow

Every asset-investment-diligence run returns one artifact folder. The parent agent should return this folder path plus a short summary, not a set of loose report paths.

## Canonical run folder

```text
<run_artifact_root>/
  README.md
  run-manifest.json
  index.md

  tokens/
    <token-slug>/
      scope.json
      research/
        onchain-admin.md
        issuer-backing-security.md
        transfer-liquidity-oracle-governance.md
      technical-report.md
      analyst-report.md
      verification.md

  pt-markets/
    <pt-scope-slug>/
      scope.json
      technical-report.md
      analyst-report.md
      verification.md
    index.md

  x-research/
    <scope-slug>.md
    index.md

  investment-analysis/
    quantitative-underwriting-methodology.md
    investment-analyst-report-points-pt-risk-return.md
    index.md

  verification/
    final-investment-analysis-verification.md
```

## Slug rules

Token slug:

```text
<chain>-<symbol>-<address-prefix>
```

Example:

```text
ethereum-susdat-d1663374
```

PT market slug:

```text
<chain>-pt-<underlying-symbol>-<maturity>-<market-prefix>
```

Example:

```text
ethereum-pt-susdat-2026-08-27-abc12345
```

Social scope slug:

```text
<token-slug>
<pt-scope-slug>
portfolio
```

## Required top-level files

### `run-manifest.json`

Required fields:

```json
{
  "workflow_id": "asset-investment-diligence-v1",
  "run_id": "asset-diligence-YYYY-MM-DD",
  "run_artifact_root": "research-runs/<run-slug>",
  "tokens": [
    {
      "token_slug": "ethereum-susdat-d1663374",
      "chain": "Ethereum mainnet",
      "symbol": "sUSDat",
      "address": "0xd166337499e176bbc38a1fbd113ab144e5bd2df7",
      "artifact_dir": "tokens/ethereum-susdat-d1663374",
      "status": "pass | review_required | blocked"
    }
  ],
  "pt_markets": [],
  "x_research_scopes": [],
  "final_index": "index.md",
  "final_verification": "verification/final-investment-analysis-verification.md"
}
```

### `index.md`

Human-readable run summary:

- tokens analyzed;
- PT markets analyzed;
- headline risk / return findings;
- missing data and blockers;
- artifact map;
- final verification status.

### `README.md`

Short handoff page:

- what was analyzed;
- where the manifest is;
- where each token / PT folder is;
- which files to read first;
- final validation status.

## Required per-token files

Each token folder must contain:

- `scope.json`;
- `research/onchain-admin.md`;
- `research/issuer-backing-security.md`;
- `research/transfer-liquidity-oracle-governance.md`;
- `technical-report.md`;
- `analyst-report.md`;
- `verification.md`.

## Required per-PT files

Each PT folder must contain:

- `scope.json`;
- `technical-report.md`;
- `analyst-report.md`;
- `verification.md`.

The run-level `pt-markets/index.md` summarizes all PT scopes.

## Parent-agent return contract

A completed workflow run returns:

```json
{
  "status": "pass | review_required | blocked",
  "run_artifact_root": "research-runs/<run-slug>",
  "manifest": "research-runs/<run-slug>/run-manifest.json",
  "index": "research-runs/<run-slug>/index.md",
  "token_dirs": [
    "research-runs/<run-slug>/tokens/ethereum-susdat-d1663374"
  ],
  "pt_market_dirs": [],
  "final_verification": "research-runs/<run-slug>/verification/final-investment-analysis-verification.md",
  "summary": {
    "tokens_analyzed": 1,
    "pt_markets_analyzed": 0,
    "blocked_scopes": 0,
    "review_required_scopes": 1,
    "dominant_blockers": ["issuer redemption queue depth unknown"]
  }
}
```

The user-facing answer should include the run folder path, final index path, token folders, and final verification path. It should not paste raw source notes unless requested.
