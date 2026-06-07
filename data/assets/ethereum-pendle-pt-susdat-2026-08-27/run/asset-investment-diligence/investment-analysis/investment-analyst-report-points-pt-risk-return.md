# Investment analyst report

Status: review_required

## Decision surface

Neither USDat nor sUSDat is ready for Preview or Execute. USDat is the cleaner Analyze-stage collateral candidate because liquidity is deeper and the Gearbox feed is market-derived. sUSDat requires a higher bar because liquidation may depend on a thinner secondary market while the oracle references ERC-4626 accounting value.

## Required field states

| Field | Value state | Reason |
| --- | --- | --- |
| Gross ROI | skipped_due_to_missing_input | No executable strategy, leverage, size, or horizon supplied. |
| Simple annualized return | skipped_due_to_missing_input | Borrow rate is 9%, but collateral return assumptions are incomplete. |
| Compound annualized return | skipped_due_to_missing_input | Compounding assumptions missing. |
| Points EV | skipped_due_to_missing_input | Points valuation missing. |
| Points ROI | skipped_due_to_missing_input | Points EV missing. |
| Points annualized return | skipped_due_to_missing_input | Points EV and horizon missing. |
| Expected loss | skipped_due_to_missing_input | No size-specific issuer/oracle/route loss model supplied. |
| Exit cost | skipped_due_to_missing_input | No route quote or position size supplied. |
| Risk-adjusted ROI | skipped_due_to_missing_input | Inputs above are missing. |
| Risk-adjusted annualized return | skipped_due_to_missing_input | Inputs above plus hold horizon are missing. |
| Break-even points ROI | skipped_due_to_missing_input | Points EV missing. |
| Break-even terminal drawdown | skipped_due_to_missing_input | Target leverage and user HF floor missing. |
| Price-stability certainty score | scenario_band: review_required | USDat: stronger; sUSDat: weaker because of accounting/market-exit gap. |

## Proposal

- USDat: continue only to human review and size-specific route analysis after Credit Manager and eligibility are supplied.
- sUSDat: keep as review_required; require queue, secondary-liquidity, and oracle/market-discount analysis before any proposal can be considered.
- Preview and Execute: blocked.
