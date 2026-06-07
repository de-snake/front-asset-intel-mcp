# Investment analysis index

Status: review_required

## Summary

Analyze-only recommendation: USDat is the stronger of the two collateral candidates for continued diligence; sUSDat remains materially more conditional. Both are blocked from Preview/Execute.

## Scenario matrix

| Scenario band | USDat | sUSDat |
| --- | --- | --- |
| Conservative | review_required: issuer eligibility and Credit Manager missing | blocked-for-automation: queue, market discount, and Credit Manager missing |
| Base | review_required: route size needed | review_required: route size plus ERC-4626/secondary-market gap needed |
| Upside | cannot value without external strategy or points EV | cannot value without live APY, leverage, horizon, and route assumptions |

## Required field rollup

- Gross ROI: skipped_due_to_missing_input because no executable strategy, size, leverage, or horizon was supplied.
- Simple annualized return: skipped_due_to_missing_input because borrow cost is 9% but return inputs are incomplete.
- Compound annualized return: skipped_due_to_missing_input because compounding inputs are missing.
- Points EV: skipped_due_to_missing_input because points valuation is missing.
- Points ROI: skipped_due_to_missing_input because points EV is missing.
- Points annualized return: skipped_due_to_missing_input because points EV and hold horizon are missing.
- Expected loss: skipped_due_to_missing_input because size-specific route, issuer, and oracle stress assumptions are missing.
- Exit cost: skipped_due_to_missing_input because position size and route quote are missing.
- Risk-adjusted ROI: skipped_due_to_missing_input because gross ROI, expected loss, and exit cost are missing.
- Risk-adjusted annualized return: skipped_due_to_missing_input because risk-adjusted ROI and hold horizon are missing.
- Break-even points ROI: skipped_due_to_missing_input because points EV is missing.
- Break-even terminal drawdown: skipped_due_to_missing_input because target leverage and HF floor are missing.
- Price-stability certainty score: scenario_band: review_required; USDat stronger than sUSDat, but neither is execution-ready.

## Next checks

Provide Credit Manager, position size, target leverage, hold horizon, wallet eligibility, and user risk policy. Then rerun Preview-specific route, liquidation, issuer-state, and HF calculations.
