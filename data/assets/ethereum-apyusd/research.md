# apyx apyUSD — investment analyst risk note

Report date: 2026-06-04 UTC
Audience: investment analyst
Asset: apyx apyUSD on Ethereum mainnet
Token address: `0x38EEb52F0771140d10c4E9A9a72349A329Fe8a6A`
Symbol: `apyUSD`

This note is an analyst-readable rewrite of the technical dossier. It is source-linked context for risk review. It is not an asset-selection recommendation. It is not an investment recommendation, suitability verdict, position-size recommendation, or execution instruction.

Detailed contract evidence was preserved separately in `run/tokens/eth-mainnet-apyusd/technical-report.md`. This expanded public version also folds in the old-run X/social research and quantitative PT risk/return layer [S18][S19][S20].

## 1. Executive view

apyUSD is a yield-bearing vault share issued by Apyx. Holders deposit apxUSD and receive apyUSD. The balance does not rebase; instead, the exchange rate between apyUSD and apxUSD is intended to rise as yield is added to the vault [S4][S5].

The main investment issue is that apyUSD combines three types of risk:

- a vault-share risk: apyUSD is only as good as the apxUSD vault accounting and exit mechanics [S1][S4];
- an issuer / reserve risk: apxUSD depends on off-chain preferred-share exposure, custody, dashboards, and attestations [S6][S9][S10];
- a market-exit risk: the saved market quotes showed discounts versus the vault accounting rate, including a second-leg apxUSD-to-USDC discount [S1][S14][S15].

Primary risk implication: the vault exchange rate is not the same as executable USD exit value. Before a live decision, an analyst must check reserve evidence, receipt mechanics, deny-list / pause state, governance queue, and current market route depth.

## 2. What the token represents

apyUSD represents a share of an Apyx vault whose immediate asset is apxUSD [S1][S5]. Apyx materials describe apxUSD as backed by a preferred-share collateral stack, with reserve transparency and attestations referenced through Accountable and Wolf & Company materials [S6][S9][S10].

A holder who exits apyUSD does not simply receive final cash in one step. The current source path burns apyUSD, applies a vault-side fee, escrows net apxUSD, and mints an Unlock Receipt NFT that can later claim apxUSD [S4][S8]. That receipt period creates a transition-stage asset: the holder has a claim in process, not final settlement.

For investment analysis, apyUSD should be viewed as a savings-token wrapper over apxUSD, not as an ordinary USD stablecoin.

## 3. Main risk implications

### Backing risk

The immediate vault asset is apxUSD, but the final economic risk depends on how apxUSD is backed. Apyx docs describe the backing as low-volatility, variable-rate preferred shares issued by Digital Asset Treasuries, and state that redemption scenarios liquidate preferred shares to USDC [S6].

The research found links to reserve / collateral visibility and monthly attestation materials, but did not parse and reconcile the full reserve PDFs to current on-chain supply [S9][S10].

Risk implication: the existence of dashboards and attestation links is useful evidence, but not enough to conclude that current reserve composition, custody, valuation, and supply reconciliation are independently verified for this dossier. This blocks clean ranking and requires human review for collateral valuation.

### Redemption risk

The exit path is not a simple instant stablecoin withdrawal. Current source behavior indicates that apyUSD exits create an Unlock Receipt NFT before the holder can claim apxUSD [S4][S8]. The receipt fee curve had a maximum fee of 3.4%, a minimum duration of 3 days, and a maximum duration of 20 days in the snapshot; the vault-side unlocking fee was 0.1% [S1][S8].

Risk implication: even when vault accounting is correct, the holder may face time, fee, receipt-state, and claimability risk. A live exit requires fresh receipt, fee, pause, deny-list, and apxUSD transfer checks.

### Market-exit risk

The main saved apyUSD market route was apyUSD to apxUSD, then apxUSD to USDC. The parent snapshot showed the apyUSD/apxUSD Curve route below the vault accounting rate, and the apxUSD/USDC second leg below $1 [S1][S14][S15].

Examples from the snapshot:

