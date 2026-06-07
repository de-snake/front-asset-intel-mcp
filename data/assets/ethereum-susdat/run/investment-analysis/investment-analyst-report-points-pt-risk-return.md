# Investment analyst report — Apyx/Saturn points and Pendle PT risk-adjusted returns

Report date: 2026-06-05 MSK
Evidence date: source snapshots and X search artifacts through 2026-06-04
Scope: apyUSD, apxUSD, USDat, sUSDat, and the four scoped Pendle PT markets
Methodology: `investment-analysis/quantitative-underwriting-methodology.md`

## 1. Decision summary

This report replaces the X evidence logs as the decision surface. The evidence logs remain useful for source review; they are not sufficient for allocation decisions without the quantitative layer below.

Base underwriting hurdle used for comparison: 10.00% net annualized return. Opportunistic hurdle: 20.00% net annualized return. If the mandate uses another hurdle, replace these two inputs and recalculate the points break-even values.

### Base-case conclusion

- PT-apxUSD 05 Nov 2026 is the only scoped PT that comes close to the 10.00% net annualized hurdle before points. Base risk-adjusted annualized return is 8.89% after a 3.85% apxUSD expected-loss prior and a 1.00% exit-cost assumption. It needs 0.4671% points ROI over 153 days to clear 10.00% net annualized return.

- PT-USDat 27 Aug 2026 has the cleanest price-stability profile, but the fixed yield is low after risk and exit cost. Base risk-adjusted annualized return is 3.41%. It needs 1.4993% points ROI over 83 days to clear 10.00% net annualized return.

- PT-apyUSD 27 Aug 2026 fails on a risk-adjusted basis before points. Gross fixed ROI is 3.7571%, but the apyUSD/apxUSD expected-loss prior plus exit cost is 7.10%, producing -14.70% risk-adjusted annualized return. It needs 5.6168% points ROI over 83 days to clear 10.00% net annualized return.

- PT-sUSDat 27 Aug 2026 fails on a risk-adjusted basis before points. Gross fixed ROI is 6.8165%, but sUSDat expected loss plus exit cost is 8.85%, producing -8.94% risk-adjusted annualized return. It needs 4.3075% points ROI over 83 days to clear 10.00% net annualized return.

- Direct apyUSD or sUSDat yield-token exposure is not attractive under the base expected-loss priors. An 83-day apyUSD 13.00% APY yield contributes 2.8182% gross yield ROI, which is below the 6.10% apyUSD expected-loss prior. An 83-day sUSDat 11.00%–14.00% APY yield contributes 2.4015%–3.0244% gross yield ROI, below the 8.10% sUSDat expected-loss prior.

### Analyst ranking by decision usefulness

1. PT-apxUSD: best risk-adjusted candidate if the analyst accepts apxUSD collateral/redemption stress and can quantify APYx points eligibility. It is still below the 10.00% net hurdle before points.
2. PT-USDat: best stability candidate, but needs Saturn points or a lower hurdle to justify the position.
3. PT-sUSDat: high gross PT yield but too much STRC/NAV/queue expected loss under current priors.
4. PT-apyUSD: attractive headline APY, but expected collateral/redemption loss consumes the fixed-yield spread under current priors.

## 2. Base assumptions

### Position assumptions

- Capital scale for points scenarios: USD 1,000,000.
- No leverage.
- No financing cost.
- PT horizons:
  - PT-apyUSD, PT-USDat, PT-sUSDat: 83 days.
  - PT-apxUSD: 153 days.
- Exit-cost assumptions:
  - PT-apyUSD: 1.00%.
  - PT-apxUSD: 1.00%.
  - PT-USDat: 0.50%.
  - PT-sUSDat: 0.75%.

### Points assumptions

The points scenarios are analyst priors, not issuer-confirmed facts. They are included because points are part of the social return thesis and must be priced instead of described qualitatively.

- APYx Pips:
  - Allocation scenario: 6.00% of total token value.
  - Low case: FDV USD 100,000,000; wallet share 0.0100%; eligibility probability 50.00%; vesting/liquidity haircut 40.00%.
  - Base case: FDV USD 300,000,000; wallet share 0.0500%; eligibility probability 60.00%; vesting/liquidity haircut 50.00%.
  - High case: FDV USD 1,000,000,000; wallet share 0.1000%; eligibility probability 70.00%; vesting/liquidity haircut 60.00%.

