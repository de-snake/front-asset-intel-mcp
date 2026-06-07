# Quantitative underwriting methodology — points, PTs, yield tokens, and price-stability risk

Report date: 2026-06-05 MSK
Audience: investment analyst
Scope: Apyx and Saturn assets, associated Pendle PT markets, points programs, issuer-controlled token risk, and stable-price confidence.

This methodology converts source evidence into decision inputs: expected ROI, annualized return, expected loss, downside sensitivity, price-stability confidence, and the assumptions that would change the result. The evidence logs remain source material; this file defines the underwriting model used to turn them into an investment view.

## 1. Output required for each asset or strategy

Every asset or strategy must produce these fields before it is decision-usable:

- Gross carry or fixed-yield ROI over the position horizon.
- Annualized gross return over the same horizon.
- Points expected value, points ROI, and points annualized return when points are part of the thesis.
- Expected loss from price instability, redemption impairment, issuer controls, liquidity, and maturity/accounting failure.
- Risk-adjusted ROI and risk-adjusted annualized return.
- Break-even points value required to reach target annualized return.
- Break-even terminal asset price that makes the position lose money.
- Price-stability certainty score.
- Decision status: underwrite, underwrite only with points upside, reject on risk-adjusted basis, or cannot underwrite until a named input is resolved.

The decision status is not a ticker label. It is conditional on the stated horizon, position size, route, holder eligibility, and target annualized return.

## 2. Core return model

For a strategy with position horizon `D` days:

- `Gross ROI = Terminal value / Entry cost - 1`
- `Simple annualized return = Gross ROI × 365 / D`
- `Compound annualized return = (1 + Gross ROI)^(365 / D) - 1`
- `Risk-adjusted ROI = Gross ROI + Points ROI + Underlying yield ROI - Expected loss - Exit cost - Financing cost`
- `Risk-adjusted annualized return = Risk-adjusted ROI × 365 / D`

Use simple annualized return as the decision surface unless the position compounds automatically. Use compound annualized return only where reinvestment is realistic.

## 3. Pendle PT model

For a PT that redeems into an accounting asset:

- `PT gross ROI = Accounting asset price / PT price - 1`
- `PT simple annualized return = PT gross ROI × 365 / Days to maturity`
- `Break-even accounting asset price = PT entry price + total exit cost per unit`
- `Break-even accounting-asset drawdown = 1 - PT entry price / current accounting asset price`

Interpretation:

- The PT discount is not a free yield. It is the buffer against accounting-asset impairment and maturity/exit cost.
- If expected accounting-asset loss plus exit cost is greater than PT gross ROI, the PT is not attractive on a risk-adjusted basis before points.
- If a PT's investment case depends on points, the points layer must be quantified separately. Social claims that a market has points exposure are not enough.

Required PT inputs:

- PT price.
- Accounting asset price.
- Days to maturity.
- Current PT market liquidity.
- Expected exit route and size-dependent slippage.
- Maturity output asset.
- Holder eligibility and restriction status for the output asset.
- Oracle or NAV method if the PT is used as collateral or valued before maturity.

## 4. Yield-token model

For yield-bearing wrappers such as apyUSD or sUSDat:

- `Yield ROI = (1 + Stated annual yield)^(D / 365) - 1`
- `Net yield ROI = Yield ROI - wrapper fees - redemption fees - queue/opportunity cost - expected price loss`
- `Exit-value ROI = Executable exit price / entry price - 1`
- `Total token ROI = Net yield ROI + Exit-value ROI + Points ROI`

The accounting exchange rate is not sufficient. The model must compare:

- Accounting value.
- Market exit value.
- Primary redemption value.
- Queue or receipt value.
- Holder-specific eligibility value.

If those values differ, the decision surface uses executable exit value, not accounting value.

## 5. Points expected-value model

Points must be converted into an expected dollar value before they enter ROI.

### 5.1 Allocation-budget method

Use this when the program's total token allocation is known or can be scenarized.

- `Points EV USD = Allocation percent × FDV × Wallet share of eligible points × Eligibility probability × Vesting/liquidity haircut × Anti-dilution confidence`
- `Points ROI = Points EV USD / Capital deployed`
- `Points annualized return = Points ROI × 365 / D`

Where:

- `Allocation percent` is the percent of total token value allocated to the points season.
- `FDV` is the scenario token fully diluted valuation.
- `Wallet share of eligible points` is the wallet's points divided by total eligible points for that allocation bucket.
- `Eligibility probability` captures whether the holder, chain, wrapper, PT/YT/LP route, and wallet qualify.
- `Vesting/liquidity haircut` captures lockups, delayed claimability, market depth, and post-launch sell pressure.
- `Anti-dilution confidence` captures the risk that total eligible points grow or the final allocation changes.

### 5.2 Point-unit method

Use this when the analyst has a dashboard point count but not the final allocation budget.

- `Points EV USD = Position points × Expected dollar value per point × Eligibility probability × Vesting/liquidity haircut`
- `Points ROI = Points EV USD / Capital deployed`
- `Break-even point value = Required points EV USD / Position points`

### 5.3 Break-even method

Use this when final token economics are missing.

