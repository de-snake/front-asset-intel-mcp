# Hastra PRIME — investment analyst risk note

Report date: 2026-06-04 UTC
Audience: investment analyst
Asset: Hastra PRIME on Ethereum mainnet
Token address: `0x19ebb35279A16207Ec4ba82799CC64715065F7F6`
Symbol: `PRIME`

This note is an analyst-readable rewrite of the technical dossier. It is source-linked context for risk review, not an investment recommendation, asset-selection recommendation, suitability verdict, position-size recommendation, or execution instruction.

Detailed contract evidence was preserved separately in `run/technical-reports/eth-mainnet-prime.md`.
This expanded public version also preserves the old-run support artifacts and marks the missing X/social and quantitative layers explicitly instead of fabricating them.

## 1. Executive view

PRIME is a Hastra vault-share token whose immediate on-chain asset is wYLDS. Hastra terms describe the broader product chain as USDC to wYLDS to PRIME: wYLDS is described as backed 1:1 by YLDS, and PRIME accrues wYLDS linked to Figure Democratized Prime HELOC lending operations [S1][S3][S4][S9].

The key investment point is that PRIME is not a simple liquid USD stablecoin. It is a tokenized exposure with several layers:

- PRIME vault mechanics on Ethereum [S1][S3];
- wYLDS / YLDS backing and settlement assumptions [S4][S9];
- Figure HELOC lending performance as described by Hastra terms [S4];
- a NAV / redemption-rate feed used for conversions [S1][S8];
- issuer and legal eligibility controls [S4];
- administrator, pause, freeze, and upgrade controls [S1][S3][S12];
- DEX liquidity that can be adequate for smaller exits but cliff near visible pool inventory [S1][S10].

Primary risk implication: PRIME can show a clean NAV and active market while still carrying off-chain NAV-construction risk, issuer settlement risk, account-freeze risk, and size-dependent exit risk.

## 2. What the token represents

A PRIME holder owns a share in a Hastra staking vault. The direct redemption output is wYLDS, not final USDC [S1][S3]. To reach USDC through the primary path, the holder must then go through the wYLDS / YieldVault redemption process, which depends on request processing, admin completion, redeemVault USDC availability, and eligibility state [S9].

Hastra terms describe the economic exposure as linked to wYLDS/YLDS and Figure Democratized Prime HELOC lending operations [S4]. That makes PRIME an issuer-controlled, RWA-linked yield exposure, not a purely on-chain money-market token.

## 3. Main risk implications

### Backing and exposure risk

PRIME’s direct asset is wYLDS. Hastra terms describe wYLDS as backed 1:1 by YLDS, with PRIME accruing wYLDS based on Figure Democratized Prime HELOC lending operations [S4]. Hastra’s proof-of-reserves page displayed backing and supply metrics, including wYLDS backing of 101.08% and PRIME price $1.0409 when extracted by parent research [S6].

However, the report bodies for reserve, custody, and attestation evidence were not located in the source pass. The proof page is issuer evidence, not a full independent audit reconciliation [S6].

Risk implication: the product story is coherent, but backing assurance remains incomplete. Analysts should require current reserve / custody / attestation bodies before cleanly ranking the asset or treating NAV as independently validated.

### NAV feed risk

PRIME conversions use a NAV / redemption-rate feed rather than DEX market price or a simple vault ratio [S1][S3][S8]. The feed had a 1-hour default staleness window on-chain at the snapshot [S1][S8]. If the feed is absent, stale, invalid, non-positive, or paused long enough to go stale, deposit and redemption conversions can fail [S3][S8].

Risk implication: a valid feed is operationally important. The feed can also be current while missing other risks: liquidity cliffs, issuer eligibility blocks, freeze state, YieldVault redemption delay, or underlying collateral impairment.

### Redemption and settlement risk

Redeeming PRIME returns wYLDS. Final USDC settlement is a separate step through YieldVault request / completion mechanics [S3][S9]. The parent research did not find a transferable PRIME claim token or receipt; YieldVault uses internal pending-redemption tracking [S9].

Risk implication: primary exit can become a non-atomic settlement process. The holder may depend on admin completion and available USDC in the redeemVault. For any real exit, require live settlement checks rather than assuming NAV can be turned into USDC immediately.

### Liquidity risk

