# Centrifuge deSPXA — investment analyst risk note

Report date: 2026-06-04 UTC
Audience: investment analyst
Asset: Centrifuge deSPXA on Base
Token address: `0x9c5C365e764829876243d0b289733B9D2b729685`
Symbol: `deSPXA`

This note is an analyst-readable rewrite of the technical dossier. It is source-linked context for risk review, not an investment recommendation, asset-selection recommendation, suitability verdict, position-size recommendation, or execution instruction.

Detailed contract evidence was preserved separately in `run/technical-reports/base-despxa.md`.
This expanded public version also preserves the old-run support artifacts and marks the missing X/social and quantitative layers explicitly instead of fabricating them.

## 1. Executive view

deSPXA is a Base token distributed through Centrifuge. Centrifuge materials describe it as the DeFi-distribution / freely transferable token for SPXA, which is linked to Janus Henderson Anemoy S&P 500 Index Fund exposure [D1][D2][D3].

The important investment point is that deSPXA is not just a normal ERC-20 with simple cash-like liquidity. It combines:

- tokenized S&P 500 fund exposure [D1][D2][D3];
- USDC-based vault accounting on Base [O2][O6];
- member / Authorized Participant eligibility for primary mint and redeem paths [D1][D5][O2][O3];
- freeze / member-state controls through a transfer hook [O1][O3];
- Centrifuge Root / ward administration that can change important behavior [O1][O2][O3][O4][O5];
- secondary DEX liquidity that can differ from manager/NAV price [M1][O6].

Primary risk implication: an ordinary holder may be able to trade deSPXA on secondary markets, but primary NAV mint / redeem access and holder-specific eligibility cannot be assumed. Live use requires current eligibility, admin, price, and route checks.

## 2. What the token represents

Centrifuge describes deSPXA as a freely transferable wrapper / DeFi distribution form of SPXA exposure on Base. The broader exposure is described through Centrifuge and S&P DJI materials as an onchain route to S&P 500 index fund exposure involving Centrifuge, Anemoy Capital, Janus Henderson, and S&P Dow Jones Indices [D1][D2][D3].

On-chain, the token is connected to an async vault whose immediate asset is Base USDC [O2][O6]. The vault uses request and claim flows rather than ordinary instant vault settlement. This means a holder can enter a transition-stage asset state during deposit or redemption [O2][O5].

For investment analysis, deSPXA should be treated as tokenized-fund exposure with issuer / fund, eligibility, redemption, oracle, admin, and market-liquidity risk.

## 3. Main risk implications

### Fund and backing risk

The economic exposure is described as SPXA / Janus Henderson Anemoy S&P 500 Index Fund exposure, not protocol-fee yield or staking yield from the token itself [D1][D2][D3]. The immediate vault asset is Base USDC, but the investment exposure and exit value depend on fund NAV, offering terms, custody, service providers, and primary redemption rules [O2][D1][D3][D4].

The parent research did not fully retrieve primary legal/fund documents, audited financial statements, holdings / replication method, cash buffers, custody arrangements, or independent NAV reports [R2][D4].

Risk implication: the market can see a token and price, but the analyst still needs fund-level evidence before accepting backing quality or comparing it cleanly with other assets.

### Eligibility and redemption risk

Centrifuge materials state that non-U.S. Authorized Participants can mint and redeem at NAV, while Moonwell proposal materials say retail holders interact through secondary markets [D1][D5]. The exact holder’s member / Authorized Participant status was not established in the research.

On-chain vault flows are asynchronous: a holder requests deposit or redemption, waits for processing, and later claims [O2][O5]. The token also uses a hook that can distinguish ordinary non-frozen transfers from member-gated primary request and claim paths [O1][O3].

Risk implication: primary NAV redemption may be unavailable to an ordinary holder. For a non-eligible holder, secondary-market liquidity may be the practical exit path even if NAV is available to Authorized Participants.

### Liquidity and market/NAV divergence risk

