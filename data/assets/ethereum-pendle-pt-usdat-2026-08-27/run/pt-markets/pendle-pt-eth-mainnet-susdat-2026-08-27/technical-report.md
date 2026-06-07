# Pendle PT sUSDat — 27 Aug 2026 — PT market risk/economics dossier

Report date: 2026-06-04 UTC
Protocol: Pendle
Chain: Ethereum mainnet (`chain_id: 1`)
Underlying token: Saturn sUSDat / `sUSDat` at `0xd166337499e176bbc38a1fbd113ab144e5bd2df7`
Supplied maturity: `2026-08-27`
Supplied days to maturity: `83`
User-supplied days to maturity label: `83 days`

This dossier extends the asset-specific mining pipeline for a Pendle Principal Token (PT). It is factual risk/economics analysis only. Final use depends on a separate user mandate, protocol configuration review, and live Preview.

## 1. PT market identity and contract map

The exact market is confirmed because the active-market source contains one row with market `0x91bc86899c8391b6caaf26535b9cd82efe49a189`, expiry `2026-08-27`, PT `0xc689f76f90fe1762fac55983ff25ae71033a84f7`, SY `0x8917f8c7feb840b5837edc7e128123baa2f289f9`, YT `0x7956bb9504b8a1f515f2890e309cee398198d3bd`, and underlying asset `0xd166337499e176bbc38a1fbd113ab144e5bd2df7`. Same-underlying active candidates observed: 2026-08-27 market `0x91bc86899c8391b6caaf26535b9cd82efe49a189`.

Pendle labels this PT as `PT sUSDat (USDat)`. Under Pendle's PT documentation, the bracketed/accounting asset is the redemption reference at maturity. The API reports accounting asset `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71`; this can differ from the named underlying wrapper for wrapped-yield assets.

| Field | Value | Source |
|---|---|---|
| Market / LP contract | `0x91bc86899c8391b6caaf26535b9cd82efe49a189` | P1/P2/E1 |
| PT token | `0xc689f76f90fe1762fac55983ff25ae71033a84f7` / `PT-sUSDat-27AUG2026` / 6 decimals | P1/P2/E2 |
| SY token | `0x8917f8c7feb840b5837edc7e128123baa2f289f9` / `SY-sUSDat` / 18 decimals | P1/P2/E3 |
| YT token | `0x7956bb9504b8a1f515f2890e309cee398198d3bd` / `YT-sUSDat-27AUG2026` / 6 decimals | P1/P2/E4 |
| Underlying asset in active API | `1-0xd166337499e176bbc38a1fbd113ab144e5bd2df7` | P2 |
| Accounting asset in market detail | `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71` | P1/P4 |
| Base pricing asset | `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71` | P1 |
| Market expiry | `2026-08-27T00:00:00.000Z` | P1/P2 |
| PT price timestamp | `2026-06-04T19:33:45.000Z` | P1 |
| Market data timestamp | `2026-06-04T19:33:00.000Z` | P1 |

## 2. Inherited underlying-risk profile

The PT inherits sUSDat exposure to an ERC-4626-style Saturn share token over USDat, disabled standard withdraw/redeem paths, requestRedeem plus withdrawal-queue NFT mechanics, STRC/digital-credit NAV exposure, blacklist checks, upgradeability, pending admin transitions, and oracle dependence on STRC valuation. The underlying sUSDat report marks STRC custody/NAV proof, audit-scope mapping, queue state, holder restrictions, and live exit depth as review-required or blocking for automated use.

The PT wrapper does not remove issuer, backing, legal, admin, transfer, freeze, redemption, or oracle risks from `sUSDat`. It adds an additional Pendle market layer: holders face PT/SY/YT contract dependencies, pre-maturity AMM liquidity, maturity redemption mechanics, and a valuation path tied to the accounting asset named by Pendle.

Local inherited artifacts reviewed:

- `reports/eth-mainnet-susdat.md`
- `technical-reports/eth-mainnet-susdat.md`
- `verification/eth-mainnet-susdat.md`

## 3. PT mechanism and maturity/redemption path

