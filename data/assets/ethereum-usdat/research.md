# USDat — combined public collateral package

Source lineage: imported from the front-knowledge-base `usdat-susdat-collateral-20260606` reproducible run. This local `research.md` is the MCP evidence surface.

## Combined public research report

# Result — USDat / sUSDat collateral Analyze → Propose

Generated: 2026-06-06 UTC

Audience: human reviewer. This is the report to share. The `run/` folder is the reproduction bundle behind it, not the primary review document.

## Question

Should USDat or sUSDat be treated as acceptable Gearbox Credit Account collateral candidates on Ethereum mainnet when borrowing USDC at a 9% borrow-rate assumption?

## Short answer

USDat is the stronger Analyze-stage candidate. Its supplied Gearbox feed is market-derived from the USDat/USDC Curve pool and observed public liquidity is materially deeper.

sUSDat remains more conditional. Its Gearbox feed uses ERC-4626 accounting over USDat, while immediate recovery can depend on thinner secondary liquidity, queue processing, and issuer / STRC realization.

Neither candidate is ready for Preview or Execute from this run. The correct next state is `request_more_inputs`, not approval.

## What the run established

The run completed the Analyze stage for two Ethereum-mainnet collateral candidates and combined asset diligence with Gearbox oracle/feed analysis.

Formal validation passes for the asset workflow, the oracle workflow, and the combined parent workflow. That means the reproduced artifacts are structurally complete and internally linkable; it does not mean either token is decision-grade collateral for a live position.

The important product result is the gate behavior: the workflow can produce a candidate comparison, but it stops before Preview because live market, position, wallet, and user-policy inputs are missing.

## USDat review

USDat is Saturn's non-yielding dollar token.

The supplied token scope is Ethereum mainnet address `0x23238f20b894f29041f48d88ee91131c395aaa71`. The run treated USDC as the borrow asset and used a 9% borrow-rate assumption.

The strongest point for USDat is the oracle path. The supplied Gearbox feed does not appear to be a hardcoded 1.00 peg. It reads a Curve USDat/USDC market primitive and a bounded USDC/USD child quote. The effective feed answer recorded by the run was `0.99965317` USD at `2026-06-06 08:00:47 UTC`.

The observed public exit venue was the Curve USDat/USDC pool, with about `$15.7M` displayed liquidity and direct balances of roughly `7.82M USDC` and `7.88M USDat` at the run snapshot.

The main blockers are not just price. USDat is issuer-controlled collateral: Saturn documentation describes onboarding requirements, and the token exposes freeze / pause surfaces. A Gearbox Credit Account, liquidator, or recipient route must be proven eligible before any automation or execution decision.

USDat remains `review_required` until the exact Credit Manager / market, allowed-token status, position size, wallet eligibility, route capacity, and user risk policy are supplied.

## sUSDat review

sUSDat is Saturn's ERC-4626 yield-bearing vault token over USDat.

The supplied token scope is Ethereum mainnet address `0xd166337499e176bbc38a1fbd113ab144e5bd2df7`. The run treated USDC as the borrow asset and used a 9% borrow-rate assumption.

The supplied Gearbox feed values sUSDat through ERC-4626 exchange-rate accounting multiplied by the USDat feed. That is a meaningful recursive feed graph, but it creates a different liquidation question: can the accounting value be realized fast enough at the actual position size?

The effective sUSDat feed answer recorded by the run was `0.95272729` USD at `2026-06-06 08:00:47 UTC`. The ERC-4626 exchange-rate probe returned about `0.953119 USDat` per `1 sUSDat`.

The observed sUSDat/USDC Curve venue was much smaller than the USDat venue, with about `$1.8M` displayed liquidity and roughly `296,560 USDC` against `1.62M sUSDat` at the run snapshot.

The main blockers are queue and realization risk. sUSDat adds digital-credit / STRC exposure, queue-based redemption, blacklist / pause surfaces, and a possible gap between accounting value and immediate market exit value.

sUSDat remains `review_required` and should require a higher bar than USDat before any proposal can be considered.

## X / social research layer

The old-run X research adds the missing points/PT market narrative behind the USDat / sUSDat collateral demo. The support files are `run/x-research/x-research-usdat-points-stac-pt-2026-08-27.md` and `run/x-research/x-research-susdat-points-stac-pt-2026-08-27.md`.