- Saturn Gravity Points:
  - Allocation scenario: 5.00% of total token value.
  - Low case: FDV USD 100,000,000; wallet share 0.0100%; eligibility probability 45.00%; vesting/liquidity haircut 40.00%.
  - Base case: FDV USD 300,000,000; wallet share 0.0500%; eligibility probability 55.00%; vesting/liquidity haircut 50.00%.
  - High case: FDV USD 1,000,000,000; wallet share 0.1000%; eligibility probability 65.00%; vesting/liquidity haircut 60.00%.

### Expected-loss priors

Expected loss is the horizon-specific analyst prior used to haircut gross PT or token yield.

- USDat expected loss: 0.70%.
  - Mild depeg or restriction case: 8.00% probability × 3.00% loss = 0.24%.
  - Stress case: 2.00% probability × 10.00% loss = 0.20%.
  - Control, liquidity, and execution residual: 0.26%.

- apxUSD expected loss: 3.85%.
  - Collateral/depeg adverse case: 25.00% probability × 5.00% loss = 1.25%.
  - Stress case: 8.00% probability × 20.00% loss = 1.60%.
  - Redemption eligibility, liquidity, and admin residual: 1.00%.

- apyUSD expected loss: 6.10%.
  - Collateral and market-discount adverse case: 30.00% probability × 7.00% loss = 2.10%.
  - Stress case: 10.00% probability × 25.00% loss = 2.50%.
  - Receipt, exit, and admin residual: 1.50%.

- sUSDat expected loss: 8.10%.
  - STRC/NAV adverse case: 30.00% probability × 10.00% loss = 3.00%.
  - Stress case: 12.00% probability × 30.00% loss = 3.60%.
  - Queue, liquidity, and control residual: 1.50%.

These priors should be updated when live reserve, redemption, route, and holder-eligibility data is available. The current purpose is to make the decision surface explicit, not to pretend the missing primary inputs do not matter.

## 3. Gross PT return stack

| Market | PT price | Accounting asset price | Days | Gross ROI to accounting asset | Simple gross APR | Compound gross APY | Break-even accounting-asset drawdown | Liquidity snapshot |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| PT-apyUSD 27 Aug 2026 | 0.938959 | 0.974237 | 83 | 3.7571% | 16.52% | 17.61% | 3.6211% | USD 1,091,791 |
| PT-apxUSD 05 Nov 2026 | 0.897297 | 0.974237 | 153 | 8.5746% | 20.46% | 21.68% | 7.8975% | USD 1,171,288 |
| PT-USDat 27 Aug 2026 | 0.980282 | 0.999639 | 83 | 1.9746% | 8.68% | 8.98% | 1.9364% | USD 12,678,613 |
| PT-sUSDat 27 Aug 2026 | 0.935847 | 0.999639 | 83 | 6.8165% | 29.98% | 33.64% | 6.3815% | USD 5,125,750 |

Interpretation:

- The fixed-yield buffer is the break-even drawdown in the accounting asset. If the maturity output asset loses more than that buffer, the PT can lose money even before exit cost.
- PT-USDat has the smallest buffer, but also the strongest stability profile.
- PT-apxUSD has the largest buffer and the longest horizon. It can absorb a 7.8975% accounting-asset drawdown before costs, but it also carries longer Apyx stress exposure.
- PT-sUSDat has high gross APR because the accounting-asset discount is large over 83 days. The gross APR is not sufficient by itself because the underlying token has STRC/NAV/queue risk.

## 4. Risk-adjusted PT return stack

| Market | Gross ROI | Gross APR | Expected loss | Exit cost | Risk-adjusted ROI before points | Risk-adjusted APR before points | Points ROI needed for 10.00% net APR | Points ROI needed for 20.00% net APR |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| PT-apyUSD | 3.7571% | 16.52% | 6.10% | 1.00% | -3.3429% | -14.70% | 5.6168% | 7.8908% |
| PT-apxUSD | 8.5746% | 20.46% | 3.85% | 1.00% | 3.7246% | 8.89% | 0.4671% | 4.6589% |
| PT-USDat | 1.9746% | 8.68% | 0.70% | 0.50% | 0.7746% | 3.41% | 1.4993% | 3.7733% |
| PT-sUSDat | 6.8165% | 29.98% | 8.10% | 0.75% | -2.0335% | -8.94% | 4.3075% | 6.5814% |

Decision implication:

