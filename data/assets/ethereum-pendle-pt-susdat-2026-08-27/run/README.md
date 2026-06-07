# Analyze -> Propose run - USDat and sUSDat

Status: review_required

This run root contains a fresh Gearbox Analyze -> Propose harness run for USDat and sUSDat as Ethereum mainnet collateral candidates while borrowing USDC at a 9% borrow-rate assumption. Preview and Execute are blocked.

## Child reports

- Asset harness report: `asset-investment-diligence/verification/workflow-harness-report.json`
- Asset final verification: `asset-investment-diligence/verification/final-investment-analysis-verification.md`
- Oracle harness report: `oracle-analysis/verification/workflow-harness-report.json`
- Oracle final verification: `oracle-analysis/verification/final-oracle-analysis-verification.md`
- Parent Analyze -> Propose return: `agentic-flow/analyze-and-propose.md`

## Read first

1. `agentic-flow/analyze-and-propose.md`
2. `asset-investment-diligence/index.md`
3. `oracle-analysis/index.md`

## Recommendation

USDat is the stronger Analyze-stage candidate. sUSDat remains higher risk because ERC-4626 accounting value can diverge from immediate liquidation value. Both require more inputs before Preview.

## Gates

Required next inputs: Gearbox market/Credit Manager, position size, target leverage, hold horizon, user risk policy, issuer eligibility/freeze/blacklist state, and size-specific route/liquidation quote.

## Old rich-report layers

- `x-research/` — USDat and sUSDat social/points/PT expectation notes.
- `investment-analysis/` — quantitative PT risk/return report and underwriting methodology.
- `pt-markets/` — PT-USDat and PT-sUSDat technical dossiers plus raw Pendle snapshots.