USDat social layer:

- USDat is framed as Saturn's stable / risk-off leg, while sUSDat carries the STRC / digital-credit yield exposure.
- PT-USDat 27 Aug 2026 was quoted around `8.95%` to `10.65%` fixed / implied APY in early-June X results, with the local Pendle API snapshot at `8.96%` implied APY.
- Gravity Points are the points upside, but plain PT-USDat reads more like a fixed-yield route than the highest-points-density route.
- Main diligence gap: whitelist/freeze/issuer controls, holder eligibility, reserve evidence, and live route depth still need review.

sUSDat social layer:

- sUSDat is framed as the yield-bearing STRC/NAV/queue-exposed Saturn leg.
- Social return narratives combine STRC dividend / digital-credit yield, PT fixed discount, and Saturn Gravity Points.
- The risk narrative is materially different from USDat: the key issue is whether accounting/NAV value can be realized through queues, issuer controls, and secondary liquidity during stress.

## Quantitative risk / return layer

The old quantitative report makes the collateral distinction sharper than the shorter demo result. The support files are `run/investment-analysis/investment-analyst-report-points-pt-risk-return.md` and `run/investment-analysis/quantitative-underwriting-methodology.md`.

PT-USDat underwriting snapshot:

- Horizon: `83` days to 2026-08-27 maturity.
- Gross fixed ROI: `1.9746%`; simple gross APR: `8.68%`; compound gross APY: `8.98%`.
- Expected-loss prior: `0.70%`; exit-cost assumption: `0.50%`.
- Risk-adjusted ROI before points: `0.7746%`; risk-adjusted annualized return before points: `3.41%`.
- Points ROI needed to clear a `10.00%` net annualized hurdle: `1.4993%` over 83 days.

PT-sUSDat underwriting snapshot:

- Horizon: `83` days to 2026-08-27 maturity.
- Gross fixed ROI: `6.8165%`; simple gross APR: `29.98%`; compound gross APY: `33.64%`.
- Expected-loss prior: `8.10%`; exit-cost assumption: `0.75%`.
- Risk-adjusted ROI before points: `-2.0335%`; risk-adjusted annualized return before points: `-8.94%`.
- Points ROI needed to clear a `10.00%` net annualized hurdle: `4.3075%` over 83 days.

Quantitative conclusion: PT-USDat is the stable-price / low-return candidate and needs credible Saturn points or a lower hurdle to justify the route. PT-sUSDat has higher gross PT yield, but STRC/NAV/queue expected loss consumes the fixed-yield spread under the old priors.

## PT market dossiers

The public package now also preserves the old Pendle PT technical dossiers and raw Pendle snapshots:

- [PT-USDat technical dossier](run/pt-markets/pendle-pt-eth-mainnet-usdat-2026-08-27/technical-report.md)
- [PT-sUSDat technical dossier](run/pt-markets/pendle-pt-eth-mainnet-susdat-2026-08-27/technical-report.md)

## Oracle and liquidation implication

For USDat, the oracle path is more LP-protective than a fixed peg because it can reflect Curve market pressure. The remaining risk is whether the market is liquid enough and whether issuer controls allow the collateral to move or redeem when needed.

For sUSDat, the feed is structurally complete but more dangerous to treat as simple collateral. The feed follows ERC-4626 accounting, while liquidation may need to happen through a thinner secondary market or delayed redemption path. That accounting-versus-exit gap is the central Gearbox risk.

## Proposal gate

The run's proposal is not “approve USDat” or “approve sUSDat.”

The proposal is:

- keep USDat as the cleaner Analyze-stage candidate;
- keep sUSDat as a higher-risk, review-required candidate;
- block Preview and Execute;
- request missing live inputs before any decision-grade proposal.

## Missing before decision-grade proposal

The run intentionally stops until these inputs are supplied:

- evaluated Gearbox market / Credit Manager / pool for USDat;
- evaluated Gearbox market / Credit Manager / pool for sUSDat;
- position size or scenario size range;
- target leverage or scenario leverage;
- intended hold horizon;
- user risk policy: HF floor, max drawdown, automation policy;
- wallet / Credit Account / liquidator eligibility for holding, transfer, redemption, freeze, and blacklist state;
- size-specific route or liquidation quote for the proposed unwind path.