- PT-apxUSD can clear the 10.00% hurdle if points EV contributes 0.4671% ROI over 153 days, or if apxUSD expected loss is revised down by at least 0.4671% after reserve/redemption review.
- PT-USDat needs a larger points contribution than PT-apxUSD despite lower token risk because the fixed-yield spread is smaller.
- PT-apyUSD and PT-sUSDat require large points contributions to overcome expected-loss priors. Their investment case is a points/recovery thesis, not a fixed-yield thesis.

## 5. Points valuation

### Points scenario values on USD 1,000,000 capital

| Program scenario | Expected points EV | ROI on USD 1,000,000 | APR over 83 days | APR over 153 days |
|---|---:|---:|---:|---:|
| APYx Pips low | USD 120 | 0.0120% | 0.05% | 0.03% |
| APYx Pips base | USD 2,700 | 0.2700% | 1.19% | 0.64% |
| APYx Pips high | USD 25,200 | 2.5200% | 11.08% | 6.01% |
| Saturn Gravity low | USD 90 | 0.0090% | 0.04% | 0.02% |
| Saturn Gravity base | USD 2,062 | 0.2063% | 0.91% | 0.49% |
| Saturn Gravity high | USD 19,500 | 1.9500% | 8.58% | 4.65% |

### Points conclusion

- Base-case points are not large enough to change most investment decisions. APYx base points add 0.2700% ROI; Saturn base points add 0.2063% ROI.
- APYx high-case points can push PT-apxUSD above the 10.00% net annualized hurdle because PT-apxUSD needs only 0.4671% points ROI. APYx high-case points do not push PT-apxUSD above the 20.00% hurdle.
- Saturn high-case points can push PT-USDat above the 10.00% net annualized hurdle because PT-USDat needs 1.4993% points ROI. Saturn high-case points do not push PT-USDat above the 20.00% hurdle.
- APYx high-case points are still insufficient to make PT-apyUSD clear the 10.00% net hurdle under the current apyUSD expected-loss prior.
- Saturn high-case points are still insufficient to make PT-sUSDat clear the 10.00% net hurdle under the current sUSDat expected-loss prior.

### Break-even points interpretation

For USD 1,000,000 capital:

- An 83-day position needs USD 22,739.73 of points EV to add 10.00% annualized return and USD 45,479.45 of points EV to add 20.00% annualized return.
- A 153-day position needs USD 41,917.81 of points EV to add 10.00% annualized return and USD 83,835.62 of points EV to add 20.00% annualized return.
- Therefore, any points narrative worth underwriting must show either a large wallet share of the allocation bucket, high FDV, high eligibility probability, or a materially larger allocation percent than the base scenarios use.

## 6. Price-stability certainty by token

| Token | Score | Certainty class | Base expected loss | Main reason |
|---|---:|---|---:|---|
| USDat | 74 / 100 | Medium-high | 0.70% | Stable-leg social framing, near-par saved market data, but permissioning, freeze/whitelist controls, and reserve evidence remain material. |
| apxUSD | 52 / 100 | Medium | 3.85% | Base synthetic-dollar token has preferred-share backing, saved secondary discounts, primary-redemption eligibility limits, and active depeg/collateral-buffer debate. |
| apyUSD | 44 / 100 | Low | 6.10% | Yield wrapper adds apxUSD risk plus receipt/claim exit mechanics, fees, market discount, and reserve evidence gaps. |
| sUSDat | 39 / 100 | Low | 8.10% | STRC/NAV exposure, queue mechanics, compliance controls, DEX discount evidence, and reserve/NAV verification gaps dominate the yield. |

### Stability sensitivity

- USDat can tolerate the smallest PT discount because the expected-loss prior is low. The key risk is not current market price; it is holder-specific eligibility and issuer-control state.
- apxUSD has a larger PT discount but also a larger depeg/collateral impairment prior. The decision turns on whether live reserve and redemption evidence justifies lowering the 3.85% expected-loss prior.
- apyUSD inherits apxUSD stress and adds wrapper exit complexity. The 13.00% APY social yield contributes 2.8182% gross yield ROI over 83 days, which does not cover the 6.10% expected-loss prior.
- sUSDat has the weakest stable-price certainty among the four because the asset is explicitly STRC/NAV exposed. A 11.00%–14.00% APY social yield contributes 2.4015%–3.0244% gross yield ROI over 83 days, below the 8.10% expected-loss prior.

## 7. Token-by-token investment view

### apxUSD and PT-apxUSD

