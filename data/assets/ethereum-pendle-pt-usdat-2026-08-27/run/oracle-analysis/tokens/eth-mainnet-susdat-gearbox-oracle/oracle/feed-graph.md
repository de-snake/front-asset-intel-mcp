# sUSDat feed graph

Status: review_required

## Recursive graph

Formula: `sUSDat/USD = ERC4626_exchange_rate(sUSDat -> USDat) * USDat/USD Gearbox feed`.

Child formula: `USDat/USD = Curve_TWAP(USDat/USDC, pool 0xF4d0...) * Bounded(Chainlink USDC/USD, upperBound 1.04)`.

| Node | Address | Classification | Evidence |
| --- | --- | --- | --- |
| Gearbox sUSDat feed | `0xe5d7ce380349f0380d8A216A75BCd1070C0ed5b1` | hybrid | `contractType=PRICE_FEED::ERC4626`, description `sUSDat / USD LP price feed` |
| sUSDat ERC-4626 exchange-rate node | `0xd166337499e176bbc38a1fbd113ab144e5bd2df7` | NAV / accounting | `asset()=USDat`, `convertToAssets(1e18)=953119` |
| Gearbox USDat child feed | `0x54DF8bAa0F35B767fFd2124c1D4F13788251E312` | hybrid / market | Curve TWAP plus bounded USDC/USD |
| Secondary sUSDat/USDC Curve pool | `0x6206cA315c2fCDd2A857b47EFB285AA12c529a7a` | market | Route/exit evidence only; not the oracle's primary value node |
| Hardcoded category | not_applicable | hardcoded | No hardcoded 1.00 sUSDat price found in this path |

## Latest values

- Effective sUSDat feed answer: 0.95272729 USD with 8 decimals.
- Feed timestamp: 2026-06-06 08:00:47 UTC.
- `getLPExchangeRate()` returned `953119`, or about 0.953119 USDat per 1 sUSDat.

## Decision effect

The graph recurses into the USDat feed and does not stop at the ERC-4626 label. It remains review_required because accounting value and immediate market exit value may diverge at liquidation time.