## Readable supporting reports

For detailed review, read these files in order:

- [USDat analyst report](run/asset-investment-diligence/tokens/eth-mainnet-usdat/analyst-report.md)
- [USDat technical report](run/asset-investment-diligence/tokens/eth-mainnet-usdat/technical-report.md)
- [USDat feed graph](run/oracle-analysis/tokens/eth-mainnet-usdat-gearbox-oracle/oracle/feed-graph.md)
- [USDat protocol-fit memo](run/oracle-analysis/tokens/eth-mainnet-usdat-gearbox-oracle/oracle/protocol-fit-memo.md)
- [sUSDat analyst report](run/asset-investment-diligence/tokens/eth-mainnet-susdat/analyst-report.md)
- [sUSDat technical report](run/asset-investment-diligence/tokens/eth-mainnet-susdat/technical-report.md)
- [sUSDat feed graph](run/oracle-analysis/tokens/eth-mainnet-susdat-gearbox-oracle/oracle/feed-graph.md)
- [sUSDat protocol-fit memo](run/oracle-analysis/tokens/eth-mainnet-susdat-gearbox-oracle/oracle/protocol-fit-memo.md)
- [combined Analyze → Propose return](run/agentic-flow/analyze-and-propose.md)
- [USDat X/social research](run/x-research/x-research-usdat-points-stac-pt-2026-08-27.md)
- [sUSDat X/social research](run/x-research/x-research-susdat-points-stac-pt-2026-08-27.md)
- [Quantitative PT risk/return report](run/investment-analysis/investment-analyst-report-points-pt-risk-return.md)
- [Quantitative underwriting methodology](run/investment-analysis/quantitative-underwriting-methodology.md)
- [PT-USDat technical dossier](run/pt-markets/pendle-pt-eth-mainnet-usdat-2026-08-27/technical-report.md)
- [PT-sUSDat technical dossier](run/pt-markets/pendle-pt-eth-mainnet-susdat-2026-08-27/technical-report.md)

## Reproduction

From the repository root:

```bash
python3 dev/tools/run_workflow.py analyze-propose \
  --input dev/implementation/reproducible-runs/usdat-susdat-collateral-20260606/input.json \
  --run-root dev/implementation/reproducible-runs/usdat-susdat-collateral-20260606/run \
  --mode validate \
  --resume \
  --format markdown
```

Expected result:

```text
Status: pass
Exit code: 0
asset: pass
oracle: pass
combined: pass
```

The command regenerates validation side files inside `run/`. Those generated files are intentionally not the primary review surface.


## USDat asset analyst report

# USDat analyst report

Status: review_required

## Executive view

USDat is a plausible Analyze-stage collateral candidate, but not a Preview/Execute candidate from the supplied inputs. The strongest point is that the supplied Gearbox feed is market-derived from the USDat/USDC Curve pool rather than hardcoded at 1.00. The binding blockers are issuer eligibility, freeze/transfer controls, missing Credit Manager context, and missing position size.

## What the token represents

USDat is Saturn's non-yielding dollar token. Saturn docs describe it as backed by M0 tokenized U.S. Treasury exposure at launch and mintable/redeemable through Saturn for onboarded users.

## Main risk implications

The token is not ordinary permissionless stablecoin collateral. A Credit Account that cannot hold, transfer, redeem, or route USDat is operationally unsafe even if the market price and oracle are near par.

## Backing and NAV quality

The backing model is issuer/NAV-dependent. The docs support a treasury-backed launch model, but this run did not independently verify reserve reports or redemption capacity. Treat reserve and issuer-state evidence as review_required.

## Liquidity and exit risk

The USDat/USDC Curve venue has meaningful displayed liquidity, but position size was not supplied. The liquidity result supports continued analysis; it does not prove liquidation or unwind capacity.

## Controls, governance, and legal restrictions

USDat exposes freeze and pause surfaces, and the docs state onboarding is required to mint, redeem, or hold. This keeps automation human-in-the-loop until wallet-specific eligibility is proven.

## Pricing/oracle risk in plain language

Gearbox reads USDat through a Curve TWAP and bounded USDC/USD quote path. This can recognize market depeg pressure, which is LP-protective compared with a fixed peg, but it also exposes borrowers to market dislocations and depends on liquid Curve pricing.

