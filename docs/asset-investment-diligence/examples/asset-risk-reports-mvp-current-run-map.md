# Example run map — asset-risk reports MVP

This file maps the completed asset-risk reports MVP diligence artifacts to the parent workflow manifest. It is a historical example from the pre-standardized flat output layout.

New runs must follow `../output-structure.md`: one returned run folder, `run-manifest.json`, `index.md`, one `tokens/<token-slug>/` subfolder per analyzed token, and one `pt-markets/<pt-scope-slug>/` subfolder per analyzed PT market. Use this file for content coverage examples, not path layout.

Current run scope:

- apyUSD and PT-apyUSD 27 Aug 2026.
- apxUSD and PT-apxUSD 05 Nov 2026.
- USDat and PT-USDat 27 Aug 2026.
- sUSDat and PT-sUSDat 27 Aug 2026.

Earlier asset reports also exist for PRIME and deSPXA, but the complete six-stage points/PT investment run is for the four tokens above and their PT markets.

## Legacy path map — S1 general asset mining

Completed token evidence directories:

- `research/eth-mainnet-apyusd/`
- `research/eth-mainnet-apxusd/`
- `research/eth-mainnet-usdat/`
- `research/eth-mainnet-susdat/`

Completed S1 research files:

- `research/eth-mainnet-apyusd/onchain-admin.md`
- `research/eth-mainnet-apyusd/issuer-backing-security.md`
- `research/eth-mainnet-apyusd/transfer-liquidity-oracle-governance.md`
- `research/eth-mainnet-apxusd/onchain-admin.md`
- `research/eth-mainnet-apxusd/issuer-backing-security.md`
- `research/eth-mainnet-apxusd/transfer-liquidity-oracle-governance.md`
- `research/eth-mainnet-usdat/onchain-admin.md`
- `research/eth-mainnet-usdat/issuer-backing-security.md`
- `research/eth-mainnet-usdat/transfer-liquidity-oracle-governance.md`
- `research/eth-mainnet-susdat/onchain-admin.md`
- `research/eth-mainnet-susdat/issuer-backing-security.md`
- `research/eth-mainnet-susdat/transfer-liquidity-oracle-governance.md`

Completed technical reports:

- `technical-reports/eth-mainnet-apyusd.md`
- `technical-reports/eth-mainnet-apxusd.md`
- `technical-reports/eth-mainnet-usdat.md`
- `technical-reports/eth-mainnet-susdat.md`

## S2 — Asset-risk analyst reports

Completed token analyst reports:

- `reports/eth-mainnet-apyusd.md`
- `reports/eth-mainnet-apxusd.md`
- `reports/eth-mainnet-usdat.md`
- `reports/eth-mainnet-susdat.md`

Completed token verification reports:

- `verification/eth-mainnet-apyusd.md`
- `verification/eth-mainnet-apxusd.md`
- `verification/eth-mainnet-usdat.md`
- `verification/eth-mainnet-susdat.md`
- `verification/final-six-asset-battery-verification.md`

## S3 — PT market/economics analysis

Completed PT index:

- `pendle-pt-index.md`

Completed PT analyst reports:

- `reports/pendle-pt-eth-mainnet-apyusd-2026-08-27.md`
- `reports/pendle-pt-eth-mainnet-apxusd-2026-11-05.md`
- `reports/pendle-pt-eth-mainnet-usdat-2026-08-27.md`
- `reports/pendle-pt-eth-mainnet-susdat-2026-08-27.md`

Completed PT technical reports:

- `technical-reports/pendle-pt-eth-mainnet-apyusd-2026-08-27.md`
- `technical-reports/pendle-pt-eth-mainnet-apxusd-2026-11-05.md`
- `technical-reports/pendle-pt-eth-mainnet-usdat-2026-08-27.md`
- `technical-reports/pendle-pt-eth-mainnet-susdat-2026-08-27.md`

Completed PT verification reports:

- `verification/pendle-pt-eth-mainnet-apyusd-2026-08-27.md`
- `verification/pendle-pt-eth-mainnet-apxusd-2026-11-05.md`
- `verification/pendle-pt-eth-mainnet-usdat-2026-08-27.md`
- `verification/pendle-pt-eth-mainnet-susdat-2026-08-27.md`
- `verification/final-pendle-pt-battery-verification.md`

## S4 — X/social mining

Completed X/social evidence artifacts:

- `x-research/x-research-apyusd-points-stac-pt-2026-08-27.md`
- `x-research/x-research-apxusd-points-stac-pt-2026-11-05.md`
- `x-research/x-research-usdat-points-stac-pt-2026-08-27.md`
- `x-research/x-research-susdat-points-stac-pt-2026-08-27.md`

These artifacts cover:

- APYx Pips narratives.
- Saturn Gravity Points narratives.
- PT fixed-yield / implied APY claims.
- STAC / STRC / yield narratives.
- Depeg, redemption, queue, liquidity, and control concerns.

## S5 — X/social synthesis

Completed synthesis:

- `x-research/index.md`

Completed verification:

- `verification/final-x-research-points-yield-verification.md`

## S6 — Quantitative underwriting

Completed methodology and decision layer:

- `<example_run_root>/investment-analysis/quantitative-underwriting-methodology.md`
- `<example_run_root>/investment-analysis/investment-analyst-report-points-pt-risk-return.md`
- `<example_run_root>/investment-analysis/index.md`

Base-case outputs recorded in the analyst report:

- PT-apxUSD risk-adjusted APR before points: 8.89%.
- PT-USDat risk-adjusted APR before points: 3.41%.
- PT-apyUSD risk-adjusted APR before points: -14.70%.
- PT-sUSDat risk-adjusted APR before points: -8.94%.

Points ROI required to clear a 10.00% net annualized hurdle:

- PT-apxUSD: 0.4671% over 153 days.
- PT-USDat: 1.4993% over 83 days.
- PT-apyUSD: 5.6168% over 83 days.
- PT-sUSDat: 4.3075% over 83 days.

## S7 — Final verification

Completed prior verification artifacts:

- `verification/final-battery-verification.md`
- `verification/final-six-asset-battery-verification.md`
- `verification/final-pendle-pt-battery-verification.md`
- `verification/final-x-research-points-yield-verification.md`

New workflow-level verification target:

- `verification/final-investment-analysis-verification.md`

## Current live-input blockers

The completed artifact set is a decision framework with base-case analyst priors. It is not a live allocation instruction.

Before capital allocation, refresh:

- current PT prices, accounting asset prices, and route quotes;
- wallet-specific points eligibility;
- total eligible points or wallet share of points buckets;
- current reserves, attestations, and backing data;
- current redemption eligibility, queue status, and claim status;
- current freeze, blacklist, pause, admin, and pending Safe state;
- size-specific exit slippage and liquidity under stress.

## Agent execution note

A future parent agent can use this map as an example artifact registry shape. For a new run, create a run-specific map under the chosen artifact root or under this example directory.