The saved Dexscreener snapshot showed one materially liquid Base Uniswap pair and several much smaller venues. The largest pair showed price $752.59, liquidity $3.693M, and 24h volume $1.940M. Other venues ranged from $40,666 liquidity down to $52 liquidity in the saved data [M1].

The parent snapshot also showed a manager price-per-share near $763.973338, while DEX prices in the saved snapshot were near $752.59–$754.14 [O2][O6][M1].

Risk implication: NAV / manager price and market exit price can diverge. A visible DEX quote does not prove executable depth for a given size.

### Control and intervention risk

The exact token, vault, transfer hook, Root, and request manager were verified, but they are not operationally immutable. The Root / ward architecture can control child contract permissions, change key settings, pause behavior, and update surfaces that affect transfers, vault manager paths, and requests [O1][O2][O3][O4][O5].

At the snapshot, active Root ward contracts were derived from events but were not mapped to named governance, owners, Safe thresholds, or operating policy [O4][O6][R1]. Root delay for adding new Root wards was 2 days, but some current authorized actions can be immediate [O4][O6].

Risk implication: the admin-control model is a material diligence item. The analyst should not assume decentralization, timelock protection, or Safe control until active wards and operating process are identified.

### Freeze and transferability risk

The token uses a transfer hook. Parent source review indicates ordinary transfers are allowed for non-frozen accounts, while freeze/member state can affect transfers and primary request / claim flows [O1][O3].

Risk implication: a balance can become harder to transfer or redeem if the holder is frozen or lacks required member status. This matters especially for liquidator eligibility and automated exit assumptions.

### Pricing and oracle risk

The vault uses manager-provided price-per-share accounting from Centrifuge epoch / NAV processes. Centrifuge launch material also points to Chronicle as an RWA pricing-data provider, but the parent research did not fully expand the exact feed address, cadence, staleness window, reporter authority, or failure handling [D1][D6][O2][O6].

Risk implication: price accounting can be current and still miss practical risks: DEX discount, member restrictions, freeze state, async redemption delay, or fund/NAV impairment.

## 4. Backing and NAV quality

Plain-language model:

- immediate vault asset: Base USDC [O2][O6];
- economic exposure: SPXA / Janus Henderson Anemoy S&P 500 Index Fund exposure [D1][D2][D3];
- primary market: non-U.S. Authorized Participants can mint / redeem at NAV according to Centrifuge materials [D1];
- secondary market: ordinary DeFi holders may rely on DEX venues unless eligibility is confirmed [D5][M1];
- NAV source: manager price-per-share and related pricing infrastructure [O2][O6][D6].

Analyst conclusion: the exposure is understandable, but primary fund documents and independent NAV / custody / audit evidence were not fully captured. Treat backing quality as review-required, not cleanly accepted.

## 5. Liquidity and exit risk

Primary path:

- mint / redeem at NAV is described for non-U.S. Authorized Participants [D1];
- holder-specific member / eligibility state was not verified [D1][D5][O3];
- async request and claim flows can create non-atomic settlement [O2][O5].

Secondary path:

- largest saved venue: Base Uniswap pair with price $752.59, liquidity $3.693M, and 24h volume $1.940M [M1];
- smaller venues had materially less liquidity [M1];
- DEX price in the saved snapshot was below manager price-per-share [O2][O6][M1].

Action implication: for any position-specific exit, use live route quotes and confirm recipient eligibility / freeze state. Do not use saved DEX liquidity as an executable assumption.

## 6. Controls, governance, and legal restrictions

Most relevant controls:

- transfer hook can affect transferability, member gating, and freeze behavior [O1][O3];
- Root and warded contracts can change permissions, pause/unpause, endorse/veto operators, and control child contracts [O4];
- the vault manager and request manager can affect request processing and claims [O2][O5];
- active Root ward identities and owner structures were not resolved [O4][O6][R1];
- fund legal terms, service providers, and redemption rights were not fully retrieved [R2][D4].