- the main Curve apyUSD/apxUSD venue reported $13.23M liquidity and $25.09M 24h volume [S14][S15];
- direct quotes showed 1 apyUSD to 1.321608 apxUSD, while vault accounting was near 1.374366 apxUSD per apyUSD [S1];
- the apxUSD/USDC second leg quoted 1 apxUSD to 0.903873 USDC in the same parent snapshot [S1].

Risk implication: market exit value can materially diverge from vault accounting. Any execution or liquidation analysis must use fresh route quotes for the exact size.

### Control and governance risk

apyUSD is upgradeable and controlled through an AccessManager setup. Operational powers include pause, deny-list replacement, receipt rotation, fee changes, vesting changes, implementation upgrades, and access-role changes [S1][S4][S16].

The parent snapshot identified a Safe-compatible operational holder with a 3-of-6 threshold for roles 21–25, but also found a high-authority role-0 EOA. The Safe Transaction Service returned 103 unexecuted transactions that were not fully decoded [S1][S16].

Risk implication: sensitive changes can be pending or pre-staged. A production action should be blocked until the Safe queue, AccessManager history, and current authority mapping are refreshed.

### Legal and eligibility risk

Apyx documentation says apyUSD vault access is permissionless and does not require KYB/KYC, while the Terms restrict use by certain territories and persons. apxUSD primary mint / redemption docs also refer to eligible whitelisted participants [S5][S6][S13].

Risk implication: a generic token transfer may be possible, but user-specific legal eligibility and primary-settlement access cannot be assumed. Live user flows require jurisdiction and process checks.

## 4. Backing and NAV quality

Plain-language model:

- apyUSD is a vault share over apxUSD [S1][S5].
- The vault exchange rate is based on total assets divided by supply, denominated in apxUSD [S1][S4].
- apxUSD backing depends on the preferred-share / collateral stack described by Apyx [S6].
- Reserve dashboards and attestation links exist, but the source pass did not fully parse and reconcile the reserve reports to live supply [S9][S10].

Analyst conclusion: vault mechanics are clear, but backing assurance is incomplete. Use the report for understanding the asset, not for clean reserve acceptance without additional attestation review.

## 5. Liquidity and exit risk

There are three practical exit considerations.

First, primary exit produces an Unlock Receipt NFT before final apxUSD claim [S4][S8]. This means the holder may have a pending claim rather than immediate liquid value.

Second, apxUSD itself must be liquid or redeemable into the desired final asset. The parent snapshot showed apxUSD-to-USDC trading below $1 in the sampled route [S1].

Third, DEX liquidity can be price-sensitive. Even the large apyUSD/apxUSD Curve pool showed a discount to vault accounting at the sampled time [S1][S14][S15].

Action implication: for any position-specific exit, require a fresh route quote across both legs, a receipt-state check, and current pause / deny-list status. The saved snapshot is evidence of risk, not an executable quote.

## 6. Controls, governance, and legal restrictions

The controls most relevant to existing holders are:

- pause of apyUSD flows [S1][S4];
- deny-list checks affecting transfers, deposits, redemptions, and claims [S1][S4];
- Unlock Receipt rotation and receipt pause / claim behavior [S4][S8];
- fees and vesting changes [S1][S4];
- implementation upgrade authority [S1][S4];
- AccessManager reconfiguration by high-authority roles [S1][S16].

Risk implication: the asset has a meaningful administrative surface. Current governance state should be refreshed before any investment or collateral process that depends on predictable transferability, redemption, or pricing.

## 7. Pricing / oracle risk in plain language

apyUSD does not rely on a dedicated external USD price feed in the reviewed source. Its conversion value is based on internal vault accounting in apxUSD [S4].

That creates a blind spot: the accounting rate can be higher than what the market will pay, especially if apxUSD trades below $1 or if the receipt/claim path is impaired [S1][S14][S15].

Risk implication: do not use the vault exchange rate alone as liquidation value, portfolio value, or exit value. A live analysis should compare vault accounting, apxUSD market price, final USDC route, and receipt/eligibility state.

## 8. X / social research layer

