# USDat protocol fit memo

Status: review_required

## Verdict

Analyze-stage verdict: the USDat feed is structurally better than a hardcoded peg because it reaches a Curve market primitive and bounded USDC/USD child feed. It is not decision-grade for Preview because Gearbox market/Credit Manager, allowed-token status, position size, route capacity, and wallet eligibility are missing.

## Gearbox adapter facts

| Fact | State | Evidence | Decision effect |
| --- | --- | --- | --- |
| gearbox.market_or_credit_manager / Market or Credit Manager | input_missing | User supplied `market_or_credit_manager=not_available` | Blocker: request Credit Manager or explicit market context before Preview. |
| gearbox.oracle_feed / Oracle / main feed path | found | Main feed `0x54DF...E312`, child `0x8Ad4...6949`, Chainlink `0x8fFf...18f6` | Supports Analyze-stage feed graph. |
| gearbox.reserve_feed / Reserve feed path | source_inconclusive | Alternate/reserve path not resolved from supplied input or generic probes | Blocker: curator/feed config review. |
| gearbox.safe_pricing_rule / Safe-pricing rule | found | Bounded USDC/USD child upperBound 1.04; top wrapper bounds present | Relevant for LP protection. |
| gearbox.exit_health_factor / Exit Health Factor implication | input_missing | No target leverage, HF floor, or position size | Blocks HF proposal. |
| gearbox.liquidation_threshold / Liquidation Threshold | found | User supplied LTV/LT context 0.90 | Parameter context only; not confirmed against a Credit Manager. |
| gearbox.liquidation_threshold_ramp / Liquidation Threshold ramp | source_inconclusive | Scheduled ramp not checked because market context missing | Blocker for production. |
| gearbox.max_leverage / Max leverage implied by LT | found | Naive LT context implies theoretical max before buffers of about 10x, but no user policy | Do not use for execution. |
| gearbox.staleness_bounds_timestamp / Staleness, bounds, and timestamp controls | found | latest timestamp 2026-06-06 08:00:47 UTC; child staleness 87,300 seconds; stablecoin upper bound 1.04 | Analyze-stage timestamp/bounds resolved. |
| gearbox.feed_swap_timelock / Feed swap / reserve / timelock status | source_inconclusive | Exact update authority/timelock not resolved | Review gate. |
| gearbox.delayed_withdrawal_branch / Delayed-withdrawal branch interaction | not_applicable | USDat is not an ERC-4626 withdrawal-queue share in this scope | No direct delayed-withdrawal branch. |
| gearbox.allowed_token_status / Allowed-token / forbidden-token status | input_missing | Credit Manager missing | Blocker: request market/Credit Manager. |
| gearbox.issuer_controlled_branch / Issuer-controlled branch interaction | found | USDat documented as permissioned; token exposes freeze/pause controls | Automation human-in-loop. |
| gearbox.pfs_availability / PFS chain / token availability and update status | source_inconclusive | Feed address exists and responds, but PFS entry/update status was not independently resolved | Review gate. |
| gearbox.feed_update_authority / Instance Owner or feed-update authority | source_inconclusive | Gearbox docs assign PFS authority to Instance Owner; exact authority for this feed not resolved | Review gate. |
| gearbox.route_availability / Route / quote availability | input_missing | Public Curve liquidity found, but no position size or Gearbox liquidation route context supplied | Blocker: request size and route quote. |

## Side-specific verdict matrix

| position_side | token_role | stress_direction | loss_bearer | Verdict |
| --- | --- | --- | --- | --- |
| credit_account_borrower | collateral | USDat price down / Curve TWAP dislocation | Borrower liquidation | Borrower can be hurt by market feed during temporary dislocation. |
| pool_lp | collateral | Persistent depeg or issuer transfer block | LP bad debt | LP protected by market feed but exposed if collateral cannot be sold/redeemed. |
| liquidator | collateral | Liquidity loss or eligibility failure | Liquidator execution risk | Needs route and recipient eligibility proof. |
| curator_operator | collateral | stale update, bound issue, issuer event | Curator intervention requirement | Must review feed config, issuer state, and allowed-token status. |

## Proposal gate

proposal_gate: request_more_inputs. Preview and Execute remain blocked.