Risk implication: the asset combines issuer / fund control and on-chain admin control. For investment analysis, this is not just market beta to the S&P 500; it is a controlled tokenized-fund wrapper with eligibility and operational constraints.

## 7. Pricing / oracle risk in plain language

The vault’s internal value is based on manager-provided price-per-share accounting, while market value comes from DEX liquidity [O2][O6][M1]. These can differ.

Chronicle was identified as a pricing-data partner in Centrifuge materials, but exact feed details were not fully expanded in the parent research [D1][D6].

Risk implication: a NAV-like value can miss immediate exit constraints. Analysts should compare NAV / manager price, DEX route depth, holder eligibility, freeze state, and redemption timing before using the token in collateral or liquidation assumptions.

## 8. X / social research layer

No scoped old-run X/social points memo existed for deSPXA in the available corpus. This package does not invent one.

The preserved report is instead an asset-level tokenized-fund risk note: deSPXA combines Centrifuge DeFi distribution, SPXA / Janus Henderson Anemoy S&P 500 Index Fund exposure, Base vault accounting, member / Authorized Participant primary-market constraints, and on-chain transfer/admin controls. A current social layer should be run separately if the analyst needs market narrative, fund-flow sentiment, issuer announcements, or deSPXA-specific liquidity discussion.

## 9. Quantitative risk / return layer

The old quantitative PT/risk-return report was scoped to APYx and Saturn PT markets. It does not provide a deSPXA expected-loss prior, points valuation, VaR/ES tail model, LLTV recommendation, or PT fixed-discount model.

For deSPXA, the quantitative boundary is therefore explicit: use this package as a qualitative and source-linked base-asset risk dossier. Before any live collateral or allocation decision, a fresh quantitative pass must estimate S&P 500 / fund NAV drawdown, primary-redemption eligibility, Base liquidity at target size, oracle/liquidation behavior, issuer-control tail risk, and any fund-level gate/fee/timing constraints.

## 10. What must be checked before live use

Before using this dossier for a live position, collateral decision, liquidation path, or execution package, refresh:

- holder-specific member / Authorized Participant / KYC status;
- current frozen / member state for holder and recipient;
- transfer hook address and hook behavior;
- Root active ward identities, owners, Safe thresholds, and operating policy;
- Root delay, pause state, and recent Root / child-contract role changes;
- vault manager, request manager, and async request / claim status;
- current price-per-share, price timestamp, and exact pricing-feed details;
- primary legal / fund terms, custody / service providers, holdings, cash buffers, and NAV reports;
- audit and formal-verification scope against the exact Base deployment;
- live DEX route quote for the exact size;
- any new freeze, pause, oracle, redemption-delay, NAV, or incident disclosure;
- Gearbox-specific oracle/support state if this is being evaluated for Credit Account collateral.

Practical implication: unresolved fund, eligibility, admin, or feed questions require human review. Unresolved route, freeze/member state, request state, or price freshness should block automated execution.

## 11. Evidence quality

High-confidence evidence:

- exact token identity, vault, hook, Root, manager, token/vault reads, and verified source snapshots from Blockscout / RPC [O1][O2][O3][O4][O5][O6];
- point-in-time DEX market data [M1].

Medium-confidence evidence:

- Centrifuge and S&P DJI materials describing deSPXA / SPXA and the S&P 500 index fund context [D1][D2][D3];
- Moonwell proposal context for retail / Authorized Participant path, treated as lower-confidence governance context [D5];
- Chronicle pricing-data source hint [D6].

Lower-confidence or incomplete evidence:

- primary legal / fund offering documents;
- holdings, custody, cash buffers, audited financial statements, and NAV reports;
- active Root ward ownership / Safe thresholds;
- exact Chronicle feed details and staleness handling;
- deployed-scope audit / formal-verification reports;
- live executable depth for a specific trade size;
- comprehensive incident history.

