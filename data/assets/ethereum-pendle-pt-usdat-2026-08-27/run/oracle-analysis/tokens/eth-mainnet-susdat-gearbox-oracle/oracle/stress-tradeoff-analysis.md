# sUSDat stress tradeoff analysis

Status: review_required

## Liquidity-cascade branch

If sUSDat secondary-market pricing falls below the ERC-4626 accounting value and liquidators can only exit through the Curve market, liquidations can cascade through a thin pool. Borrowers may be liquidated against accounting value shifts, and LPs can inherit bad-debt risk if market execution lags the oracle value.

## Liquidity-trap branch

If the ERC-4626 feed remains near accounting value while withdrawal queue processing, STRC execution, or transfer eligibility blocks realization, the collateral can become a liquidity trap. Borrowers may appear solvent by oracle accounting, while pool LPs and liquidators face delayed or discounted recovery.

## Side effects

- Borrower: ERC-4626 accounting can be favorable when secondary markets are temporarily discounted, but harmful if exchange-rate bounds or child USDat feed move down.
- Pool LP: exposed to accounting/realization mismatch and issuer/queue constraints.
- Liquidator: needs immediate route depth or queue access; otherwise execution risk is high.
- Curator/operator: must monitor child USDat feed, sUSDat exchange-rate bounds, queue processing, STRC/NAV disclosures, and liquidity venues.
