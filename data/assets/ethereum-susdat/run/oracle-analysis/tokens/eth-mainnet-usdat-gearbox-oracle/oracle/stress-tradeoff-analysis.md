# USDat stress tradeoff analysis

Status: review_required

## Liquidity-cascade branch

If the USDat/USDC Curve market trades down and the Curve TWAP follows, the Credit Account borrower loses collateral value and may face liquidation pressure. Pool LPs are protected relative to a hardcoded peg because the oracle can recognize market stress, but liquidation success still depends on route depth and transfer eligibility.

## Liquidity-trap branch

If secondary liquidity remains quoted near the oracle but transfer/redeem eligibility fails, a liquidator may be unable to realize the oracle value. In that case the borrower may avoid immediate mark-to-market loss, while pool LPs bear bad-debt risk if collateral cannot be sold or redeemed by eligible parties.

## Side effects

- Borrower: market feed can be borrower-unfriendly during a temporary Curve dislocation.
- Pool LP: market feed is LP-protective versus a constant peg, but issuer restrictions can still trap value.
- Liquidator: route and recipient eligibility are essential.
- Curator/operator: must monitor feed bounds, issuer controls, and liquidity venue health.
