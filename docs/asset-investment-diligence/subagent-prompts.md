# Subagent prompts

These are paste-ready prompts for delegated workers. Replace bracketed fields before use.

The prompts are written for this MCP repo's static-research model: workers create offline run artifacts first, then the parent imports reviewed outputs into `data/assets/<asset-slug>/`. Do not create repo-root `investment-analysis/`, `x-research/`, `tokens/`, or `pt-markets/` directories. All stage outputs are under `[run_artifact_root]/`.

General worker rules:

1. Create parent directories before writing files.
2. Keep source URLs, access dates, source class, confidence, and missing-data behavior near the claim they support.
3. Prefer primary sources: contract explorers, official docs, issuer attestations/reports, audits, governance/Safe/timelock pages, protocol APIs, DEX/Pendle market pages, oracle docs, and directly cited X posts.
4. Use secondary sources only as pointers unless the primary source is unavailable; mark the claim `citation_degraded` if the exact source cannot be cited.
5. Do not dump raw API responses or raw contract source into the parent handoff. Write evidence to files and return compressed paths + conclusions.
6. Do not write investment recommendations, execution instructions, or suitability language.
7. If a source is unavailable, keep the field as an explicit blocker instead of filling it with a guess.

## S1 prompt — General asset mining

Goal:

Collect token-level evidence for `[symbol]` on `[chain]` at `[token_address]` and write the S1 artifacts required by `docs/asset-investment-diligence/stage-contracts.md`.

Context:

- Run artifact root: `[run_artifact_root]`.
- Token artifact directory: `[run_artifact_root]/tokens/[token_slug]`, for example `[run_artifact_root]/tokens/ethereum-susdat-d1663374`.
- Token scope:
  - chain_id: `[chain_id]`
  - chain: `[chain]`
  - symbol: `[symbol]`
  - token_address: `[token_address]`
  - issuer_or_protocol_hint: `[issuer_or_protocol_hint]`
  - intended_use: `[intended_use]`
- Output directory prefix: `[run_artifact_root]/tokens/[token_slug]/research/`.

How to do it:

1. Initialize files:
   - write `[run_artifact_root]/tokens/[token_slug]/scope.json` with the input scope, run date, and unresolved identifiers;
   - create `[run_artifact_root]/tokens/[token_slug]/research/`.
2. Build a source register before concluding anything:
   - block explorer token page and contract page;
   - implementation/proxy/admin pages if proxied;
   - issuer/protocol docs and legal/backing pages;
   - reserve attestations, NAV reports, custodial statements, or dashboard pages;
   - audits and security reviews;
   - liquidity venues, oracle/feed docs, and governance/Safe/timelock pages.
3. On-chain/admin pass:
   - identify token standard, decimals, total supply, holders if available, and contract verification status;
   - identify proxy pattern, implementation address, proxy admin, owner, roles, minters/burners, pausers, blacklist/freezer/deny-list controls, upgrade rights, and timelocks/multisigs;
   - check recent relevant events when visible: upgrades, role changes, pauses, blacklist/freeze events, mint/burn anomalies;
   - if a field cannot be confirmed, write `unknown` plus the attempted source.
4. Issuer/backing/security pass:
   - identify what the token represents, claim on assets, redemption promise, reserve/NAV cadence, custodian/administrator, legal wrapper, and eligible holders;
   - capture last available reserve/NAV evidence and whether it is realtime, daily, monthly, or stale;
   - summarize audit scope, dates, unresolved findings, bug bounty, and incident history.
5. Transfer/liquidity/oracle/governance pass:
   - document transfer restrictions, permissioning, blacklist/freeze/pause impact, and holder-specific redemption constraints;
   - capture main liquidity venues, approximate depth/route constraints if available, and whether live size quotes are still required;
   - identify oracle/accounting source and whether it tracks executable value or only accounting/NAV value;
   - document governance/admin change process.
6. Write outputs:
   - `[run_artifact_root]/tokens/[token_slug]/research/onchain-admin.md`
   - `[run_artifact_root]/tokens/[token_slug]/research/issuer-backing-security.md`
   - `[run_artifact_root]/tokens/[token_slug]/research/transfer-liquidity-oracle-governance.md`
   - `[run_artifact_root]/tokens/[token_slug]/technical-report.md`
7. Technical report structure:
   - Scope and source register.
   - Contract identity.
   - Admin/control surfaces.
   - Backing/redemption/holder eligibility.
   - Liquidity/market behavior.
   - Oracle/accounting alignment.
   - Security/incidents.
   - Missing-data blockers.
   - Source map.
8. Return only a compressed handoff:
   - artifact paths;
   - five strongest numeric facts;
   - top risks;
   - blockers;
   - validation status.