The scoped Ethereum token had one main DEX venue in the saved research: a Uniswap V3 PRIME/USDC pool. It showed $9.001M liquidity and $11.702M 24h volume at extraction time, with pool balances near 5.511M PRIME and 3.268M USDC [S1][S10].

The quote samples stayed near spot for sales through 3M PRIME, but a 5M PRIME sale quoted only 3.268M USDC, close to draining visible USDC inventory [S1].

Risk implication: ordinary price screens can overstate practical exit depth. Size matters materially.

### Control and intervention risk

A 4-of-7 Safe controlled default-admin and upgrader roles for PRIME and FeedVerifier. An operational EOA held pauser, freezer, and rewards roles, and no on-chain timelock was found for the Safe-controlled upgrade path [S1][S3][S12].

PRIME had two observed pause windows before the snapshot, and two YieldVault accounts were found frozen in the redemption path. No PRIME frozen-account events were observed in the scanned range, but account-specific status must be checked live [S1][S3][S9].

Risk implication: admin controls can affect existing holders through upgrades, pause, freeze, NAV-feed configuration, or settlement-path controls. Governance state should be refreshed before production use.

### Legal and eligibility risk

Hastra terms restrict U.S. persons / locations and sanctioned or illegal jurisdictions. They also reserve discretion to request information, verify eligibility, block access, or block property interests when required by law [S4].

Risk implication: technical transferability does not equal user eligibility. A live primary redemption or settlement should be blocked until holder eligibility and account status are known.

## 4. Backing and NAV quality

Plain-language model:

- PRIME is the Ethereum vault-share token [S1][S3].
- PRIME’s direct redemption asset is wYLDS [S1][S3].
- Hastra terms describe wYLDS as backed 1:1 by YLDS [S4].
- PRIME return is described as linked to Figure Democratized Prime HELOC lending operations [S4].
- PRIME contract conversions use a NAV / redemption-rate feed [S1][S3][S8].
- Hastra’s proof page displayed backing and supply metrics, but the underlying report bodies and scope were not extracted [S6].

Analyst conclusion: the NAV mechanism is technically identifiable, but the off-chain construction and backing proof are not fully evidenced in this dossier. That makes reserve / custody / feed-construction review a priority.

## 5. Liquidity and exit risk

Primary exit:

- PRIME redemption returns wYLDS, not USDC [S1][S3].
- wYLDS-to-USDC settlement requires YieldVault request / completion mechanics and sufficient USDC in the redeemVault [S9].
- Account freeze or legal eligibility issues can block the process [S4][S9].

Secondary market exit:

- Main saved Ethereum venue: Uniswap V3 PRIME/USDC pool [S10].
- Reported liquidity: $9.001M; 24h volume: $11.702M at extraction [S10].
- Point-in-time quote cliff: 5M PRIME quoted at 0.653652 USDC/PRIME, despite smaller quotes staying near 1.04 USDC/PRIME [S1].

Action implication: for any portfolio or liquidation analysis, use a live quote for the actual size. Do not infer large-size liquidity from spot price or 24h volume alone.

## 6. Controls, governance, and legal restrictions

Most relevant controls:

- PRIME and FeedVerifier can be upgraded by the Safe-controlled path [S1][S3][S8][S12].
- PRIME can be paused, blocking deposit, mint, redeem, withdraw, and reward distribution flows [S3].
- PRIME accounts can be frozen, which blocks transfers involving the frozen account [S3].
- FeedVerifier can be paused or configured, and stale / invalid feed data can block conversions [S8].
- YieldVault roles affect wYLDS redemption and settlement [S9].
- Hastra terms can restrict access, verification, or property interests [S4].

Risk implication: PRIME’s risk is not only market risk. It includes issuer policy, account status, feed operations, and admin execution risk.

## 7. Pricing / oracle risk in plain language

PRIME’s contract value uses a NAV / redemption-rate feed. That feed can be current and still fail to capture practical exit risks such as DEX liquidity depth, redemption delays, freeze state, or legal eligibility [S1][S3][S8][S10].

At the research point, NAV and market value were close near $1.04, but this was only a snapshot and did not remove size-dependent or primary-settlement risk [S1][S10][S11].

Risk implication: NAV should be treated as one input, not the final executable value. The analyst should compare NAV, DEX route depth, account status, and settlement path.

## 8. X / social research layer

No scoped old-run X/social points memo existed for PRIME in the available corpus. This package does not substitute generic social commentary for missing evidence.

