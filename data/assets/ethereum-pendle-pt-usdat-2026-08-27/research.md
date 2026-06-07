# Pendle PT USDat — 27 Aug 2026 — PT market risk/economics dossier

Report date: 2026-06-04 UTC
Protocol: Pendle
Chain: Ethereum mainnet (`chain_id: 1`)
Underlying token: Saturn USDat / `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71`
Supplied maturity: `2026-08-27`
Supplied days to maturity: `83`
User-supplied days to maturity label: `83 days`

This dossier extends the asset-specific mining pipeline for a Pendle Principal Token (PT). It is factual risk/economics analysis only. Final use depends on a separate user mandate, protocol configuration review, and live Preview.

## 1. PT market identity and contract map

The exact market is confirmed because the active-market source contains one row with market `0x9afe7a057a09cf5da748d952078c9c99938b4329`, expiry `2026-08-27`, PT `0x1d69402390657308c91179aa184bf992908c1e08`, SY `0x7a7de491e1be5287874904e2b7c8488249a4d0a9`, YT `0x076a3ea71e83ca09319b161e40f5fb3bb943d3c6`, and underlying asset `0x23238f20b894f29041f48d88ee91131c395aaa71`. Same-underlying active candidates observed: 2026-08-27 market `0x9afe7a057a09cf5da748d952078c9c99938b4329`.

Pendle labels this PT as `PT USDat (USDat)`. Under Pendle's PT documentation, the bracketed/accounting asset is the redemption reference at maturity. The API reports accounting asset `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71`; this can differ from the named underlying wrapper for wrapped-yield assets.

| Field | Value | Source |
|---|---|---|
| Market / LP contract | `0x9afe7a057a09cf5da748d952078c9c99938b4329` | P1/P2/E1 |
| PT token | `0x1d69402390657308c91179aa184bf992908c1e08` / `PT-USDat-27AUG2026` / 6 decimals | P1/P2/E2 |
| SY token | `0x7a7de491e1be5287874904e2b7c8488249a4d0a9` / `SY-USDat` / 6 decimals | P1/P2/E3 |
| YT token | `0x076a3ea71e83ca09319b161e40f5fb3bb943d3c6` / `YT-USDat-27AUG2026` / 6 decimals | P1/P2/E4 |
| Underlying asset in active API | `1-0x23238f20b894f29041f48d88ee91131c395aaa71` | P2 |
| Accounting asset in market detail | `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71` | P1/P4 |
| Base pricing asset | `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71` | P1 |
| Market expiry | `2026-08-27T00:00:00.000Z` | P1/P2 |
| PT price timestamp | `2026-06-04T19:33:45.000Z` | P1 |
| Market data timestamp | `2026-06-04T19:33:00.000Z` | P1 |

## 2. Inherited underlying-risk profile

The PT inherits USDat exposure to Saturn’s permissioned stablecoin model, launch backing by M0 $M as described by issuer docs, whitelist-enabled transfer/holding state, pause, freeze, forced-transfer, role-management, asset-claim, and upgrade surfaces. The underlying USDat report marks holder eligibility, whitelist/freeze state, reserve proof, audit-scope mapping, oracle methodology, route depth, and pending admin transitions as review-required or blocking for automation.

The PT wrapper does not remove issuer, backing, legal, admin, transfer, freeze, redemption, or oracle risks from `USDat`. It adds an additional Pendle market layer: holders face PT/SY/YT contract dependencies, pre-maturity AMM liquidity, maturity redemption mechanics, and a valuation path tied to the accounting asset named by Pendle.

Local inherited artifacts reviewed:

- `reports/eth-mainnet-usdat.md`
- `technical-reports/eth-mainnet-usdat.md`
- `verification/eth-mainnet-usdat.md`

## 3. PT mechanism and maturity/redemption path

Pendle documentation describes PT as the principal portion of an underlying yield-bearing position, economically similar to a zero-coupon bond on the accounting asset. PT is acquired at a discount; if swaps and credit/issuer impairments are ignored, its value should converge toward the accounting asset by maturity. Pendle documentation also states that PT redeems 1:1 for the accounting asset at maturity, not necessarily for the named yield-bearing wrapper [P4].

For this market:

- pre-maturity exit depends on the Pendle PT/SY AMM and routing depth, not on a guaranteed direct redemption path;
- post-maturity redemption depends on Pendle maturity logic plus the SY/accounting-asset path;
- the PT holder does not receive variable yield or points from the underlying position because those economics are separated into YT [P4];
- if `USDat` or its accounting asset is frozen, deny-listed, paused, has stale NAV, or cannot be redeemed by the holder, the PT maturity value can be economically impaired even when Pendle market metadata remains visible.