Pendle documentation describes PT as the principal portion of an underlying yield-bearing position, economically similar to a zero-coupon bond on the accounting asset. PT is acquired at a discount; if swaps and credit/issuer impairments are ignored, its value should converge toward the accounting asset by maturity. Pendle documentation also states that PT redeems 1:1 for the accounting asset at maturity, not necessarily for the named yield-bearing wrapper [P4].

For this market:

- pre-maturity exit depends on the Pendle PT/SY AMM and routing depth, not on a guaranteed direct redemption path;
- post-maturity redemption depends on Pendle maturity logic plus the SY/accounting-asset path;
- the PT holder does not receive variable yield or points from the underlying position because those economics are separated into YT [P4];
- if `sUSDat` or its accounting asset is frozen, deny-listed, paused, has stale NAV, or cannot be redeemed by the holder, the PT maturity value can be economically impaired even when Pendle market metadata remains visible.

## 4. Yield profile: price, discount, implied APY/fixed yield, assumptions

All values below are point-in-time market/API data from 2026-06-04 and must be refreshed before any live Preview or valuation use.

| Field | Value | Interpretation |
|---|---:|---|
| PT USD price | $0.935847 | Current Pendle API PT price snapshot [P1]. |
| Accounting asset USD price | $0.999639 | API value for `USDat`, the maturity accounting reference [P1/P4]. |
| Discount to accounting asset | 6.38% | Computed as `1 - PT price / accounting-asset price`; not a guaranteed return. |
| Pendle implied APY | 13.44% | API-implied fixed-yield field [P1/P2]. |
| Pendle APY field | 1.05% | Protocol API field; treat as point-in-time market data [P1/P2]. |
| Aggregated APY field | 6.64% | Includes market/reward assumptions; not isolated PT fixed return [P1]. |
| Active API fee rate | 0.28% | Fee-rate snapshot from active markets endpoint [P2]. |
| Active API yield range | 8.00%–25.00% | AMM configured / observed yield range from active endpoint [P2]. |

The fixed-yield interpretation assumes maturity redemption proceeds at the accounting-asset value and ignores changes in market depth, contract state, issuer restrictions, and accounting-asset quality. Those assumptions are material for all four scoped RWA / issuer-controlled underlying assets.

## 5. Liquidity and exit risk before maturity

Pendle's AMM documentation states that PT/SY pools trade PT directly against SY, with a curve concentrated around an implied-yield range and dynamic tightening as maturity approaches [P5]. This means the pre-maturity exit price is a market price, not the maturity redemption value.

Current market depth snapshot:

| Field | Value | Source |
|---|---:|---|
| Liquidity, USD | $5,125,750 | P1/P2 |
| Liquidity, accounting units | 5,127,601 | P1 |
| LP token | `0x91bc86899c8391b6caaf26535b9cd82efe49a189` / `PLP-sUSDat-27AUG2026` | P1 |

Size-specific slippage was not computed in this recovery pass. For any state-changing action, missing live route quote and size-dependent slippage imply `missing_behavior: block_automation`. The report can continue as structural analysis, but live Preview must refresh the route, token approvals, market state, price update time, and holder eligibility.

## 6. Oracle, pricing, and valuation dependencies

The reviewed sources provide Pendle API market prices and implied-yield fields, but this dossier did not verify a Gearbox-compatible oracle for the PT. A live Credit Account or pool integration would need an explicit price-feed design that handles:

- PT price convergence toward maturity and the distinction between PT market price and accounting-asset redemption reference;
- accounting-asset price quality for `USDat`;
- `sUSDat` issuer/backing/restriction state inherited from the underlying report;
- stale Pendle market API data or stale onchain oracle updates;
- pre-maturity market depeg versus post-maturity redemption value;
- liquidity collapse or inability to route PT/SY swaps at relevant size.

`missing_behavior: review_required` for valuation design; `missing_behavior: block_automation` for any live Credit Account action without a current approved oracle/feed and route/depth check.

## 7. Admin, governance, and contract dependency surface

The dependency stack is:

