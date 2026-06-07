# USDat feed graph

Status: review_required

## Recursive graph

Formula: `USDat/USD = Curve_TWAP(USDat/USDC, pool 0xF4d0...) * Bounded(Chainlink USDC/USD, upperBound 1.04)`.

| Node | Address | Classification | Evidence |
| --- | --- | --- | --- |
| Gearbox USDat feed | `0x54DF8bAa0F35B767fFd2124c1D4F13788251E312` | hybrid | `contractType=PRICE_FEED::CURVE_TWAP`, description `USDat Curve TWAP price feed` |
| Curve pool market leg | `0xF4d0CF32908b2C7f1021339c43Df0F77f06896d7` | market | USDC/USDat pool balances found in raw/feed-probes.json |
| Bounded USDC quote feed | `0x8Ad48f5269A9e8C21F677bc81CCE503E55196949` | hybrid | Bounded wrapper over Chainlink USDC/USD |
| Chainlink USDC/USD | `0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6` | market-reference | Description `USDC / USD`, answer 0.99965695 |

## Latest values

- Effective USDat feed answer: 0.99965317 USD with 8 decimals.
- Feed timestamp: 2026-06-06 08:00:47 UTC.
- USDat Curve pool direct balances: about 7.82M USDC and 7.88M USDat.

## Decision effect

The graph reaches source primitives and does not stop at a top-level feed label. It remains review_required because position size and Credit Manager context are missing.