## 4. Yield profile: price, discount, implied APY/fixed yield, assumptions

All values below are point-in-time market/API data from 2026-06-04 and must be refreshed before any live Preview or valuation use.

| Field | Value | Interpretation |
|---|---:|---|
| PT USD price | $0.980282 | Current Pendle API PT price snapshot [P1]. |
| Accounting asset USD price | $0.999639 | API value for `USDat`, the maturity accounting reference [P1/P4]. |
| Discount to accounting asset | 1.94% | Computed as `1 - PT price / accounting-asset price`; not a guaranteed return. |
| Pendle implied APY | 8.96% | API-implied fixed-yield field [P1/P2]. |
| Pendle APY field | 1.22% | Protocol API field; treat as point-in-time market data [P1/P2]. |
| Aggregated APY field | 5.41% | Includes market/reward assumptions; not isolated PT fixed return [P1]. |
| Active API fee rate | 0.18% | Fee-rate snapshot from active markets endpoint [P2]. |
| Active API yield range | 3.00%–18.00% | AMM configured / observed yield range from active endpoint [P2]. |

The fixed-yield interpretation assumes maturity redemption proceeds at the accounting-asset value and ignores changes in market depth, contract state, issuer restrictions, and accounting-asset quality. Those assumptions are material for all four scoped RWA / issuer-controlled underlying assets.

## 5. Liquidity and exit risk before maturity

Pendle's AMM documentation states that PT/SY pools trade PT directly against SY, with a curve concentrated around an implied-yield range and dynamic tightening as maturity approaches [P5]. This means the pre-maturity exit price is a market price, not the maturity redemption value.

Current market depth snapshot:

| Field | Value | Source |
|---|---:|---|
| Liquidity, USD | $12,678,613 | P1/P2 |
| Liquidity, accounting units | 12,683,197 | P1 |
| LP token | `0x9afe7a057a09cf5da748d952078c9c99938b4329` / `PLP-USDat-27AUG2026` | P1 |

Size-specific slippage was not computed in this recovery pass. For any state-changing action, missing live route quote and size-dependent slippage imply `missing_behavior: block_automation`. The report can continue as structural analysis, but live Preview must refresh the route, token approvals, market state, price update time, and holder eligibility.

## 6. Oracle, pricing, and valuation dependencies

The reviewed sources provide Pendle API market prices and implied-yield fields, but this dossier did not verify a Gearbox-compatible oracle for the PT. A live Credit Account or pool integration would need an explicit price-feed design that handles:

- PT price convergence toward maturity and the distinction between PT market price and accounting-asset redemption reference;
- accounting-asset price quality for `USDat`;
- `USDat` issuer/backing/restriction state inherited from the underlying report;
- stale Pendle market API data or stale onchain oracle updates;
- pre-maturity market depeg versus post-maturity redemption value;
- liquidity collapse or inability to route PT/SY swaps at relevant size.

`missing_behavior: review_required` for valuation design; `missing_behavior: block_automation` for any live Credit Account action without a current approved oracle/feed and route/depth check.

## 7. Admin, governance, and contract dependency surface

The dependency stack is:

1. Pendle market / LP contract `0x9afe7a057a09cf5da748d952078c9c99938b4329`.
2. PT contract `0x1d69402390657308c91179aa184bf992908c1e08`.
3. SY wrapper `0x7a7de491e1be5287874904e2b7c8488249a4d0a9`.
4. YT contract `0x076a3ea71e83ca09319b161e40f5fb3bb943d3c6`.
5. Pendle routing/AMM/oracle infrastructure used for swaps and market data.
6. Accounting asset `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71`.
7. Underlying token `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71` and all issuer/admin restrictions inherited from the underlying dossier.

This recovery pass did not perform a full role-holder or upgradeability audit of the Pendle market, PT, SY, and YT contracts. Etherscan links are included as onchain pointers, but role-state and implementation verification remain `missing_behavior: review_required` before production use.

## 8. Scenario and economic risk matrix

