# USDat node classification

Status: review_required

Formula: `USDat/USD = market Curve TWAP(USDat/USDC) * hybrid bounded Chainlink USDC/USD`.

| Node | Source type | Taxonomy | Notes |
| --- | --- | --- | --- |
| USDat Curve TWAP feed | Curve pool trade-derived source | market / hybrid | Market-derived stablecoin price; wrapper has bounds. |
| Bounded USDC feed | Gearbox bounded wrapper | hybrid | Hard upper bound at 1.04 on the USDC/USD child. |
| Chainlink USDC/USD | AggregatorV3-compatible external feed | market | Push oracle with `stalenessPeriod=87300` on Gearbox bounded child. |
| Hardcoded category | not_applicable | hardcoded | No hardcoded 1.00 USDat price found in this path. |
| Fundamental / NAV category | not_applicable | fundamental / NAV | USDat backing is issuer/NAV-relevant, but the supplied Gearbox feed is market-derived. |

## Bounds and timestamp

The top USDat feed reported `skipCheck=true`, `lowerBound=0`, `upperBound=1e18`; the child USDC bounded feed reported `upperBound=104000000` and `skipCheck=false`. Timestamp was 2026-06-06 08:00:47 UTC.