What is preserved instead is the asset-level risk note plus technical dossier: PRIME's investment question is about vault-share mechanics, wYLDS/YLDS backing, HELOC-linked exposure, issuer controls, redemption/whitelist mechanics, and Ethereum exit depth. If a current social layer is needed, it should be run as a fresh query with PRIME-specific handles, market venues, proof-of-reserves updates, and redemption-status questions.

## 9. Quantitative risk / return layer

The old quantitative PT/risk-return report was scoped to APYx and Saturn PT markets. It does not provide a PRIME expected-loss prior, points valuation, VaR/ES tail model, LLTV recommendation, or PT fixed-discount model.

For PRIME, the quantitative boundary is therefore explicit: use this package as a qualitative and source-linked base-asset risk dossier. Before any capital-allocation or collateral-sizing decision, a fresh quantitative pass must estimate vault NAV sensitivity, wYLDS/YLDS realization risk, HELOC credit-cycle exposure, exit depth at target size, issuer-control tail risk, and oracle/liquidation behavior for the exact Gearbox market.

## 10. What must be checked before live use

Before using this dossier for a live position, collateral decision, liquidation path, or execution package, refresh:

- PRIME implementation, pause state, and account freeze status;
- NAV feed ID, feed value, staleness window, updater status, and FeedVerifier configuration;
- Safe owners, threshold, modules, guard, and pending transactions;
- operational EOA roles across PRIME, FeedVerifier, and YieldVault;
- YieldVault redemption state, redeemVault USDC availability, and settlement completion process;
- user-specific legal / jurisdiction / eligibility status;
- current reserve / custody / attestation report bodies for wYLDS / YLDS;
- current audit scope against the deployed PRIME and FeedVerifier implementations;
- live Uniswap route quote for the exact size;
- any new pause, freeze, oracle, depeg, reserve, redemption-delay, or incident disclosure;
- Gearbox-specific oracle/support state if this is being evaluated for Credit Account collateral.

Practical implication: unresolved backing, feed-construction, eligibility, or admin-process questions require human review. Unresolved route, freeze, feed, settlement, or pending-governance state should block automated execution.

## 11. Evidence quality

High-confidence evidence:

- exact token identity, implementation, token state, NAV feed, Safe state, role state, pool balances, and quote samples from on-chain checks [S1];
- verified source for PRIME, FeedVerifier, and YieldVault mechanics [S2][S3][S8][S9].

Medium-confidence evidence:

- Hastra terms and product site for mechanism, issuer, and eligibility language [S4][S5];
- Hastra proof-of-reserves page for displayed metrics [S6];
- CoinGecko and DEXScreener market data [S10][S11].

Lower-confidence or incomplete evidence:

- exact off-chain NAV construction;
- reserve/custody/attestation report bodies;
- public deployed-scope audit report;
- user-specific redemption SLA and eligibility process;
- off-chain operational identity of Safe owners and EOAs;
- complete incident history.

## 12. Source map

Each source ID below now includes the actual URL or local evidence path. Local paths are relative to this report folder unless shown as full project paths.