| Scenario | PT-specific behavior | Missing-data behavior |
|---|---|---|
| Underlying or accounting asset depegs | PT discount/APY can become misleading because maturity value depends on the accounting asset quality, not only the PT quote. | `review_required`; `block_automation` for live execution. |
| Underlying transfer, freeze, deny-list, whitelist, or holder restriction activates | Pendle settlement or post-maturity output can be impaired even if the PT contract itself is transferable. | `block_automation` until holder eligibility and restriction state are refreshed. |
| Issuer redemption pause or NAV/backing impairment | PT maturity convergence assumption fails or becomes delayed/uncertain. | `review_required`; cannot treat fixed-yield field as clean return. |
| Pendle AMM liquidity collapses before maturity | Exit may clear at a wider discount or require waiting until maturity. | `block_automation` without live quote/depth. |
| Pendle oracle/API data stale | Displayed price/APY/liquidity may not represent executable state. | `review_required` for analysis; `block_automation` for execution. |
| Maturity reached | PT redemption path replaces pre-maturity AMM economics, but holder still depends on Pendle redemption and output-asset restrictions. | Refresh maturity status, redemption route, and output token eligibility. |
| Rollover into later PT maturity | Rollover is a new market decision with new price, maturity, liquidity, and source checks. | New analysis required; do not carry this dossier forward automatically. |

## 9. Data quality, missing_behavior, and highest-impact unknowns

| Field | Current value / quality | source_class | confidence | missing_behavior |
|---|---|---|---|---|
| Exact market identity | Confirmed by active and detail API for supplied underlying/maturity | protocol_api / market_data | high | continue |
| PT/SY/YT addresses | Present in Pendle API and linked to Etherscan | protocol_api / explorer | high for address strings; medium for un-audited role state | review_required before production |
| Current price/APY/liquidity | Point-in-time 2026-06-04 API fields | market_data | medium/high for snapshot | refresh before live use |
| Accounting asset semantics | Pendle docs plus market detail bracket/accounting asset | protocol_docs / protocol_api | high | continue; review_required if feed design depends on it |
| Size-specific exit depth | Not computed | unknown | low | block_automation |
| Pendle contract role/upgrade state | Not fully audited in this recovery pass | explorer/onchain pointer only | low/medium | review_required |
| Underlying issuer/backing/restrictions | Inherited from local verified underlying reports | local reports | high for prior dossier; stale for future use | review_required or block_automation per underlying report |
| Gearbox PT support/oracle | Not found / not checked as supported | unknown | low | review_required before any integration |

Highest-impact unknowns:

1. Live size-specific PT/SY route depth and slippage were not computed; `missing_behavior: block_automation` for any trade or liquidation Preview.
2. A Gearbox-compatible PT oracle/feed design was not verified; `missing_behavior: review_required` for collateral or valuation use.
3. Pendle market/PT/SY/YT role, upgrade, pause, or emergency controls were not independently audited; `missing_behavior: review_required` before production acceptance.
4. `USDat` eligibility, restriction, redemption, reserve/NAV, and issuer-admin state must be refreshed from the underlying dossier before live use; `missing_behavior: review_required` or `block_automation` depending on the action.
5. Maturity redemption output depends on the accounting asset `USDat` and on Pendle/SY routing; any mismatch between named underlying wrapper and accounting asset requires human review before valuation.

## 10. Sources

