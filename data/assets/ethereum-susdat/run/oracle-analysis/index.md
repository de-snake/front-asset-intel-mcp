# Oracle analysis index

Status: review_required

## Scope table

| Scope | Feed | Formula | Status |
| --- | --- | --- | --- |
| USDat | `0x54DF8bAa0F35B767fFd2124c1D4F13788251E312` | `Curve_TWAP(USDat/USDC) * Bounded(Chainlink USDC/USD)` | review_required |
| sUSDat | `0xe5d7ce380349f0380d8A216A75BCd1070C0ed5b1` | `ERC4626_exchange_rate(sUSDat->USDat) * USDat/USD feed` | review_required |

## Feed formulas

- USDat formula: `USDat/USD = Curve_TWAP(USDat/USDC, pool 0xF4d0...) * Bounded(Chainlink USDC/USD, upperBound 1.04)`.
- sUSDat formula: `sUSDat/USD = ERC4626_exchange_rate * USDat/USD`.

## Side-specific verdict matrix

| Token | Borrower / Credit Account operator | Pool LP / lender | Liquidator | Curator/operator |
| --- | --- | --- | --- | --- |
| USDat | Market-derived feed can liquidate on Curve dislocation. | Better than hardcoded peg, but issuer controls can trap value. | Needs route and recipient eligibility. | Must monitor PFS/feed config, issuer controls, and liquidity. |
| sUSDat | Accounting feed can differ from immediate market exit. | Higher realization risk if queue/market discount prevents recovery. | Needs route or queue proof. | Must monitor ERC-4626 bounds, child USDat feed, queue, STRC/NAV context. |

## Open blockers

- Gearbox market/Credit Manager input_missing.
- Position size input_missing.
- Allowed-token status input_missing.
- Wallet and liquidator eligibility input_missing.
- User HF floor and risk policy input_missing.
- Exact PFS update status and feed-update authority source_inconclusive.

## Artifact map

- USDat protocol memo: `tokens/eth-mainnet-usdat-gearbox-oracle/oracle/protocol-fit-memo.md`
- sUSDat protocol memo: `tokens/eth-mainnet-susdat-gearbox-oracle/oracle/protocol-fit-memo.md`
- USDat raw feed probes: `tokens/eth-mainnet-usdat-gearbox-oracle/raw/feed-probes.json`
- sUSDat raw feed probes: `tokens/eth-mainnet-susdat-gearbox-oracle/raw/feed-probes.json`
- Final verification: `verification/final-oracle-analysis-verification.md`

## Validation result

Validation result: review_required. Preview and Execute are blocked.
