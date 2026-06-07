# USDat analyst report

Status: review_required

## Executive view

USDat is a plausible Analyze-stage collateral candidate, but not a Preview/Execute candidate from the supplied inputs. The strongest point is that the supplied Gearbox feed is market-derived from the USDat/USDC Curve pool rather than hardcoded at 1.00. The binding blockers are issuer eligibility, freeze/transfer controls, missing Credit Manager context, and missing position size.

## What the token represents

USDat is Saturn's non-yielding dollar token. Saturn docs describe it as backed by M0 tokenized U.S. Treasury exposure at launch and mintable/redeemable through Saturn for onboarded users.

## Main risk implications

The token is not ordinary permissionless stablecoin collateral. A Credit Account that cannot hold, transfer, redeem, or route USDat is operationally unsafe even if the market price and oracle are near par.

## Backing and NAV quality

The backing model is issuer/NAV-dependent. The docs support a treasury-backed launch model, but this run did not independently verify reserve reports or redemption capacity. Treat reserve and issuer-state evidence as review_required.

## Liquidity and exit risk

The USDat/USDC Curve venue has meaningful displayed liquidity, but position size was not supplied. The liquidity result supports continued analysis; it does not prove liquidation or unwind capacity.

## Controls, governance, and legal restrictions

USDat exposes freeze and pause surfaces, and the docs state onboarding is required to mint, redeem, or hold. This keeps automation human-in-the-loop until wallet-specific eligibility is proven.

## Pricing/oracle risk in plain language

Gearbox reads USDat through a Curve TWAP and bounded USDC/USD quote path. This can recognize market depeg pressure, which is LP-protective compared with a fixed peg, but it also exposes borrowers to market dislocations and depends on liquid Curve pricing.

## What must be checked before live use

- Exact Gearbox Credit Manager and allowed-token status.
- Wallet/Credit Account/liquidator eligibility to hold and transfer USDat.
- Position size and route quotes.
- User HF floor and risk policy.
- Issuer reserve/redemption freshness.

## Evidence quality

Evidence quality is adequate for Analyze-stage review and inadequate for execution. On-chain token/feed probes and market snapshots are current to this run; issuer and eligibility facts remain partly source-inconclusive or input_missing.

## Source map

- `technical-report.md`
- `research/onchain-admin.md`
- `research/issuer-backing-security.md`
- `research/transfer-liquidity-oracle-governance.md`

## Technical appendix pointer

See `technical-report.md` for fact-state details and unresolved decision effects.