| ID | Source | source_class | accessed | confidence |
|---|---|---|---|---|
| P1 | [Pendle market API detail](https://api-v2.pendle.finance/core/v1/1/markets/0x9afe7a057a09cf5da748d952078c9c99938b4329) and local snapshot `research/pendle-pt-eth-mainnet-usdat-2026-08-27/raw/pendle-market-api-2026-06-04.json` | market_data / protocol_api | 2026-06-04 | high for current API fields |
| P2 | [Pendle active markets API](https://api-v2.pendle.finance/core/v1/1/markets/active) and local exact-match snapshot `research/pendle-pt-eth-mainnet-usdat-2026-08-27/raw/pendle-active-market-details-2026-06-04.json` | market_data / protocol_api | 2026-06-04 | high for active listing and APY/liquidity snapshot |
| P3 | local candidate scan `research/pendle-pt-eth-mainnet-usdat-2026-08-27/raw/pendle-active-candidates-usdat-2026-06-04.json` | market_data / local derived evidence | 2026-06-04 | high for disambiguation within active API response |
| P4 | [Pendle PT documentation](https://docs.pendle.finance/pendle-v2/ProtocolMechanics/YieldTokenization/PT) | protocol_docs | 2026-06-04 | high for PT mechanism |
| P5 | [Pendle AMM documentation](https://docs.pendle.finance/pendle-v2/ProtocolMechanics/LiquidityEngines/AMM) | protocol_docs | 2026-06-04 | high for AMM mechanism |
| P6 | [Pendle FAQ](https://docs.pendle.finance/pendle-v2/FAQ) | protocol_docs | 2026-06-04 | medium/high for maturity and risk framing |
| U1 | `reports/eth-mainnet-usdat.md` | local analyst report | 2026-06-04 | high for inherited-risk summary |
| U2 | `technical-reports/eth-mainnet-usdat.md` | local technical dossier | 2026-06-04 | high for inherited technical evidence |
| U3 | `verification/eth-mainnet-usdat.md` | local verification artifact | 2026-06-04 | high for upstream QA status |
| E1 | [Market contract on Etherscan](https://etherscan.io/address/0x9afe7a057a09cf5da748d952078c9c99938b4329) | explorer / onchain pointer | 2026-06-04 | medium; address pointer, not full role audit |
| E2 | [PT contract on Etherscan](https://etherscan.io/address/0x1d69402390657308c91179aa184bf992908c1e08) | explorer / onchain pointer | 2026-06-04 | medium; address pointer, not full role audit |
| E3 | [SY contract on Etherscan](https://etherscan.io/address/0x7a7de491e1be5287874904e2b7c8488249a4d0a9) | explorer / onchain pointer | 2026-06-04 | medium; address pointer, not full role audit |
| E4 | [YT contract on Etherscan](https://etherscan.io/address/0x076a3ea71e83ca09319b161e40f5fb3bb943d3c6) | explorer / onchain pointer | 2026-06-04 | medium; address pointer, not full role audit |


## Combined social / quantitative overlay

## X / social research layer

The old-run X research adds fixed-rate PT market context behind the USDat / sUSDat collateral demo. Broader incentive commentary from those runs is excluded from PT-holder underwriting because PTs do not earn incentive-point economics.

USDat social layer:

- USDat is framed as Saturn's stable / risk-off leg, while sUSDat carries the STRC / digital-credit yield exposure.
- PT-USDat 27 Aug 2026 was quoted around `8.95%` to `10.65%` fixed / implied APY in early-June X results, with the local Pendle API snapshot at `8.96%` implied APY.
- Plain PT-USDat is underwritten as a fixed-yield discount-to-maturity route; incentive-point upside is excluded from PT-holder return assumptions.
- Main diligence gap: whitelist/freeze/issuer controls, holder eligibility, reserve evidence, and live route depth still need review.

sUSDat social layer:

- sUSDat is framed as the yield-bearing STRC/NAV/queue-exposed Saturn leg.
- Social return narratives combine STRC dividend / digital-credit yield in the underlying exposure with the PT fixed discount; incentive points are not part of PT-holder return underwriting.
- The risk narrative is materially different from USDat: the key issue is whether accounting/NAV value can be realized through queues, issuer controls, and secondary liquidity during stress.

## Quantitative risk / return layer

The old quantitative report makes the collateral distinction sharper than the shorter demo result. The relevant fixed-return support files are the investment analyst report and `run/investment-analysis/quantitative-underwriting-methodology.md`; point-scenario fields from that old report are excluded from PT-holder base-case underwriting because PTs do not earn points.

PT-USDat underwriting snapshot:

- Horizon: `83` days to 2026-08-27 maturity.
- Gross fixed ROI: `1.9746%`; simple gross APR: `8.68%`; compound gross APY: `8.98%`.
- Expected-loss prior: `0.70%`; exit-cost assumption: `0.50%`.
- Risk-adjusted ROI after expected-loss prior and exit cost: `0.7746%`; risk-adjusted annualized return after expected-loss prior and exit cost: `3.41%`.
- The fixed-return base case is positive but below the `10.00%` net annualized hurdle in the current snapshot.

PT-sUSDat underwriting snapshot:

- Horizon: `83` days to 2026-08-27 maturity.
- Gross fixed ROI: `6.8165%`; simple gross APR: `29.98%`; compound gross APY: `33.64%`.
- Expected-loss prior: `8.10%`; exit-cost assumption: `0.75%`.
- Risk-adjusted ROI after expected-loss prior and exit cost: `-2.0335%`; risk-adjusted annualized return after expected-loss prior and exit cost: `-8.94%`.
- The fixed-return base case is negative after expected loss and exit cost, so it cannot clear the `10.00%` net annualized hurdle in the current snapshot.

Quantitative conclusion: PT-USDat is the stable-price / low-return fixed-return candidate, but current risk-adjusted APY is below the mandate hurdle. PT-sUSDat has higher gross PT yield, but STRC/NAV/queue expected loss consumes the fixed-yield spread under the old priors.

## PT market dossiers

The public package now also preserves the old Pendle PT technical dossiers and raw Pendle snapshots:

- [PT-USDat technical dossier](run/pt-markets/pendle-pt-eth-mainnet-usdat-2026-08-27/technical-report.md)
- [PT-sUSDat technical dossier](run/pt-markets/pendle-pt-eth-mainnet-susdat-2026-08-27/technical-report.md)
