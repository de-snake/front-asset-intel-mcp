# sUSDat analyst report

Status: review_required

## Executive view

sUSDat is a higher-risk Analyze-stage collateral candidate than USDat. The supplied Gearbox feed does recurse into the USDat feed through ERC-4626 accounting, but the asset adds digital-credit/STRC exposure, queue-based redemption, blacklist/pause controls, and shallower secondary liquidity. It is not suitable for Preview/Execute from the supplied inputs.

## What the token represents

sUSDat is Saturn's ERC-4626 yield-bearing vault token. It represents a share of a managed pool whose yield is tied to digital credit exposure, including STRC according to Saturn docs.

## Main risk implications

The key risk is not only price volatility. The relevant question is whether the accounting value can be realized under liquidation timing and at the proposed size. The queue and secondary-market discount matter directly for Gearbox LP bad-debt risk.

## Backing and NAV quality

The NAV model is issuer and strategy dependent. Docs describe STRC exposure, reward vesting, dynamic reserve allocation, and offchain verification work. This is a review_required NAV branch, not ordinary liquid stablecoin collateral.

## Liquidity and exit risk

The observed sUSDat/USDC Curve venue is materially smaller than the USDat venue. Secondary-market pricing around the run was below the ERC-4626/Gearbox accounting value, so route sizing is mandatory.

## Controls, governance, and legal restrictions

sUSDat exposes blacklist and pause surfaces. Because the underlying USDat is permissioned, both sUSDat and its redemption output inherit eligibility concerns.

## Pricing/oracle risk in plain language

Gearbox values sUSDat as an ERC-4626 share times the USDat feed. That is structurally recursive and better than a top-level label, but it can be borrower-friendly and LP-risky if liquidators must sell into a discounted or thin secondary market instead of realizing queue value.

## What must be checked before live use

- Exact Gearbox Credit Manager and allowed-token status.
- Wallet/Credit Account/liquidator eligibility for both sUSDat and USDat.
- Position-size route quote for sUSDat exit.
- Queue processing state, minimum-output behavior, and STRC execution path.
- User HF floor, hold horizon, and risk policy.

## Evidence quality

Evidence quality is adequate for Analyze-stage triage. It is not decision-grade for execution because the most important facts are size-, wallet-, and market-specific.

## Source map

- `technical-report.md`
- `research/onchain-admin.md`
- `research/issuer-backing-security.md`
- `research/transfer-liquidity-oracle-governance.md`

## Technical appendix pointer

See `technical-report.md` for fact-state details and unresolved decision effects.