## S2 prompt — Asset-risk analyst report

Goal:

Convert S1 evidence for `[symbol]` into an analyst-readable token risk report.

Context:

- Run artifact root: `[run_artifact_root]`.
- Token artifact directory: `[run_artifact_root]/tokens/[token_slug]`.
- Read these S1 artifacts:
  - `[technical_report_path]`
  - `[research_onchain_admin_path]`
  - `[research_issuer_backing_security_path]`
  - `[research_transfer_liquidity_oracle_governance_path]`
- Output report: `[run_artifact_root]/tokens/[token_slug]/analyst-report.md`.
- Output verification: `[run_artifact_root]/tokens/[token_slug]/verification.md`.

How to do it:

1. Read the S1 technical report first, then expand the three research files only when a conclusion needs detail.
2. Convert evidence into decision-useful risks. For each major risk, include:
   - what is known;
   - why it matters for collateral/use;
   - what live input would unblock automation;
   - confidence and source IDs.
3. Use these plain-language sections:
   - Executive view.
   - What the token represents.
   - Main risk implications.
   - Backing and NAV quality.
   - Redemption and holder eligibility.
   - Liquidity and exit risk.
   - Controls, governance, and legal restrictions.
   - Pricing/oracle risk in plain language.
   - What must be checked before live use.
   - Evidence quality.
   - Source map.
   - Technical appendix pointer.
4. Map risk implications to concrete blocker language instead of adjectives:
   - `usable_for_review` when evidence is sufficient but still needs human review;
   - `review_required` when evidence is partial, stale, or size-specific;
   - `block_automation` when live execution, holder eligibility, admin state, or route state is unresolved;
   - `cannot_underwrite` when the current evidence does not support a quantitative view.
5. Preserve source IDs and confidence notes. Do not compare against other tokens. Do not include code fences.
6. Write `[run_artifact_root]/tokens/[token_slug]/verification.md` with:
   - required sections present;
   - source map present;
   - no recommendation language;
   - unresolved blockers listed.
7. Return compressed handoff only:
   - report path;
   - executive view;
   - key risk implications;
   - missing-behavior blockers;
   - numeric facts;
   - verification result.

## S3 prompt — PT market/economics analysis

Use this stage only when the scoped asset is a Pendle PT token or explicit PT market. Skip S3 for ordinary/direct tokens.

Goal:

Identify and analyze the exact Pendle PT market for `[symbol]` maturity `[maturity_date]` on `[chain]`.

Context:

- Run artifact root: `[run_artifact_root]`.
- PT artifact directory: `[run_artifact_root]/pt-markets/[pt_scope_slug]`, for example `[run_artifact_root]/pt-markets/ethereum-pt-susdat-2026-08-27-abc12345`.
- Underlying token report: `[underlying_report_path]`.
- Underlying technical report: `[underlying_technical_report_path]`.
- PT scope:
  - underlying symbol: `[symbol]`
  - underlying token address: `[token_address]`
  - chain_id: `[chain_id]`
  - target maturity: `[maturity_date]`
  - user days label: `[days_label]`
  - known market address, if any: `[market_address_or_null]`
  - known PT address, if any: `[pt_address_or_null]`

How to do it:

1. Resolve identity before math:
   - exact Pendle market address;
   - PT, SY, and YT addresses;
   - maturity timestamp/date;
   - accounting asset / asset redeemed at maturity;
   - output asset and any wrapper/unwrapper route.
2. Source priority:
   - Pendle app/API/SDK or market page;
   - block explorer contract/token pages;
   - official protocol docs;
   - local underlying token report for inherited risk only.
3. Market snapshot:
   - PT price;
   - accounting asset price;
   - implied APY shown by Pendle, if available;
   - liquidity/depth/route evidence;
   - timestamp/access date.
4. Compute and show formulas:
   - `gross_roi = accounting_asset_price / pt_price - 1`;
   - `days_to_maturity = maturity_date - snapshot_date`;
   - `simple_apr = gross_roi * 365 / days_to_maturity`;
   - `compound_apy = (1 + gross_roi) ** (365 / days_to_maturity) - 1`;
   - `break_even_accounting_asset_drawdown = gross_roi / (1 + gross_roi)` or the equivalent stated formula tied to PT price and maturity value;
   - include exit/slippage cost separately when available.
5. Separate PT-holder economics from variable/points economics:
   - PT base return is fixed discount-to-maturity;
   - YT/points/yield assumptions are not PT-holder base ROI unless the scoped position explicitly includes YT or a separate points route.
6. Write:
   - `[run_artifact_root]/pt-markets/[pt_scope_slug]/scope.json`
   - `[run_artifact_root]/pt-markets/[pt_scope_slug]/analyst-report.md`
   - `[run_artifact_root]/pt-markets/[pt_scope_slug]/technical-report.md`
   - `[run_artifact_root]/pt-markets/[pt_scope_slug]/verification.md`