The X research pass covered apyUSD, APYx Pips / points, STRC-linked yield narratives, and Pendle PT-apyUSD 27 Aug 2026 rate discussion through 2026-06-04 [S18]. It is useful as a return-thesis and risk-narrative map, not as primary proof of reserves, eligibility, or live route quality.

Main social return models:

- **apyUSD dividend / exchange-rate yield:** social and issuer-facing discussion framed apyUSD as the yield-bearing wrapper over apxUSD, with target yield around 13% APY from realized STRC / preferred-share dividends. Confidence is medium for the product narrative and lower for realized exit value because reserve reconciliation, receipt mechanics, and market discounts still need live verification [S18].
- **APYx Pips / token allocation:** posts described Season 2 as roughly 6% of token supply, with Season 1 plus Season 2 around 11% early-user allocation. Confidence is medium for the points-program narrative and low for point value because final token economics, eligibility, dilution, and vesting/liquidity terms were not fixed in the captured evidence [S18].
- **Pendle PT-apyUSD fixed-discount return:** social rate sheets cited PT-apyUSD 27 Aug 2026 around 17.94%–18.00% implied APY. The local Pendle snapshot in the old run showed 17.60% implied APY, PT price `0.938959`, accounting asset price `0.974237`, and a 3.6211% discount to accounting asset [S18][S21][S22].
- **Leveraged loop narrative:** some posts discussed PT plus borrowing / vault loops producing higher effective yields. Treat this as lower-confidence strategy context, not base-case PT economics, until borrow rates, liquidation path, route depth, and unwind sizing are refreshed [S18].

Main social risk narratives:

- **STRC / preferred-share collateral stress:** critical threads argued that STRC trading below par compresses the apxUSD / apyUSD collateral buffer and can transmit into depeg, redemption, and leveraged unwind pressure [S18].
- **Redemption and arbitrage impairment:** social critique focused on whether below-par collateral and restricted primary access weaken the normal arbitrage path that would pull apxUSD / apyUSD back toward accounting value [S18].
- **PT liquidity / maturity risk:** PT yield is only attractive if maturity redemption, accounting-asset value, and exit liquidity remain functional under stress [S18][S21].
- **Points dilution / value uncertainty:** points may be part of the upside case, but the old run could not turn points into reliable base-case ROI without final APYX token economics and wallet-specific eligibility [S18][S19].

Analyst implication: the social layer strengthens the case that the trade was being marketed around yield, PT discount, and points, but it also surfaces the same collateral-stress and redemption-arbitrage concerns that block treating the accounting yield as clean USD return.

## 9. Quantitative risk / return layer

The old quantitative layer used a USD 1,000,000 no-leverage comparison, an 83-day PT-apyUSD horizon, a 10.00% net annualized underwriting hurdle, and a 20.00% opportunistic hurdle [S19][S20]. These are analyst priors for comparison, not live sizing guidance.

Base assumptions relevant to apyUSD / PT-apyUSD:

- PT horizon: 83 days [S19].
- Exit-cost assumption for PT-apyUSD: 1.00% [S19].
- apyUSD expected-loss prior: 6.10%, driven by apxUSD stress, apyUSD wrapper receipt mechanics, exit fees / duration, and market discount [S19].
- APYx Pips scenarios are priors, not issuer-confirmed facts; they model token value, wallet share, eligibility probability, and vesting/liquidity haircut [S19].

PT-apyUSD base-case stack:

- Gross fixed ROI to accounting asset: 3.7571% [S19].
- Gross APR to accounting asset: 16.52% [S19].
- Accounting-asset drawdown capacity before costs: only 3.6211% [S19][S21].
- Risk-adjusted ROI before points: -3.3429% after expected-loss prior and exit cost [S19].
- Risk-adjusted annualized return before points: -14.70% [S19].
- Points ROI required over 83 days to clear the 10.00% net annualized hurdle: 5.6168% of capital [S19].
- High-case APYx points scenario adds 2.5200% ROI on USD 1,000,000 capital, still below the 5.6168% points ROI required to clear the hurdle [S19].

Direct apyUSD yield-token exposure also fails the old base-case risk adjustment: an 83-day 13.00% APY yield contributes 2.8182% gross yield ROI, below the 6.10% apyUSD expected-loss prior [S19].

