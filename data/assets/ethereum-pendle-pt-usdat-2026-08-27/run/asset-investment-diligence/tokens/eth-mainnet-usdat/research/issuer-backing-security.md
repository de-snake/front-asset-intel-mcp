# USDat issuer backing security

Status: review_required

## Issuer protocol entity

- Issuer/protocol entity: Saturn / Saturn Credit.
- Official docs describe USDat as Saturn's fully collateralized stablecoin for liquidity and settlement.
- External risk profile reviewed: Pharos USDat dossier, used as secondary context only.

## Backing NAV model

- Official Saturn docs say USDat maintains a 1:1 dollar peg and is backed by M0's tokenized U.S. Treasuries product at launch.
- Saturn's public site describes USDat as non-yielding and backed by tokenized U.S. treasuries.
- Decision effect: USDat is not ordinary liquid crypto collateral. The backing/NAV model depends on issuer and M0 reserve integrity, redemption access, and ongoing reserve composition.

## Transfer restrictions

- Official Saturn docs state that USDat is permissioned and that onboarded addresses are required to mint, redeem, or hold.
- On-chain probes found `isFrozen(address)` and `paused()` control surfaces.
- Decision effect: Credit Account use cannot be treated as permissionless unless the specific Credit Account, liquidation path, and recipient wallets are eligible and not frozen.

## Mint redeem access

- Saturn docs say onboarded users can mint/redeem 1:1 with USDC through Saturn's application, and that redemptions return USDC.
- No wallet eligibility, KYC state, or redemption capacity was supplied by the user.
- State: input_missing for wallet-specific eligibility and redemption readiness.
- Decision effect: execution automation is blocked until eligibility and redemption path are proven for the relevant wallet/Credit Account/liquidator path.

## Missing fields and decision effect

- Missing wallet eligibility blocks automation.
- Missing market/Credit Manager blocks protocol-specific collateral status.
- Missing position size blocks exit-liquidity and liquidation-route conclusions.