1. Pendle market / LP contract `0x91bc86899c8391b6caaf26535b9cd82efe49a189`.
2. PT contract `0xc689f76f90fe1762fac55983ff25ae71033a84f7`.
3. SY wrapper `0x8917f8c7feb840b5837edc7e128123baa2f289f9`.
4. YT contract `0x7956bb9504b8a1f515f2890e309cee398198d3bd`.
5. Pendle routing/AMM/oracle infrastructure used for swaps and market data.
6. Accounting asset `USDat` at `0x23238f20b894f29041f48d88ee91131c395aaa71`.
7. Underlying token `sUSDat` at `0xd166337499e176bbc38a1fbd113ab144e5bd2df7` and all issuer/admin restrictions inherited from the underlying dossier.

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
4. `sUSDat` eligibility, restriction, redemption, reserve/NAV, and issuer-admin state must be refreshed from the underlying dossier before live use; `missing_behavior: review_required` or `block_automation` depending on the action.
5. Maturity redemption output depends on the accounting asset `USDat` and on Pendle/SY routing; any mismatch between named underlying wrapper and accounting asset requires human review before valuation.

## 10. Sources

| ID | Source | source_class | accessed | confidence |
|---|---|---|---|---|
| P1 | [Pendle market API detail](https://api-v2.pendle.finance/core/v1/1/markets/0x91bc86899c8391b6caaf26535b9cd82efe49a189) and local snapshot `research/pendle-pt-eth-mainnet-susdat-2026-08-27/raw/pendle-market-api-2026-06-04.json` | market_data / protocol_api | 2026-06-04 | high for current API fields |
| P2 | [Pendle active markets API](https://api-v2.pendle.finance/core/v1/1/markets/active) and local exact-match snapshot `research/pendle-pt-eth-mainnet-susdat-2026-08-27/raw/pendle-active-market-details-2026-06-04.json` | market_data / protocol_api | 2026-06-04 | high for active listing and APY/liquidity snapshot |
| P3 | local candidate scan `research/pendle-pt-eth-mainnet-susdat-2026-08-27/raw/pendle-active-candidates-susdat-2026-06-04.json` | market_data / local derived evidence | 2026-06-04 | high for disambiguation within active API response |
| P4 | [Pendle PT documentation](https://docs.pendle.finance/pendle-v2/ProtocolMechanics/YieldTokenization/PT) | protocol_docs | 2026-06-04 | high for PT mechanism |
| P5 | [Pendle AMM documentation](https://docs.pendle.finance/pendle-v2/ProtocolMechanics/LiquidityEngines/AMM) | protocol_docs | 2026-06-04 | high for AMM mechanism |
| P6 | [Pendle FAQ](https://docs.pendle.finance/pendle-v2/FAQ) | protocol_docs | 2026-06-04 | medium/high for maturity and risk framing |
| U1 | `reports/eth-mainnet-susdat.md` | local analyst report | 2026-06-04 | high for inherited-risk summary |
| U2 | `technical-reports/eth-mainnet-susdat.md` | local technical dossier | 2026-06-04 | high for inherited technical evidence |
| U3 | `verification/eth-mainnet-susdat.md` | local verification artifact | 2026-06-04 | high for upstream QA status |
| E1 | [Market contract on Etherscan](https://etherscan.io/address/0x91bc86899c8391b6caaf26535b9cd82efe49a189) | explorer / onchain pointer | 2026-06-04 | medium; address pointer, not full role audit |
| E2 | [PT contract on Etherscan](https://etherscan.io/address/0xc689f76f90fe1762fac55983ff25ae71033a84f7) | explorer / onchain pointer | 2026-06-04 | medium; address pointer, not full role audit |
| E3 | [SY contract on Etherscan](https://etherscan.io/address/0x8917f8c7feb840b5837edc7e128123baa2f289f9) | explorer / onchain pointer | 2026-06-04 | medium; address pointer, not full role audit |
| E4 | [YT contract on Etherscan](https://etherscan.io/address/0x7956bb9504b8a1f515f2890e309cee398198d3bd) | explorer / onchain pointer | 2026-06-04 | medium; address pointer, not full role audit |