Decision trigger from the old quant report: upgrade only if apxUSD collateral stress resolves, apyUSD market discount closes, receipt / claim state is confirmed, and wallet-specific APYx points EV exceeds 5.6168% of capital over 83 days. Downgrade if apxUSD trades below accounting value or receipt / claim exits become less predictable [S19].

Analyst implication: PT-apyUSD had visible gross yield and points optionality, but the risk-adjusted base case was negative before points. The position was a points / recovery trade, not a clean fixed-income-like carry trade.

## 10. What must be checked before live use

Before using this dossier for a live position, collateral decision, liquidation path, or execution package, refresh:

- current apyUSD implementation and authority address;
- current pause state for apyUSD, Unlock Receipt, and apxUSD;
- deny-list contract, denied-address state, and holder/recipient status;
- receipt address, fee curve, claimability, and receipt admin roles;
- current vault-side unlocking fee and vesting state;
- AccessManager role-0 holder and role mappings;
- Safe owners, threshold, modules, guard, and pending transactions;
- reserve / custody / attestation PDFs and reconciliation to live supply;
- apxUSD primary mint/redeem SLA and eligible-participant process;
- live apyUSD/apxUSD and apxUSD/USDC route quotes;
- any updated audits, incidents, pauses, denials, depegs, or redemption delays;
- Gearbox-specific oracle/support state if this is being evaluated for Credit Account collateral.

Practical implication: unresolved reserve, governance, and eligibility questions require human review. Unresolved route, pause, deny-list, receipt, and pending-governance state should block automated execution.

Methodology labels: backing, audit-scope, Safe/module, market-stress, and eligibility unknowns remain `review_required`; unresolved route, pause, deny-list, receipt, and pending-governance state is `block_automation` for execution.

## 11. Evidence quality

High-confidence evidence:

- exact token identity, underlying asset, proxy status, implementation, authority, receipt, vesting, and role snapshots from on-chain reads [S1][S2][S3][S4];
- verified source behavior for pause, deny-list, receipt, fee, and vault accounting [S4];
- point-in-time Curve / DEX route evidence [S1][S14][S15].

Medium-confidence evidence:

- Apyx documentation on apyUSD / apxUSD mechanism and addresses [S5][S6][S7][S8];
- Apyx transparency and attestation pages [S9][S10];
- listed audit reports and Certora summary [S11][S12].

Lower-confidence or incomplete evidence:

- full reserve / custody reconciliation;
- exact deployed-scope audit mapping;
- all pending Safe transaction payloads;
- long market-stress history;
- user-specific jurisdiction / eligibility state;
- Gearbox-specific oracle configuration.

## 12. Source map

Each source ID below now includes the actual URL or local evidence path. Local paths are relative to this report folder unless shown as full project paths.