## What must be checked before live use

- Exact Gearbox Credit Manager and allowed-token status.
- Wallet/Credit Account/liquidator eligibility to hold and transfer USDat.
- Position size and route quotes.
- User HF floor and risk policy.
- Issuer reserve/redemption freshness.

## Evidence quality

Evidence quality is adequate for Analyze-stage review and inadequate for execution. On-chain token/feed probes and market snapshots are current to this run; issuer and eligibility facts remain partly source-inconclusive or input_missing.

## Source map

- `technical-report.md`
- `research/onchain-admin.md`
- `research/issuer-backing-security.md`
- `research/transfer-liquidity-oracle-governance.md`

## Technical appendix pointer

See `technical-report.md` for fact-state details and unresolved decision effects.


## USDat technical report

# USDat technical report

Status: review_required

## Scope and inputs

- Token identity: USDat collateral candidate on Ethereum mainnet.
- Token address: `0x23238f20b894f29041f48d88ee91131c395aaa71`.
- Borrow asset: USDC.
- Borrow rate assumption: 9%.
- Supplied LTV/LT context: 0.90.
- Missing input decision effect: no position size, target leverage, hold horizon, wallet eligibility, user HF floor, or Credit Manager was supplied.

## Source-grounded token facts

| Fact slot | State | Evidence | Decision effect |
| --- | --- | --- | --- |
| Token identity | found | `name()=USDat`, `symbol()=USDat`, address above | Scope resolved |
| Decimals | found | `decimals()=6` | Needed for oracle and route math |
| Total supply | found | 133,279,638.354298 USDat | Scale context only |
| Implementation proxy status | found | EIP-1967 implementation `0x17cac25c6d6bbcb592837fea083a5c8eb4d1e52e`, admin `0xcf1072da5f0d127aef99136489bad08bfa3d1a7d` | Upgrade/admin branch remains live |
| Issuer protocol entity | found | Saturn docs and public site | Issuer-controlled branch applies |
| Backing NAV model | found | Saturn docs: 1:1 peg, M0 tokenized treasury backing at launch | Reserve and redemption integrity matter |
| Transfer restrictions | found | Saturn docs: onboarded addresses required; token exposes `isFrozen(address)` | Eligibility blocks automation |
| Mint redeem access | input_missing | No wallet/KYC state supplied | Blocks Preview/Execute |
| Admin control surface | found | `isFrozen(address)`, `paused()`, proxy admin | Human-in-loop issuer-control checks needed |
| Liquidity depth | found but size-dependent | Curve pool and DexScreener snapshots | Position-size route check still missing |
| Oracle accounting method | found | Gearbox Curve TWAP feed over USDat/USDC with bounded USDC/USD quote | Market-derived feed reduces constant-peg overvaluation risk |
| Audits incidents | source_inconclusive | Saturn audit docs listed; no incident sweep completed | Review input before production approval |
| Missing fields decision effect | found | Missing inputs listed above | Proposal cannot advance to Preview |

## Controls and restrictions

USDat is issuer-controlled collateral. The relevant controls are permissioned onboarding, per-address freeze state, pause state, proxy upgrade/admin control, and redemption access. A zero-address probe returning `isFrozen=false` is not evidence that a Gearbox Credit Account, liquidator, or recipient route is eligible.

## Liquidity and oracle surface

The main observed public exit venue is the Curve USDat/USDC pool with about $15.7M displayed liquidity and about 7.82M USDC / 7.88M USDat direct balances. The Gearbox feed reads USDat through a Curve TWAP and a bounded USDC/USD child feed, with latest answer 0.99965317 USD on 2026-06-06 08:00:47 UTC.

## Missing fields and decision effect

- Credit Manager / market: input_missing; blocks allowed-token and collateral-parameter conclusion.
- Position size: input_missing; blocks exit slippage, liquidation depth, and route capacity.
- Wallet eligibility / KYC / freeze state: input_missing; blocks automation.
- User risk policy / HF floor: input_missing; blocks Preview/Execute.

## Technical appendix

- `research/onchain-admin.md`
- `research/issuer-backing-security.md`
- `research/transfer-liquidity-oracle-governance.md`
- `research/dexscreener-usdat-20260606.json`
- `research/defillama-prices-usdat-susdat-20260606.json`