7. Return compressed handoff only:
   - artifact paths;
   - market/PT/SY/YT addresses;
   - maturity;
   - PT price;
   - accounting asset price;
   - implied APY;
   - liquidity;
   - break-even drawdown;
   - blockers.

## S4 prompt — X/social mining

Goal:

Collect X/social evidence for `[scope_name]` covering points, yield, PT return, depeg/stress, redemption, queue, liquidity, and risk narratives.

Context:

- Run artifact root: `[run_artifact_root]`.
- Underlying report: `[underlying_report_path]`.
- PT report, if applicable: `[pt_report_path]`.
- Output: `[run_artifact_root]/x-research/x-research-[scope-slug].md`.
- Use Hermes `x_search` first when available.
- X access is read-only. Do not post, like, follow, DM, or perform account actions.

How to do it:

1. Start with a query log. For each query, record query text, date/window, result count or note if unavailable, and why the query was used.
2. Run these query angles:
   - exact ticker and contract/market label;
   - issuer/project names and common aliases;
   - points, airdrop, season, epoch, allocation, multiplier, campaign names;
   - STAC/STRC/yield terms when relevant;
   - PT implied APY, fixed yield, maturity, Pendle market label when PT scoped;
   - risk terms: depeg, redemption, freeze, blacklist, queue, withdrawal, liquidity, insolvency, exploit, criticism, stress;
   - discovered key handles and quote-retweets/replies if they drive a claim.
3. For every useful claim, classify it as:
   - return mechanic;
   - risk/stress narrative;
   - issuer/protocol announcement;
   - user anecdote/speculation;
   - contradiction or correction.
4. For every material claim include handle, post date, URL/status ID, and confidence. If the URL/status ID is missing, mark the claim line `citation_degraded`.
5. Separate social speculation from local/source-artifact facts. Do not let social claims override a primary source without saying why.
6. Write sections:
   - Scope.
   - Executive read.
   - Query log.
   - Distinct return models.
   - Distinct risk narratives.
   - Source index.
   - Signal vs noise.
   - Open threads.
7. Return compressed handoff only:
   - artifact path;
   - return models;
   - risk narratives;
   - points mechanics;
   - source count;
   - degraded-citation count;
   - validation status.

## S5 prompt — X/social synthesis

Goal:

Synthesize all X/social artifacts into one cross-scope social expectations overlay.

Context:

- Run artifact root: `[run_artifact_root]`.
- Input artifacts:
  - `[x_artifact_1]`
  - `[x_artifact_2]`
  - `[x_artifact_3]`
  - `[x_artifact_4]`
- Output: `[run_artifact_root]/x-research/index.md`.
- Verification: `[run_artifact_root]/verification/final-x-research-points-yield-verification.md`.

How to do it:

1. Build a claim table from all X artifacts:
   - claim;
   - source artifact;
   - source URL/status ID or `citation_degraded`;
   - claim type;
   - whether it supports, weakens, or contradicts another claim.
2. Synthesize return models, not raw X posts:
   - organic yield;
   - points/airdrop value;
   - PT fixed discount;
   - leverage/farming multiplier;
   - queue/redemption timing assumptions.
3. Synthesize risk narratives:
   - issuer/redemption/freeze/control risk;
   - depeg/discount/liquidity risk;
   - crowded farming/leverage/unwind risk;
   - PT maturity/accounting risk;
   - stale or citation-degraded claims.
4. Identify contradictions and likely disagreement sources, e.g. old campaign terms vs current campaign terms, PT-holder economics vs YT/points economics, issuer statements vs user anecdotes.
5. Validate that all scoped artifacts are represented and no extra token/maturity is introduced.
6. Return compressed handoff:
   - synthesis path;
   - main return narratives;
   - main risk narratives;
   - contradictions;
   - verification result.

## S6 prompt — Quantitative underwriting

Goal:

Build a decision-grade investment analyst report from token reports, PT reports when applicable, and social synthesis.

Context:

- Run artifact root: `[run_artifact_root]`.
- Token directories: `[token_artifact_dirs]`.
- PT market directories, only if PTs are in scope: `[pt_artifact_dirs]`.
- Methodology output: `[run_artifact_root]/investment-analysis/quantitative-underwriting-methodology.md`.
- Report output: `[run_artifact_root]/investment-analysis/investment-analyst-report-points-pt-risk-return.md`.
- Index output: `[run_artifact_root]/investment-analysis/index.md`.
- Input token reports:
  - `[token_report_paths]`
- Input PT reports, if applicable:
  - `[pt_report_paths]`