- `Required points ROI = Target ROI - Risk-adjusted ROI before points`
- `Required points EV USD = Capital deployed × Required points ROI`
- `Break-even FDV = Required points EV USD / (Allocation percent × Wallet share × Eligibility probability × Vesting/liquidity haircut × Anti-dilution confidence)`
- `Break-even wallet share = Required points EV USD / (Allocation percent × FDV × Eligibility probability × Vesting/liquidity haircut × Anti-dilution confidence)`

Interpretation:

- If break-even wallet share is implausibly high, the points thesis should not rescue the trade.
- If points ROI is larger than the PT or yield ROI, the position is an airdrop trade, not a fixed-yield trade.
- If the route's points eligibility is uncertain, apply a probability haircut instead of treating points as zero or certain.

## 6. Expected-loss model

Expected loss is the dollar-weighted cost of events that can impair realized value.

For each event:

- `Expected loss_i = Probability_i × Loss given event_i × Exposure weight_i`

Strategy expected loss:

- `Expected loss = Σ Expected loss_i + Correlation surcharge`

Use a correlation surcharge when risks share the same driver. For example, STRC collateral stress can simultaneously affect token NAV, market liquidity, primary redemption, points sentiment, and PT exit pricing. A simple sum can understate loss when risks cluster.

### Event categories

- Price / collateral impairment: depeg, NAV markdown, reserve shortfall, collateral mark-to-market loss.
- Redemption impairment: queue delay, receipt delay, claim blockage, primary redemption ineligibility, issuer interface failure.
- Issuer-control impairment: freeze, blacklist, pause, forced transfer, admin change, upgrade, policy change.
- Liquidity impairment: AMM depth loss, route slippage, pool imbalance, crowded unwind.
- PT maturity/accounting impairment: output asset mismatch, stale accounting asset, maturity redemption issue, oracle mismatch.
- Points impairment: no token launch, reduced allocation, ineligible route, diluted total points, vesting/liquidity haircut.
- Financing impairment: borrow-rate increase, liquidation risk, collateral haircut change if the position uses leverage.

## 7. Price-stability certainty score

Price-stability certainty is a 0–100 score used to translate qualitative issuer/token facts into expected-loss inputs.

Scoring components:

- Backing / NAV evidence: 20 points.
  - Full reserve reconciliation, current attestations, transparent custody, and live supply match receive high scores.
  - Issuer statements without reconciled current reserve data receive lower scores.

- Redemption and holder eligibility: 20 points.
  - Open, tested, holder-accessible redemption receives high scores.
  - Whitelisted, jurisdiction-limited, queue-based, receipt-based, or untested redemption receives lower scores.

- Market liquidity and observed peg behavior: 20 points.
  - Deep venues, tight spreads, low depeg history, and size-specific executable quotes receive high scores.
  - Thin liquidity, recent discounts, or route fragmentation receive lower scores.

- Issuer controls and governance surface: 15 points.
  - Limited emergency controls, timelocked changes, and transparent pending governance receive high scores.
  - Immediate pause, freeze, blacklist, forced-transfer, or upgrade controls receive lower scores.

- Oracle / accounting alignment: 10 points.
  - Oracle value that tracks executable exit value receives high scores.
  - Accounting value that can diverge from market or redemption value receives lower scores.

- Incident / social stress evidence: 15 points.
  - Clean recent stress history and low controversy receive high scores.
  - Recent depeg, collateral, queue, freeze, or unwind narratives receive lower scores.

Score interpretation for a 90–180 day underwriting horizon:

- 85–100: high certainty. Price-stability expected loss normally belongs below 1.00% unless position size exceeds visible depth.
- 70–84: medium-high certainty. Expected loss normally belongs in the 1.00%–3.00% range.
- 50–69: medium certainty. Expected loss normally belongs in the 3.00%–7.00% range.
- 30–49: low certainty. Expected loss normally belongs in the 7.00%–15.00% range.
- Below 30: cannot underwrite without more data, unless the position is explicitly a distressed or event-driven trade.

The score sets a prior. Live route quotes, holder-specific eligibility, and current reserve data can move the expected-loss range.

## 8. Risk-adjusted decision statuses

Use the same statuses across reports:

- Underwrite: risk-adjusted annualized return exceeds the mandate hurdle after expected loss, exit cost, and financing cost; no blocking control or redemption unknown remains.
- Underwrite only with points upside: fixed-yield or token carry is insufficient, but quantified points EV can clear the hurdle under stated assumptions.
- Reject on risk-adjusted basis: expected loss and exit cost consume the gross yield; points break-even requires implausible FDV, wallet share, or eligibility.
- Cannot underwrite: a required input is missing and cannot be approximated with a conservative haircut.

Every status must name the assumption that would change it.

## 9. Minimum applied-report structure

A decision-grade report must include:

1. Position summary and horizon.
2. Gross-return stack: PT/carry/yield/points.
3. Quantified points scenarios and break-even points value.
4. Price-stability certainty score.
5. Expected-loss model and event assumptions.
6. Risk-adjusted ROI and annualized return.
7. Sensitivity table: terminal price, points FDV/share, exit slippage, redemption delay, and stress case.
8. Decision status and assumption triggers.
9. Source map and stale-data markers.

If a report only lists evidence and open questions, it is not decision-grade under this methodology.
