# sUSDat issuer backing security

Status: review_required

## Issuer protocol entity

- Issuer/protocol entity: Saturn / Saturn Credit.
- sUSDat is documented as the yield-bearing Saturn vault token.

## Backing NAV model

- Saturn docs describe sUSDat as an ERC-4626 vault token backed by USDat and digital credit exposure.
- Saturn docs state that sUSDat yield is generated from STRC exposure, with rewards vesting linearly over 30 days.
- Dynamic reserve docs describe allocation between M and digital credit based on a backing-ratio model.
- Decision effect: sUSDat has materially more complex NAV and redemption risk than USDat. It is an issuer-controlled, offchain-digital-credit-linked vault share.

## Transfer restrictions

- On-chain probes found `isBlacklisted(address)` and `paused()` surfaces.
- Saturn docs describe sUSDat redemption through a withdrawal queue or secondary markets.
- Decision effect: a liquidator may need immediate secondary-market liquidity; the queue process may be too slow for ordinary liquidation assumptions.

## Mint redeem access

- `asset()` confirms USDat as the underlying asset.
- Docs describe unstaking as request, processing, and claim, with an NFT queue receipt and market execution by Saturn's processor.
- No wallet eligibility, queue timing, processing capacity, STRC execution capacity, or user minimum-output policy was supplied.
- State: input_missing for live redemption readiness.
- Decision effect: Preview/Execute is blocked.

## Missing fields and decision effect

- Missing Credit Manager blocks allowed-token status.
- Missing position size blocks route/liquidation depth.
- Missing wallet eligibility and queue state blocks automation.
- Missing hold horizon blocks risk/return assessment.