## 12. Source map

Each source ID below now includes the actual URL or local evidence path. Local paths are relative to this report folder unless shown as full project paths.

- **METH** — [methodology.md](run/methodology.md). Source class: unknown. Accessed: 2026-06-04. Confidence: high. Project-specific asset mining pipeline, section requirements, source-priority rules, and missing-data behavior.
- **R1** — [research/base-despxa/onchain-admin.md](run/research/base-despxa/onchain-admin.md). Source class: onchain. Accessed: 2026-06-04. Confidence: high. Parent onchain/admin research for identity, verified source, Root/ward state, and sensitive actions.
- **R2** — [research/base-despxa/issuer-backing-security.md](run/research/base-despxa/issuer-backing-security.md). Source class: mixed issuer_docs/onchain/risk_assessment. Accessed: 2026-06-04. Confidence: medium-high. Parent issuer/backing/security research for mechanism, NAV/backing, audits, formal verification, and incidents.
- **R3** — [research/base-despxa/transfer-liquidity-oracle-governance.md](run/research/base-despxa/transfer-liquidity-oracle-governance.md). Source class: mixed onchain/issuer_docs/market_data. Accessed: 2026-06-04. Confidence: medium-high. Parent transfer/liquidity/oracle/governance research for hooks, async redemption, Dexscreener snapshot, oracle blind spots, and watchlist.
- **O1** — [base.blockscout.com/address/0x9c5C365e764829876243d0b289733B9D2b729685](https://base.blockscout.com/address/0x9c5C365e764829876243d0b289733B9D2b729685) and local [research/base-despxa/raw/sources/src__core__spoke__ShareToken.sol](run/research/base-despxa/raw/sources/src__core__spoke__ShareToken.sol). Source class: onchain. Accessed: 2026-06-04. Confidence: high. deSPXA `ShareToken` address/source and token semantics.
- **O2** — [base.blockscout.com/address/0x2dA40F061536c2f3a8f95f23a5f4c133d07D393a](https://base.blockscout.com/address/0x2dA40F061536c2f3a8f95f23a5f4c133d07D393a) and local [research/base-despxa/raw/sources/src__vaults__AsyncVault.sol](run/research/base-despxa/raw/sources/src__vaults__AsyncVault.sol) / `src__vaults__BaseVaults.sol`. Source class: onchain. Accessed: 2026-06-04. Confidence: high. Linked Base USDC `AsyncVault`, ERC-7540 async request/claim flow, price-per-share methods.
- **O3** — [base.blockscout.com/address/0x2a9B9C14851Baf7AD19f26607C9171CA1E7a1A61](https://base.blockscout.com/address/0x2a9B9C14851Baf7AD19f26607C9171CA1E7a1A61) and local [research/base-despxa/raw/sources/blockscout-hook-FreelyTransferable.sol](run/research/base-despxa/raw/sources/blockscout-hook-FreelyTransferable.sol). Source class: onchain. Accessed: 2026-06-04. Confidence: high. Transfer hook, non-frozen transfer behavior, member-gated deposit/redeem paths, freeze behavior.
- **O4** — [base.blockscout.com/address/0x7Ed48C31f2fdC40d37407cBaBf0870B2b688368f](https://base.blockscout.com/address/0x7Ed48C31f2fdC40d37407cBaBf0870B2b688368f) and local [research/base-despxa/raw/sources/blockscout-root-Root.sol](run/research/base-despxa/raw/sources/blockscout-root-Root.sol). Source class: onchain. Accessed: 2026-06-04. Confidence: medium-high. Root source/state, delay, pause, Root ward and child ward operations.
- **O5** — [base.blockscout.com/address/0xF48256AbDDf96EcDDc4B3DbD23E8C1921f9761Ae](https://base.blockscout.com/address/0xF48256AbDDf96EcDDc4B3DbD23E8C1921f9761Ae) and local [research/base-despxa/raw/sources/blockscout-manager-AsyncRequestManager.sol](run/research/base-despxa/raw/sources/blockscout-manager-AsyncRequestManager.sol). Source class: onchain. Accessed: 2026-06-04. Confidence: high. Async request manager source and request/claim/callback admin surfaces.
- **O6** — [research/base-despxa/raw/blockscout-read-contract-summary.json](run/research/base-despxa/raw/blockscout-read-contract-summary.json), `raw/blockscout-smart-contract-token.json`, `raw/root-logs-blockscout-2026-06-04.json`, and `raw/root-ward-state-2026-06-04.txt`. Source class: onchain. Accessed: 2026-06-04. Confidence: high/medium. Local raw Blockscout/RPC snapshot, token/vault/hook/root/manager reads, metadata, and Root event-derived ward state.
- **D1** — [centrifuge.io/blog/despxa-on-base](https://centrifuge.io/blog/despxa-on-base). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: medium. Centrifuge launch post for deSPXA on Base, SPXA exposure, non-US Authorized Participants, DeFi venues, Chronicle/LayerZero/Keyrock context.
- **D2** — [centrifuge.io/blog/centrifuge-q1-2026-recap](https://centrifuge.io/blog/centrifuge-q1-2026-recap). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: medium. Centrifuge recap: deSPXA as freely transferable wrapper of SPXA, V3.1 deployment, V3.2 audit status, Chronicle oracle partner note.
- **D3** — [press.spglobal.com/2025-07-01-S-P-Dow-Jones-Indices-Collaborates-with-Centrifuge-to-Bring-th…](https://press.spglobal.com/2025-07-01-S-P-Dow-Jones-Indices-Collaborates-with-Centrifuge-to-Bring-the-S-P-500-Index-Onchain,-Expanding-Access-to-the-Worlds-Most-Widely-Recognized-Benchmark). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: medium. S&P DJI collaboration with Centrifuge, Anemoy Capital, and Janus Henderson around onchain S&P 500 index fund access.
- **D4** — [app.rwa.xyz/assets/SPXA](https://app.rwa.xyz/assets/SPXA). Source class: market_data / risk_assessment. Accessed: 2026-06-04. Confidence: low. Secondary SPXA asset page summarized in parent artifact; useful as third-party market/risk data, not primary legal proof.
- **D5** — [forum.moonwell.fi/t/proposal-to-add-despxa-market-to-moonwell-on-base/2163](https://forum.moonwell.fi/t/proposal-to-add-despxa-market-to-moonwell-on-base/2163). Source class: governance. Accessed: 2026-06-04. Confidence: low. Moonwell proposal by Centrifuge team; secondary/low-confidence support for retail/AP path and deSPXA/SPXA structure.
- **D6** — [chroniclelabs.org/blog/raising-the-standard-of-real-world-assets-with-centrifuge-anemoy-and-…](https://chroniclelabs.org/blog/raising-the-standard-of-real-world-assets-with-centrifuge-anemoy-and-the-rwa-oracle). Source class: issuer_docs. Accessed: 2026-06-04. Confidence: low. Chronicle RWA oracle integration source hint; parent artifact did not fully extract exact feed address/cadence.
- **M1** — [research/base-despxa/raw/dexscreener-base_despxa-2026-06-04.json](run/research/base-despxa/raw/dexscreener-base_despxa-2026-06-04.json) and [dexscreener.com/base/0xD08f1fb797BfaCdeD23323178672557034c64CfA](https://dexscreener.com/base/0xD08f1fb797BfaCdeD23323178672557034c64CfA). Source class: market_data. Accessed: 2026-06-04. Confidence: medium. Saved Dexscreener API snapshot for Base deSPXA venues, point-in-time prices, liquidity, and 24h volume.

## 13. Technical appendix pointer

For raw addresses, role identifiers, implementation details, method names, and table-level evidence, see:

- `run/technical-reports/base-despxa.md`
- `run/research/base-despxa/`
