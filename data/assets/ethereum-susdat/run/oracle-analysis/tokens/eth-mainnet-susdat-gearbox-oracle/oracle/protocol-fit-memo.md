# sUSDat protocol fit memo

Status: review_required

## Verdict

Analyze-stage verdict: the sUSDat feed correctly recurses into ERC-4626 exchange-rate accounting and the USDat child feed. It is materially more conditional than USDat because immediate liquidation may depend on secondary-market depth, queue processing, and issuer-controlled USDat redemption.

## Gearbox adapter facts

| Fact | State | Evidence | Decision effect |
| --- | --- | --- | --- |
| gearbox.market_or_credit_manager / Market or Credit Manager | input_missing | User supplied `market_or_credit_manager=not_available` | Blocker: request Credit Manager or explicit market context before Preview. |
| gearbox.oracle_feed / Oracle / main feed path | found | Main feed `0xe5d7...ed5b1`, child USDat feed `0x54DF...E312` | Supports Analyze-stage recursive graph. |
| gearbox.reserve_feed / Reserve feed path | source_inconclusive | Alternate/reserve path not resolved from supplied input or generic probes | Blocker: curator/feed config review. |
| gearbox.safe_pricing_rule / Safe-pricing rule | found | ERC4626 exchange-rate bounds and child USDat bounded quote path found | Review needed because accounting and market exit can diverge. |
| gearbox.exit_health_factor / Exit Health Factor implication | input_missing | No target leverage, HF floor, or position size | Blocks HF proposal. |
| gearbox.liquidation_threshold / Liquidation Threshold | found | User supplied LTV/LT context 0.86 | Parameter context only; not confirmed against a Credit Manager. |
| gearbox.liquidation_threshold_ramp / Liquidation Threshold ramp | source_inconclusive | Scheduled ramp not checked because market context missing | Blocker for production. |
| gearbox.max_leverage / Max leverage implied by LT | found | Naive LT context implies theoretical max before buffers of about 7.14x, but no user policy | Do not use for execution. |
| gearbox.staleness_bounds_timestamp / Staleness, bounds, and timestamp controls | found | latest timestamp 2026-06-06 08:00:47 UTC; exchange-rate bounds found; child USDat feed found | Analyze-stage timestamp/bounds resolved. |
| gearbox.feed_swap_timelock / Feed swap / reserve / timelock status | source_inconclusive | Exact update authority/timelock not resolved | Review gate. |
| gearbox.delayed_withdrawal_branch / Delayed-withdrawal branch interaction | found | Saturn docs describe a withdrawal queue and secondary-market alternative | Queue/realization risk must be modeled. |
| gearbox.allowed_token_status / Allowed-token / forbidden-token status | input_missing | Credit Manager missing | Blocker: request market/Credit Manager. |
| gearbox.issuer_controlled_branch / Issuer-controlled branch interaction | found | sUSDat exposes blacklist/pause; USDat underlying is permissioned | Automation human-in-loop. |
| gearbox.pfs_availability / PFS chain / token availability and update status | source_inconclusive | Feed address exists and responds, but PFS entry/update status was not independently resolved | Review gate. |
| gearbox.feed_update_authority / Instance Owner or feed-update authority | source_inconclusive | Gearbox docs assign PFS authority to Instance Owner; exact authority for this feed not resolved | Review gate. |
| gearbox.route_availability / Route / quote availability | input_missing | Public Curve liquidity found, but no position size or Gearbox liquidation route context supplied | Blocker: request size and route quote. |

## Side-specific verdict matrix

| position_side | token_role | stress_direction | loss_bearer | Verdict |
| --- | --- | --- | --- | --- |
| credit_account_borrower | collateral | secondary-market discount or exchange-rate down | Borrower liquidation | Borrower can benefit from accounting value during market discount but remains exposed to exchange-rate/child-feed moves. |
| pool_lp | collateral | accounting value exceeds executable exit value | LP bad debt | LP risk is higher than USDat if liquidation cannot realize queue/NAV value. |
| liquidator | collateral | liquidity loss, queue delay, transfer block | Liquidator execution risk | Needs route or queue proof at position size. |
| curator_operator | collateral | stale update, bound mismatch, issuer/STRC event | Curator intervention requirement | Must monitor child feed, exchange-rate bounds, queue, and issuer state. |

## Proposal gate

proposal_gate: request_more_inputs. Preview and Execute remain blocked.