Base view: conditionally underwriteable only if APYx points eligibility is strong or if live reserve/redemption review lowers expected loss.

Positive drivers:

- PT-apxUSD has 8.5746% gross ROI to accounting asset over 153 days.
- It has 7.8975% accounting-asset drawdown buffer before costs.
- It needs only 0.4671% points ROI to clear 10.00% net annualized return under current priors.

Negative drivers:

- Saved and social evidence includes secondary-market discount and collateral-buffer stress.
- Primary redemption is not assumed to be universally available.
- Expected loss of 3.85% is material but not fatal because gross PT discount is large.

Decision trigger:

- Upgrade if live evidence shows reconciled reserves, current market price near accounting value, holder-eligible redemption path, and no pending admin event.
- Downgrade if apxUSD trades materially below accounting value, redemption remains constrained, or APYx points eligibility cannot be tied to the PT route.

### apyUSD and PT-apyUSD

Base view: reject on risk-adjusted basis unless the mandate is explicitly a points/recovery trade and the points estimate is far above the high scenario in this report.

Positive drivers:

- PT-apyUSD shows 16.52% gross APR to accounting asset.
- Social points and apyUSD yield narratives are active.

Negative drivers:

- The PT can absorb only 3.6211% accounting-asset drawdown before costs.
- apyUSD expected loss is 6.10%, driven by apxUSD stress, wrapper receipt mechanics, exit fees/duration, and market discount.
- Risk-adjusted ROI before points is -3.3429%.
- APYx high-case points add 2.5200% ROI on USD 1,000,000 capital, still below the 5.6168% points ROI required to clear 10.00% net annualized return.

Decision trigger:

- Upgrade only if apxUSD collateral stress resolves, apyUSD market discount closes, receipt/claim state is confirmed, and wallet-specific APYx points EV exceeds 5.6168% of capital over 83 days.
- Downgrade if apxUSD trades below accounting value or receipt/claim exits become less predictable.

### USDat and PT-USDat

Base view: stable-price candidate, not high-return candidate. Underwrite only if mandate accepts low net return, or if Saturn points high-case assumptions are credible for the specific route.

Positive drivers:

- Best price-stability certainty score among the four tokens: 74 / 100.
- Largest PT market liquidity snapshot among the four: USD 12,678,613.
- Expected loss is only 0.70% under base priors.

Negative drivers:

- Gross fixed ROI is only 1.9746% over 83 days.
- Risk-adjusted APR before points is 3.41%.
- It needs 1.4993% points ROI to clear 10.00% net annualized return.

Decision trigger:

- Upgrade if Saturn Gravity Points EV can be tied to the Ethereum PT route and exceeds 1.4993% of capital over 83 days, or if the mandate hurdle is below the risk-adjusted 3.41% annualized return.
- Downgrade if holder eligibility, whitelist/freeze state, or reserve evidence cannot be verified for the actual wallet and exit route.

### sUSDat and PT-sUSDat

Base view: reject on risk-adjusted basis before points. Gross yield is high, but STRC/NAV/queue expected loss consumes it.

Positive drivers:

- PT-sUSDat has 6.8165% gross ROI and 29.98% simple gross APR to accounting asset.
- Social yield and points narratives are active.
- Liquidity snapshot is larger than Apyx PT markets: USD 5,125,750.

Negative drivers:

- sUSDat expected loss is 8.10%, the highest among the four tokens.
- The asset is explicitly STRC/NAV exposed and queue-based.
- Risk-adjusted ROI before points is -2.0335%.
- Saturn high-case points add 1.9500% ROI on USD 1,000,000 capital, below the 4.3075% points ROI required to clear 10.00% net annualized return.

Decision trigger:

- Upgrade only if STRC/NAV risk is independently verified as lower than the current prior, the redemption queue is short and processing normally, and wallet-specific points EV exceeds 4.3075% of capital over 83 days.
- Downgrade if sUSDat trades at a widening discount, queue timing deteriorates, or STRC price/NAV verification remains unresolved.

## 8. Sensitivity map

### Terminal accounting asset sensitivity

