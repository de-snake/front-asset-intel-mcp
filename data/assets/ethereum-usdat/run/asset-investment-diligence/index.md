# Asset diligence index

Status: review_required

## Tokens

| Token | Address | Status | Headline |
| --- | --- | --- | --- |
| USDat | `0x23238f20b894f29041f48d88ee91131c395aaa71` | review_required | Better liquidity and market-derived Gearbox feed, but issuer eligibility and Credit Manager context are missing. |
| sUSDat | `0xd166337499e176bbc38a1fbd113ab144e5bd2df7` | review_required | ERC-4626 recursive feed exists, but queue, STRC/digital-credit exposure, blacklist/pause controls, and shallower liquidity raise review burden. |

## PT skipped

PT market economics are skipped because the input `pt_markets` array is empty. S3_pt_market_economics is not in scope.

## Headline risk/return

USDat has no direct yield, so borrowing USDC at 9% is negative carry unless an external strategy or incentive is supplied. sUSDat targets 11%+ in Saturn docs, but the run has no leverage, horizon, fee, queue, or route inputs; the apparent gross spread over 9% borrow cost is not decision-grade and can be erased by secondary-market discount, fees, and liquidation slippage.

## Missing blockers

- Missing Gearbox Credit Manager / market context.
- Missing position size and target leverage.
- Missing hold horizon.
- Missing user HF floor and risk policy.
- Missing wallet/Credit Account/liquidator eligibility and issuer-control state.
- Missing size-specific route/liquidation quote.

## Artifact map

- USDat analyst report: `tokens/eth-mainnet-usdat/analyst-report.md`
- sUSDat analyst report: `tokens/eth-mainnet-susdat/analyst-report.md`
- Quantitative methodology: `investment-analysis/quantitative-underwriting-methodology.md`
- Investment decision surface: `investment-analysis/index.md`
- Final verification: `verification/final-investment-analysis-verification.md`

## Final verification status

Final verification status: review_required.