- Input social synthesis:
  - `[x_synthesis_path]`
- Position size: `[position_size]`.
- Base hurdle: `[base_hurdle]`.
- Opportunistic hurdle: `[opportunistic_hurdle]`.

How to do it:

1. Create `[run_artifact_root]/investment-analysis/`.
2. Write the methodology first. It must define formulas before results:
   - direct-token organic ROI;
   - points EV/ROI/APR;
   - PT gross ROI/APR/APY, only for PT scoped assets;
   - underwriting risk haircut / expected-loss scenarios;
   - exit/slippage cost;
   - risk-adjusted ROI and annualized return;
   - break-even points ROI or break-even PT price where applicable.
3. For direct/non-PT tokens, compute comparable fields for every row:
   - organic ROI over horizon;
   - estimated/fresh-farming points ROI, or `0` with `no_confirmed_points_program`;
   - underwriting risk haircut or expected-loss low/base/high band;
   - exit cost;
   - risk-adjusted ROI;
   - risk-adjusted annualized return;
   - live inputs required before automation.
4. For PT tokens/markets, compute fixed-return economics separately:
   - PT price;
   - maturity value/accounting asset price;
   - gross ROI;
   - simple APR and compound APY;
   - expected-loss/underwriting haircut;
   - exit cost;
   - risk-adjusted ROI and annualized return;
   - do not count underlying token points/yield as PT-holder base ROI unless the scoped strategy explicitly includes it.
5. Points/fresh-farming thesis must be quantitative when visible:
   - named program/allocation;
   - remaining season days;
   - route multiplier;
   - eligible TVL or denominator scenario grid;
   - FDV/airdrop-value scenario grid;
   - cost stack and haircut;
   - break-even sensitivity.
6. Produce decision statuses with assumption triggers:
   - `analysis_candidate`;
   - `manual_underwriting_only`;
   - `needs_fresh_quant_and_live_inputs`;
   - `do_not_underwrite_current_snapshot`;
   - `blocked_until_live_inputs_resolved` for automation where needed.
7. Write the report with:
   - executive table;
   - formula/method references;
   - per-asset risk-adjusted stack;
   - point/return scenario grid;
   - live-input blockers;
   - import notes for MCP `summary.asset_risk_v1.json` / `research.md`.
8. Write `[run_artifact_root]/investment-analysis/index.md` as a short navigational index linking methodology, report, token reports, PT reports if any, social synthesis, and verification.
9. Return compressed handoff:
   - report paths;
   - top conclusions;
   - risk-adjusted returns;
   - points break-evens;
   - live-input blockers;
   - validation result.

## S7 prompt — Final verification

Goal:

Verify the completed workflow artifact set.

Context:

- Run artifact root: `[run_artifact_root]`.
- Workflow manifest: `docs/asset-investment-diligence/workflow.json`.
- Stage contracts: `docs/asset-investment-diligence/stage-contracts.md`.

How to do it:

1. Verify all declared outputs exist for the run scope:
   - run-level `README.md`, `run-manifest.json`, and `index.md`;
   - token folders under `[run_artifact_root]/tokens/<token-slug>/`;
   - PT folders under `[run_artifact_root]/pt-markets/<pt-scope-slug>/` only when PTs are scoped;
   - X/social outputs under `[run_artifact_root]/x-research/`;
   - quantitative outputs under `[run_artifact_root]/investment-analysis/`;
   - final verification under `[run_artifact_root]/verification/`.
2. Check cross-links resolve relative to `[run_artifact_root]`. Do not require repo-root `investment-analysis/`, `x-research/`, `tokens/`, or `pt-markets/` directories.
3. Check required quantitative fields exist:
   - direct-token organic ROI, points ROI or explicit zero, risk haircut/expected-loss band, exit cost, risk-adjusted ROI;
   - PT fixed-return fields only when PTs are scoped;
   - live-input blockers.
4. Check citation-degraded social claims are marked.
5. Check no extra tokens, maturities, or markets were introduced.
6. Run repo validation from `/Users/ilya/ai-assistant/projects/front-asset-intel-mcp`:
   - workflow JSON/file check from `docs/asset-investment-diligence/runbook.md`;
   - `npm test` if imported data under `data/assets/` changed.
7. If committing through the monorepo, run from `/Users/ilya/ai-assistant`:
   - `python3 scripts/workspace_sync.py --check`
   - `python3 scripts/workspace_policy_check.py --all`
8. Write `[run_artifact_root]/verification/final-investment-analysis-verification.md` with:
   - pass/fail;
   - files checked;
   - commands run;
   - blockers or unrelated pre-existing failures.
9. Return final compressed handoff:
   - pass/fail;
   - files checked;
   - commands run;
   - blockers or unrelated pre-existing failures.
