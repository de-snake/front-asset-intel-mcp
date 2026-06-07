# sUSDat — combined public collateral package

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


## sUSDat asset analyst report

# sUSDat analyst report

Status: review_required

## Executive view

sUSDat is a higher-risk Analyze-stage collateral candidate than USDat. The supplied Gearbox feed does recurse into the USDat feed through ERC-4626 accounting, but the asset adds digital-credit/STRC exposure, queue-based redemption, blacklist/pause controls, and shallower secondary liquidity. It is not suitable for Preview/Execute from the supplied inputs.

## What the token represents

sUSDat is Saturn's ERC-4626 yield-bearing vault token. It represents a share of a managed pool whose yield is tied to digital credit exposure, including STRC according to Saturn docs.

## Main risk implications

The key risk is not only price volatility. The relevant question is whether the accounting value can be realized under liquidation timing and at the proposed size. The queue and secondary-market discount matter directly for Gearbox LP bad-debt risk.

## Backing and NAV quality

The NAV model is issuer and strategy dependent. Docs describe STRC exposure, reward vesting, dynamic reserve allocation, and offchain verification work. This is a review_required NAV branch, not ordinary liquid stablecoin collateral.

## Liquidity and exit risk

The observed sUSDat/USDC Curve venue is materially smaller than the USDat venue. Secondary-market pricing around the run was below the ERC-4626/Gearbox accounting value, so route sizing is mandatory.

## Controls, governance, and legal restrictions

sUSDat exposes blacklist and pause surfaces. Because the underlying USDat is permissioned, both sUSDat and its redemption output inherit eligibility concerns.

## Pricing/oracle risk in plain language

Gearbox values sUSDat as an ERC-4626 share times the USDat feed. That is structurally recursive and better than a top-level label, but it can be borrower-friendly and LP-risky if liquidators must sell into a discounted or thin secondary market instead of realizing queue value.

## What must be checked before live use

- Exact Gearbox Credit Manager and allowed-token status.
- Wallet/Credit Account/liquidator eligibility for both sUSDat and USDat.
- Position-size route quote for sUSDat exit.
- Queue processing state, minimum-output behavior, and STRC execution path.
- User HF floor, hold horizon, and risk policy.

## Evidence quality

Evidence quality is adequate for Analyze-stage triage. It is not decision-grade for execution because the most important facts are size-, wallet-, and market-specific.

## Source map

- `technical-report.md`
- `research/onchain-admin.md`
- `research/issuer-backing-security.md`
- `research/transfer-liquidity-oracle-governance.md`

## Technical appendix pointer

See `technical-report.md` for fact-state details and unresolved decision effects.


## sUSDat technical report

# sUSDat technical report

Status: review_required

## Scope and inputs

- Token identity: sUSDat collateral candidate on Ethereum mainnet.
- Token address: `0xd166337499e176bbc38a1fbd113ab144e5bd2df7`.
- Borrow asset: USDC.
- Borrow rate assumption: 9%.
- Supplied LTV/LT context: 0.86.
- Missing input decision effect: no position size, target leverage, hold horizon, wallet eligibility, user HF floor, or Credit Manager was supplied.

## Source-grounded token facts

| Fact slot | State | Evidence | Decision effect |
| --- | --- | --- | --- |
| Token identity | found | `name()=Staked USDat`, `symbol()=sUSDat`, address above | Scope resolved |
| Decimals | found | `decimals()=18` | Needed for share math |
| Implementation proxy status | found | EIP-1967 implementation `0x2005e0ca201a37694125ff267ae57872bea0a0ce`, admin slot zero | Governance semantics remain source_inconclusive |
| Issuer protocol entity | found | Saturn docs | Issuer-controlled branch applies |
| Backing NAV model | found | ERC-4626 vault over USDat with STRC/digital-credit exposure | NAV and queue risk are central |
| Transfer restrictions | found | `isBlacklisted(address)`, `paused()`, withdrawal queue docs | Wallet and route eligibility required |
| Mint redeem access | input_missing | Queue status and wallet eligibility not supplied | Blocks Preview/Execute |
| Admin control surface | found | blacklist/pause probes, ERC-4626 methods | Human review required |
| Liquidity depth | found but size-dependent | Curve and DexScreener snapshots | Position-size route check still missing |
| Oracle accounting method | found | Gearbox ERC4626 feed over USDat feed | Accounting value may differ from immediate market exit value |
| Audits incidents | source_inconclusive | Audit docs listed; incident sweep not complete | Review input |
| Missing fields decision effect | found | Missing inputs listed above | Proposal cannot advance to Preview |

## Controls and restrictions

sUSDat is an issuer-managed ERC-4626 vault share with blacklist/pause surfaces and a queue-based redemption process. The queue process can be incompatible with forced liquidation timing unless the strategy relies on proven secondary-market depth.

## Liquidity and oracle surface

The main observed public venue is the Curve sUSDat/USDC pool with about $1.8M displayed liquidity and about 296,560 USDC against 1.62M sUSDat. The Gearbox feed values sUSDat by ERC-4626 exchange rate multiplied by the USDat feed, with latest answer 0.95272729 USD on 2026-06-06 08:00:47 UTC.

## Missing fields and decision effect

- Credit Manager / market: input_missing; blocks allowed-token and collateral-parameter conclusion.
- Position size: input_missing; blocks exit slippage, liquidation depth, and route capacity.
- Wallet eligibility / KYC / blacklist state: input_missing; blocks automation.
- Queue state and hold horizon: input_missing; blocks redemption and risk/return assessment.
- User risk policy / HF floor: input_missing; blocks Preview/Execute.

## Technical appendix

- `research/onchain-admin.md`
- `research/issuer-backing-security.md`
- `research/transfer-liquidity-oracle-governance.md`
- `research/dexscreener-susdat-20260606.json`
- `research/defillama-prices-usdat-susdat-20260606.json`
