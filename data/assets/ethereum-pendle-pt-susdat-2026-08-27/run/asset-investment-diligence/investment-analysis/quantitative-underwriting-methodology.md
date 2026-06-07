# Quantitative underwriting methodology

Status: review_required

## Scope

Analyze-only scenario contract. Borrow asset is USDC. Borrow rate assumption is 9%. No position size, target leverage, hold horizon, points EV, wallet eligibility, or user risk policy was supplied.

## Scenario band

This run uses a non-executable scenario band only:

| Scenario band | Size | Leverage | Horizon | Decision use |
| --- | ---: | ---: | ---: | --- |
| Conservative | skipped_due_to_missing_input | skipped_due_to_missing_input | skipped_due_to_missing_input | Cannot compute route or HF sensitivity |
| Base | skipped_due_to_missing_input | skipped_due_to_missing_input | skipped_due_to_missing_input | Cannot compute expected return |
| Upside | skipped_due_to_missing_input | skipped_due_to_missing_input | skipped_due_to_missing_input | Cannot compute points/yield upside |

## Required field states

| Field | Value state | Reason |
| --- | --- | --- |
| Gross ROI | skipped_due_to_missing_input | No position size, target leverage, hold horizon, or strategy yield was supplied. |
| Simple annualized return | skipped_due_to_missing_input | USDat direct yield is 0; sUSDat target yield is not enough without leverage, horizon, fees, and route assumptions. |
| Compound annualized return | skipped_due_to_missing_input | No compounding period or executable yield path supplied. |
| Points EV | skipped_due_to_missing_input | No points valuation supplied. |
| Points ROI | skipped_due_to_missing_input | Points EV missing. |
| Points annualized return | skipped_due_to_missing_input | Points EV and hold horizon missing. |
| Expected loss | skipped_due_to_missing_input | No liquidation-size, issuer-event, route-depth, or user risk-policy assumptions supplied. |
| Exit cost | skipped_due_to_missing_input | Position size and route quote missing. |
| Risk-adjusted ROI | skipped_due_to_missing_input | Gross ROI, expected loss, and exit cost missing. |
| Risk-adjusted annualized return | skipped_due_to_missing_input | Hold horizon and risk-adjusted ROI missing. |
| Break-even points ROI | skipped_due_to_missing_input | Borrow cost is 9%, but leverage/horizon/fees/points EV missing. |
| Break-even terminal drawdown | skipped_due_to_missing_input | LTV/LT context exists, but no HF floor, leverage, or liquidation route supplied. |
| Price-stability certainty score | scenario_band: review_required | USDat feed is market-derived with stronger liquidity; sUSDat has ERC-4626 accounting plus thinner market exit and queue risk. |

## Borrow-rate implication

- USDat: direct token yield is 0, so 9% borrow cost creates negative carry unless an external return source is added.
- sUSDat: Saturn target yield is 11%+, but no live APY, route, fee, queue, leverage, or horizon assumption was supplied; do not convert this into a recommendation.