- **S1** — [ethereum-rpc.publicnode.com](https://ethereum-rpc.publicnode.com) plus local raw snapshots [run/tokens/eth-mainnet-apyusd/research/raw/onchain-admin-snapshot-2026-06-04.json](run/tokens/eth-mainnet-apyusd/research/raw/onchain-admin-snapshot-2026-06-04.json) and [run/tokens/eth-mainnet-apyusd/research/raw/onchain-market-snapshot-2026-06-04.json](run/tokens/eth-mainnet-apyusd/research/raw/onchain-market-snapshot-2026-06-04.json). Source class: onchain. Accessed: 2026-06-04. Confidence: high. Token metadata, proxy slots, implementation, AccessManager, roles/delays, Safe-like reads, pause/deny-list/receipt/vesting/fee values, ERC-4626 totals, Curve quotes.
- **S2** — Etherscan token / contract page, [etherscan.io/address/0x38EEb52F0771140d10c4E9A9a72349A329Fe8a6A](https://etherscan.io/address/0x38EEb52F0771140d10c4E9A9a72349A329Fe8a6A). Source class: onchain. Accessed: 2026-06-04. Confidence: high. Verified proxy/source, token page, implementation corroboration.
- **S3** — Dedaub contract explorer, [app.dedaub.com/ethereum/address/0x38eeb52f0771140d10c4e9a9a72349a329fe8a6a](https://app.dedaub.com/ethereum/address/0x38eeb52f0771140d10c4e9a9a72349a329fe8a6a). Source class: onchain. Accessed: 2026-06-04. Confidence: medium. Secondary proxy / ERC-20 metadata corroboration.
- **S4** — Apyx EVM contracts repository, [github.com/apyx-labs/evm-contracts](https://github.com/apyx-labs/evm-contracts). Source class: issuer_docs / onchain. Accessed: 2026-06-04. Confidence: medium. `ApyUSD.sol`, deny-list extension, receipt interfaces, fee curve, APY view source behavior.
- **S5** — Apyx docs, `apyUSD` overview, [docs.apyx.fi/product-overview/apyusd-overview](https://docs.apyx.fi/product-overview/apyusd-overview). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: medium. Savings-token mechanism, ERC-4626 vault, non-rebasing exchange-rate accrual, permissionless access, flexible redemption.
- **S6** — Apyx docs, `apxUSD` overview, [docs.apyx.fi/product-overview/apxusd-overview](https://docs.apyx.fi/product-overview/apxusd-overview). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: medium. Underlying `apxUSD`, preferred-share backing description, mint/redeem eligibility context.
- **S7** — Apyx docs, Smart Contract Addresses, [docs.apyx.fi/resources/smart-contract-addresses](https://docs.apyx.fi/resources/smart-contract-addresses). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: high for listed addresses, medium for dynamic state. Official listed token / view addresses.
- **S8** — Apyx docs, Unlocking `apyUSD` for `apxUSD`, [docs.apyx.fi/technical-overview/unlocking](https://docs.apyx.fi/technical-overview/unlocking). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: medium. Unlock Receipt / cooldown / fee path; caveat that page mixes current receipt wording with legacy unlock-token wording.
- **S9** — Apyx docs, Transparency, [docs.apyx.fi/collateral-and-custody/transparency](https://docs.apyx.fi/collateral-and-custody/transparency). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: medium. Accountable, Apyx dashboard, Dune dashboard, custodian attestation process.
- **S10** — Apyx docs, Third Party Attestation, [docs.apyx.fi/collateral-and-custody/third-party-attestation](https://docs.apyx.fi/collateral-and-custody/third-party-attestation). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: medium for listed PDFs, low for reserve conclusions. Wolf & Company March / April 2026 attestation links.
- **S11** — Apyx docs, Audits, [docs.apyx.fi/resources/audits](https://docs.apyx.fi/resources/audits). Source class: audit. Accessed: 2026-06-04. Confidence: medium for listed reports, low for unresolved finding status. Listed Quantstamp, Certora, and Zellic reports.
- **S12** — Certora public report summary, [www.certora.com/reports/apyx-apxusd](https://www.certora.com/reports/apyx-apxusd). Source class: audit. Accessed: 2026-06-04. Confidence: medium. Certora March 2026 summary, issue count, high-severity fixed/confirmed statement.
- **S13** — Apyx Terms of Service, [docs.apyx.fi/resources/terms-of-service](https://docs.apyx.fi/resources/terms-of-service). Source class: legal_terms. Accessed: 2026-06-04. Confidence: high for published terms, medium for practical enforcement. Restricted-territory / restricted-person framing and APYX Protocol legal entity references.
- **S14** — DEXScreener API and pair page, [api.dexscreener.com/latest/dex/tokens/0x38EEb52F0771140d10c4E9A9a72349A329Fe8a6A](https://api.dexscreener.com/latest/dex/tokens/0x38EEb52F0771140d10c4E9A9a72349A329Fe8a6A), [dexscreener.com/ethereum/0xe41be7b340f7c2eda4da1e99b42ee1b228b526b7](https://dexscreener.com/ethereum/0xe41be7b340f7c2eda4da1e99b42ee1b228b526b7). Source class: market_data. Accessed: 2026-06-04. Confidence: high for current reported pair data, medium for API-derived market statistics. Secondary venues, liquidity, volume, pair price.
- **S15** — CoinGecko `apyUSD`, [www.coingecko.com/en/coins/apyusd](https://www.coingecko.com/en/coins/apyusd) and public API `/api/v3/coins/apyusd`. Source class: market_data. Accessed: 2026-06-04. Confidence: medium. Market price, market cap, volume, broader venue context.
- **S16** — Safe Transaction Service and direct on-chain Safe-like reads for `0xf9862EfC1704aC05e687f66E5cD8c130E5663CE2`, [safe-transaction-mainnet.safe.global/api/v1/safes/0xf9862EfC1704aC05e687f66E5cD8c130E5663cE2…](https://safe-transaction-mainnet.safe.global/api/v1/safes/0xf9862EfC1704aC05e687f66E5cD8c130E5663cE2/multisig-transactions/?executed=false&limit=5). Source class: governance. Accessed: 2026-06-04. Confidence: high for threshold / owners / pending-count reads, medium for pending impact. Safe-like role holder, 3-of-6 threshold, pending unexecuted transaction caveat.
- **S17** — Project methodology, [run/methodology.md](run/methodology.md). Source class: unknown. Accessed: 2026-06-04. Confidence: high. Source-priority rules, asset-section requirements, `missing_behavior` labels.
- **S18** — Local X/social research artifact, [run/x-research/x-research-apyusd-points-stac-pt-2026-08-27.md](run/x-research/x-research-apyusd-points-stac-pt-2026-08-27.md). Source class: social_research. Evidence date: X search artifacts through 2026-06-04. Confidence: medium for return/risk narrative discovery; low for final points value and live market state. Captures APYx Pips, apyUSD yield framing, PT-apyUSD rate sheets, collateral-stress critiques, redemption/arbitrage critique, and PT liquidity concerns.
- **S19** — Quantitative investment analyst report, [run/investment-analysis/investment-analyst-report-points-pt-risk-return.md](run/investment-analysis/investment-analyst-report-points-pt-risk-return.md). Source class: quantitative_analysis. Report date: 2026-06-05 MSK using source snapshots through 2026-06-04. Confidence: medium for stated old-run assumptions and calculations; stale for live allocation. Provides expected-loss priors, PT ROI, risk-adjusted ROI/APR, points scenarios, and hurdle break-even values.
- **S20** — Quantitative underwriting methodology, [run/investment-analysis/quantitative-underwriting-methodology.md](run/investment-analysis/quantitative-underwriting-methodology.md). Source class: methodology. Confidence: medium/high as old-run method snapshot. Defines PT return math, expected-loss priors, points EV, hurdle comparison, and price-stability scoring logic.
- **S21** — PT-apyUSD analyst report, [run/pt-markets/pendle-pt-eth-mainnet-apyusd-2026-08-27/analyst-report.md](run/pt-markets/pendle-pt-eth-mainnet-apyusd-2026-08-27/analyst-report.md). Source class: market_analysis. Evidence date: 2026-06-04 snapshot. Confidence: medium for point-in-time PT economics, stale for live price/route. Provides PT price, accounting asset price, implied APY, maturity, discount, liquidity, and risk notes.
- **S22** — PT-apyUSD technical report, [run/pt-markets/pendle-pt-eth-mainnet-apyusd-2026-08-27/technical-report.md](run/pt-markets/pendle-pt-eth-mainnet-apyusd-2026-08-27/technical-report.md). Source class: technical_market_dossier. Evidence date: 2026-06-04 snapshot. Confidence: medium for captured Pendle metadata and API evidence, stale for live execution.

## 13. Technical appendix pointer

For raw addresses, role identifiers, implementation slots, method names, and table-level evidence, see:

- `run/tokens/eth-mainnet-apyusd/technical-report.md`
- `run/tokens/eth-mainnet-apyusd/research/`
- `run/x-research/x-research-apyusd-points-stac-pt-2026-08-27.md`
- `run/investment-analysis/investment-analyst-report-points-pt-risk-return.md`
- `run/investment-analysis/quantitative-underwriting-methodology.md`
- `run/pt-markets/pendle-pt-eth-mainnet-apyusd-2026-08-27/`
