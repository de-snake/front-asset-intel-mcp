# sUSDat node classification

Status: review_required

Formula: `sUSDat/USD = NAV/accounting ERC4626 exchange rate * hybrid market-derived USDat/USD`.

| Node | Source type | Taxonomy | Notes |
| --- | --- | --- | --- |
| sUSDat ERC4626 feed | Gearbox ERC4626 wrapper | hybrid | Combines vault accounting with child USD feed. |
| ERC4626 exchange-rate node | Vault accounting | NAV | `convertToAssets(1e18)=0.953119 USDat`. |
| USDat child feed | Curve TWAP plus bounded USDC/USD | market / hybrid | Same market-derived path as USDat analysis. |
| Secondary sUSDat market | Curve pool | market | Used for exit stress, not primary feed formula. |
| Fundamental category | issuer / strategy context | fundamental | STRC/digital-credit exposure affects redemption quality, not directly the on-chain share-rate math. |
| Hardcoded category | not_applicable | hardcoded | No hardcoded top-level peg found. |

## Bounds and timestamp

The sUSDat feed reported `lowerBound=934371`, `upperBound=953058`, `getLPExchangeRate=953119`, `skipCheck=true`, and latest answer 0.95272729 USD at 2026-06-06 08:00:47 UTC. The small difference between exchange-rate probe and effective answer should be reviewed before production use.