| Market | Gross ROI buffer before costs | What erases gross fixed return |
|---|---:|---|
| PT-apyUSD | 3.7571% | Accounting output value falls to PT entry price, equivalent to a 3.6211% drawdown from current accounting asset price. |
| PT-apxUSD | 8.5746% | Accounting output value falls to PT entry price, equivalent to a 7.8975% drawdown from current accounting asset price. |
| PT-USDat | 1.9746% | Accounting output value falls to PT entry price, equivalent to a 1.9364% drawdown from current accounting asset price. |
| PT-sUSDat | 6.8165% | Accounting output value falls to PT entry price, equivalent to a 6.3815% drawdown from current accounting asset price. |

### Expected-loss sensitivity

- PT-apxUSD clears the 10.00% hurdle without points if apxUSD expected loss plus exit cost falls below 4.3825% instead of the current 4.8500% combined assumption.
- PT-USDat clears the 10.00% hurdle without points only if expected loss plus exit cost falls below -0.7247%, which is impossible under the current gross fixed-yield spread. It requires points or a lower hurdle.
- PT-apyUSD clears the 10.00% hurdle without points only if expected loss plus exit cost falls below 1.4832%, versus the current 7.1000% combined assumption.
- PT-sUSDat clears the 10.00% hurdle without points only if expected loss plus exit cost falls below 2.5090%, versus the current 8.8500% combined assumption.

### Points sensitivity

- APYx base points add 0.2700% ROI. That is useful for PT-apxUSD but not decisive; it is not enough for PT-apyUSD.
- APYx high points add 2.5200% ROI. That clears the 10.00% hurdle for PT-apxUSD under current priors, but does not clear it for PT-apyUSD.
- Saturn base points add 0.2063% ROI. That is not enough for PT-USDat or PT-sUSDat.
- Saturn high points add 1.9500% ROI. That clears the 10.00% hurdle for PT-USDat under current priors, but does not clear it for PT-sUSDat.

## 9. Required live inputs before capital allocation

The following inputs change the decision materially and should be refreshed before a live allocation:

- For APYx:
  - live apxUSD and apyUSD route quotes for the intended size;
  - current reserve dashboard and attestation reconciliation;
  - primary redemption eligibility and holder status;
  - current pause, deny-list, admin, and pending Safe state;
  - APYx Pips route eligibility for PT, YT, LP, and wrapper positions;
  - total eligible Pips or the wallet's share of the relevant allocation bucket.

- For Saturn:
  - live USDat and sUSDat route quotes for the intended size;
  - USDat reserve and `$M` backing evidence;
  - sUSDat STRC/NAV reserve evidence and oracle state;
  - sUSDat queue length, claim timing, and processor status;
  - whitelist/freeze/blacklist/pause state for the actual wallet and recipient;
  - Gravity Points route eligibility for Ethereum PT positions;
  - total eligible points or the wallet's share of the relevant allocation bucket.

- For all PTs:
  - current PT price, accounting asset price, and liquidity;
  - size-specific Pendle route quote;
  - maturity output asset and holder eligibility;
  - whether points accrue to the exact instrument held;
  - exit slippage under normal and stressed pool depth.

## 10. Source map

- Quantitative methodology: `investment-analysis/quantitative-underwriting-methodology.md`.
- X social overlay: `x-research/index.md`.
- X source artifacts:
  - `x-research/x-research-apyusd-points-stac-pt-2026-08-27.md`.
  - `x-research/x-research-apxusd-points-stac-pt-2026-11-05.md`.
  - `x-research/x-research-usdat-points-stac-pt-2026-08-27.md`.
  - `x-research/x-research-susdat-points-stac-pt-2026-08-27.md`.
- PT analyst reports:
  - `reports/pendle-pt-eth-mainnet-apyusd-2026-08-27.md`.
  - `reports/pendle-pt-eth-mainnet-apxusd-2026-11-05.md`.
  - `reports/pendle-pt-eth-mainnet-usdat-2026-08-27.md`.
  - `reports/pendle-pt-eth-mainnet-susdat-2026-08-27.md`.
- Underlying token reports:
  - `reports/eth-mainnet-apyusd.md`.
  - `reports/eth-mainnet-apxusd.md`.
  - `reports/eth-mainnet-usdat.md`.
  - `reports/eth-mainnet-susdat.md`.

## 11. Stale-data markers

- PT prices, accounting asset prices, and liquidity are 2026-06-04 snapshots.
- X posts and points narratives are social evidence through 2026-06-04.
- Points scenarios are analyst priors. They are not issuer-confirmed allocations for the specific wallet or route.
- Expected-loss priors are decision inputs derived from current evidence quality. They must be recalibrated when live route, reserve, redemption, and holder-eligibility data changes.