- **S1** — [ethereum.publicnode.com](https://ethereum.publicnode.com) / [ethereum-rpc.publicnode.com](https://ethereum-rpc.publicnode.com) plus local raw snapshots [research/hastra-prime/raw/onchain-admin-snapshot-2026-06-04.json](run/research/hastra-prime/raw/onchain-admin-snapshot-2026-06-04.json) and [research/hastra-prime/raw/feed-verifier-snapshot-2026-06-04.json](run/research/hastra-prime/raw/feed-verifier-snapshot-2026-06-04.json). Source class: onchain. Freshness: current at snapshot blocks `25243546` / `25243587` / `25243612` / `25243627` as reported by parent artifacts. Accessed: 2026-06-04. Confidence: high. Direct Ethereum mainnet RPC / Foundry checks for proxy slots, token calls, roles, FeedVerifier state, pause/freeze events, Safe calls, pool balances, and Uniswap quotes.
- **S2** — [repo.sourcify.dev/contracts/full_match/1/0x19ebb35279A16207Ec4ba82799CC64715065F7F6/metadata…](https://repo.sourcify.dev/contracts/full_match/1/0x19ebb35279A16207Ec4ba82799CC64715065F7F6/metadata.json). Source class: onchain. Freshness: current when fetched. Accessed: 2026-06-04. Confidence: high. Sourcify full-match metadata for the PRIME proxy.
- **S3** — [repo.sourcify.dev/contracts/full_match/1/0x90fd843c68db38e2de0618AcBB39341CbA5A5abD/metadata…](https://repo.sourcify.dev/contracts/full_match/1/0x90fd843c68db38e2de0618AcBB39341CbA5A5abD/metadata.json) and [repo.sourcify.dev/contracts/full_match/1/0x90fd843c68db38e2de0618AcBB39341CbA5A5abD/sources/…](https://repo.sourcify.dev/contracts/full_match/1/0x90fd843c68db38e2de0618AcBB39341CbA5A5abD/sources/contracts/StakingVault.sol); mirrored repo URL [github.com/provenance-io/hastra-eth-vault/blob/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/cont…](https://github.com/provenance-io/hastra-eth-vault/blob/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/contracts/StakingVault.sol). Source class: onchain / issuer source. Freshness: current when fetched. Accessed: 2026-06-04. Confidence: high. Verified PRIME implementation source for ERC-4626/NAV/freeze/pause/upgrade behavior.
- **S4** — [hastra.io/terms](https://hastra.io/terms). Source class: legal_terms. Freshness: dated terms, last updated 2025-12-03 per parent artifact. Accessed: 2026-06-04. Confidence: medium/high. Official Hastra terms for issuer entity, mechanism, wYLDS/YLDS/PRIME descriptions, eligibility restrictions, and blocking language.
- **S5** — [hastra.io](https://hastra.io/). Source class: issuer_docs. Freshness: current when fetched. Accessed: 2026-06-04. Confidence: medium. Official Hastra product site for live product/category statements.
- **S6** — [hastra.io/proof-of-reserves](https://hastra.io/proof-of-reserves). Source class: issuer_docs. Freshness: current when extracted. Accessed: 2026-06-04. Confidence: medium. Official proof-of-reserves page with displayed wYLDS/PRIME/vaulted-wYLDS/backing metrics and audit labels; report bodies/scopes were not exposed in parent extraction.
- **S7** — [github.com/provenance-io/hastra-eth-vault](https://github.com/provenance-io/hastra-eth-vault), [github.com/provenance-io/hastra-eth-vault/blob/main/deployment_mainnet.json](https://github.com/provenance-io/hastra-eth-vault/blob/main/deployment_mainnet.json), [github.com/provenance-io/hastra-eth-vault/blob/main/docs/ROLES.md](https://github.com/provenance-io/hastra-eth-vault/blob/main/docs/ROLES.md), [github.com/provenance-io/hastra-eth-vault/blob/main/docs/KEY_MANAGEMENT.md](https://github.com/provenance-io/hastra-eth-vault/blob/main/docs/KEY_MANAGEMENT.md), and docs under commit `1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd`. Source class: issuer_docs / source. Freshness: current repo state when fetched, with some stale README/status text noted. Accessed: 2026-06-04. Confidence: medium. Official public repository and operational docs; use source/docs where corroborated by on-chain state, treat conflicting deployment/audit status prose as stale.
- **S8** — [repo.sourcify.dev/contracts/full_match/1/0xdF4ab20fA7752Be52E41e42F1FD667f37964d6a3/metadata…](https://repo.sourcify.dev/contracts/full_match/1/0xdF4ab20fA7752Be52E41e42F1FD667f37964d6a3/metadata.json), [repo.sourcify.dev/contracts/full_match/1/0xbC6023cb49F8E8cA6cef563d5FD97ba4C6A5D937/metadata…](https://repo.sourcify.dev/contracts/full_match/1/0xbC6023cb49F8E8cA6cef563d5FD97ba4C6A5D937/metadata.json), [repo.sourcify.dev/contracts/full_match/1/0xbC6023cb49F8E8cA6cef563d5FD97ba4C6A5D937/sources/…](https://repo.sourcify.dev/contracts/full_match/1/0xbC6023cb49F8E8cA6cef563d5FD97ba4C6A5D937/sources/contracts/FeedVerifier.sol), [github.com/provenance-io/hastra-eth-vault/blob/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/chai…](https://github.com/provenance-io/hastra-eth-vault/blob/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/chainlink-hub/contracts/FeedVerifier.sol), and [github.com/provenance-io/hastra-eth-vault/blob/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/chai…](https://github.com/provenance-io/hastra-eth-vault/blob/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/chainlink-hub/docs/FeedVerifier.md). Source class: onchain / issuer source / oracle docs. Freshness: current when fetched. Accessed: 2026-06-04. Confidence: high for source/on-chain behavior, medium for prose docs. FeedVerifier proxy/implementation/source/docs for NAV feed behavior, staleness, allowed feed ID, updater role, and Chainlink Data Streams dependency.
- **S9** — [github.com/provenance-io/hastra-eth-vault/blob/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/cont…](https://github.com/provenance-io/hastra-eth-vault/blob/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/contracts/YieldVault.sol) plus repo compliance docs under [github.com/provenance-io/hastra-eth-vault/tree/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/docs](https://github.com/provenance-io/hastra-eth-vault/tree/1b91d4eb0eca9bd71b1284cd7d0cb05279e2affd/docs). Source class: issuer source / issuer_docs. Freshness: current when fetched. Accessed: 2026-06-04. Confidence: high for source mechanics, medium for operational docs. YieldVault/wYLDS redemption, pendingRedemptions, completeRedeem, freeze/thaw, whitelist/redeemVault mechanics.
- **S10** — [api.dexscreener.com/token-pairs/v1/ethereum/0x19ebb35279A16207Ec4ba82799CC64715065F7F6](https://api.dexscreener.com/token-pairs/v1/ethereum/0x19ebb35279A16207Ec4ba82799CC64715065F7F6) and [dexscreener.com/ethereum/0x5b70a1582135bd04e39ca94a6a56fc3a828e3115](https://dexscreener.com/ethereum/0x5b70a1582135bd04e39ca94a6a56fc3a828e3115). Source class: market_data. Freshness: point-in-time current. Accessed: 2026-06-04. Confidence: high for reported pair at extraction, medium for future depth. DEXScreener Ethereum PRIME/USDC pair, liquidity, volume, pair creation, and price fields.
- **S11** — [www.coingecko.com/en/coins/hastra-prime](https://www.coingecko.com/en/coins/hastra-prime) and CoinGecko public API `/api/v3/coins/hastra-prime`. Source class: market_data. Freshness: point-in-time current. Accessed: 2026-06-04. Confidence: medium. Global PRIME price/volume/history data; global markets include non-Ethereum venues and should not be used as Ethereum-only exit depth.
- **S12** — [safe-transaction-mainnet.safe.global/api/v1/safes/0x8D358B8aE881F8ea92C3d07783aBCA21727C6309](https://safe-transaction-mainnet.safe.global/api/v1/safes/0x8D358B8aE881F8ea92C3d07783aBCA21727C6309/) and related Safe multisig transaction endpoint plus on-chain Safe calls. Source class: governance / onchain. Freshness: current when checked. Accessed: 2026-06-04. Confidence: high. Safe owners/threshold/modules/guard/pending transaction evidence for current admin/upgrader governance surface.
- **P1** — [research/hastra-prime/onchain-admin.md](run/research/hastra-prime/onchain-admin.md). Source class: onchain synthesis artifact. Freshness: current local parent artifact. Accessed: 2026-06-04. Confidence: high where backed by listed sources. Parent research for identity/admin/FeedVerifier details; cited original sources above for material claims.
- **P2** — [research/eth-mainnet-prime/issuer-backing-security.md](run/research/eth-mainnet-prime/issuer-backing-security.md). Source class: synthesis artifact. Freshness: current local parent artifact. Accessed: 2026-06-04. Confidence: medium/high where backed by listed sources. Parent research for issuer/backing/security details; cited original sources above for material claims.
- **P3** — [research/eth-mainnet-prime/transfer-liquidity-oracle-governance.md](run/research/eth-mainnet-prime/transfer-liquidity-oracle-governance.md). Source class: synthesis artifact. Freshness: current local parent artifact. Accessed: 2026-06-04. Confidence: medium/high where backed by listed sources. Parent research for transfer/redemption/liquidity/oracle/governance details; cited original sources above for material claims.

## 13. Technical appendix pointer

For raw addresses, role identifiers, implementation slots, method names, and table-level evidence, see:

- `run/technical-reports/eth-mainnet-prime.md`
- `run/research/eth-mainnet-prime/`
- `run/research/hastra-prime/`
