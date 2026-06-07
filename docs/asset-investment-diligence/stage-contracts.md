# Stage contracts — asset investment diligence workflow

This file defines the agent handoff interface for every stage. A future agent should treat these contracts as mandatory.

## Shared envelope

Every stage artifact should support this summary envelope in the parent-agent response.

All stage output paths in this file are relative to the chosen run artifact root, for example `research-runs/<run-slug>/`. The reusable workflow copy in this repo lives at `docs/asset-investment-diligence/`.

Every run must follow `output-structure.md`: one returned `<run_artifact_root>/` folder, one `tokens/<token-slug>/` subfolder per analyzed token, one `pt-markets/<pt-scope-slug>/` subfolder per analyzed PT market, and run-level `run-manifest.json`, `index.md`, and `verification/final-investment-analysis-verification.md`.

```json
{
  "stage_id": "S1_general_asset_mining",
  "scope_id": "eth-mainnet-apxusd",
  "status": "pass | review_required | blocked",
  "artifact_paths": ["tokens/ethereum-susdat-d1663374/analyst-report.md"],
  "key_numbers": [
    {"name": "liquidity", "value": "USD 38,260,000", "source": "..."}
  ],
  "top_risks": [
    {"risk": "primary redemption eligibility", "evidence": "...", "decision_effect": "review_required"}
  ],
  "blocking_unknowns": ["..."],
  "validation": {
    "result": "pass | fail",
    "checks": ["..."]
  }
}
```

The parent should read this envelope before reading the full artifact.

## S1 — General asset mining

Role: collect evidence for one token.

Input contract:

- `chain_id`.
- `chain_name`.
- `token_address`.
- `symbol`.
- `intended_use`.
- Optional: position context, target protocol, holder address, size.

Allowed raw data:

- Verified contract source and proxy state.
- RPC reads and explorer state.
- Issuer docs, terms, risk pages, dashboards, audits.
- Market/liquidity data providers.
- Governance, timelock, and Safe state.

Output contract:

- `<token_artifact_dir>/scope.json`.
- `<token_artifact_dir>/research/onchain-admin.md`.
- `<token_artifact_dir>/research/issuer-backing-security.md`.
- `<token_artifact_dir>/research/transfer-liquidity-oracle-governance.md`.
- `<token_artifact_dir>/technical-report.md`.

Required facts:

- Token identity, decimals, implementation/proxy status.
- Issuer/protocol entity.
- Backing/NAV model.
- Transfer restrictions.
- Mint/redeem access.
- Freeze/blacklist/pause/forced-transfer/admin controls.
- Liquidity venues and current depth.
- Oracle/accounting method.
- Audits/incidents.
- Missing fields and decision effect.

Compression rule:

- Do not return raw contract dumps to the parent.
- Return only artifact path, five strongest numbers, top risks, and blockers.

## S2 — Asset-risk analyst report

Role: convert S1 evidence into an investment analyst memo for one token.

Input contract:

- Token scope.
- S1 technical report path.
- S1 research file paths.
- Requirements brief.

Output contract:

- `<token_artifact_dir>/analyst-report.md`.
- `<token_artifact_dir>/verification.md`.

Required report sections:

- Executive view.
- What the token represents.
- Main risk implications.
- Backing and NAV quality.
- Liquidity and exit risk.
- Controls, governance, and legal restrictions.
- Pricing/oracle risk in plain language.
- What must be checked before live use.
- Evidence quality.
- Source map.
- Technical appendix pointer.

Compression rule:

- The report is a single-token memo.
- It should not compare tokens except where required to explain a mechanism.
- Cross-token ranking belongs to S6.

## S3 — PT market/economics analysis

Role: analyze one Pendle PT market as a separate fixed-maturity instrument.

Input contract:

- `chain_id`.
- Underlying token symbol/address.
- Target maturity date.
- User-supplied days-to-maturity label, if provided.
- Underlying S2 report path.

Output contract:

- `<pt_artifact_dir>/scope.json`.
- `<pt_artifact_dir>/analyst-report.md`.
- `<pt_artifact_dir>/technical-report.md`.
- `<pt_artifact_dir>/verification.md`.
- Update `pt-markets/index.md` after all PTs finish.

Required facts:

- Exact market address.
- PT token address.
- SY token address.
- YT token address.
- Maturity timestamp.
- Accounting asset and output asset.
- PT price.
- Accounting asset price.
- Computed discount to accounting asset.
- Implied APY.
- Liquidity snapshot.
- PT-specific maturity, liquidity, valuation, and oracle risks.
- Inherited underlying-token risks separated from PT-specific risks.

Required calculations:

- `Gross ROI = accounting_asset_price / PT_price - 1`.
- `Simple APR = Gross ROI × 365 / days_to_maturity`.
- `Compound APY = (1 + Gross ROI)^(365 / days_to_maturity) - 1`.
- `Break-even accounting-asset drawdown = 1 - PT_price / accounting_asset_price`.

Compression rule:

- Parent should receive only the key market IDs, price fields, calculated return fields, liquidity, and blockers.
- Full PT reasoning stays in the artifact.

## S4 — X/social mining

Role: collect social evidence for one token/PT scope.

Input contract:

- Token/PT scope.
- Underlying S2 report path.
- PT S3 report path, if PT exists.
- Time window.
- Query angles.

Required query angles:

- Exact ticker and PT label.
- Issuer/project variants.
- Points/airdrop/program names.
- Yield and STAC/STRC variants.
- PT implied APY / fixed yield / maturity.
- Risk/depeg/redemption/freeze/liquidity/queue/stress.
- Recent date-bounded search.
- Key discovered handles.

Output contract:

- `x-research/x-research-<scope>.md`.

Required sections:

- Scope.
- Executive read.
- Query log.
- Distinct return models.
- Distinct risk narratives.
- Source index.
- Signal vs noise.
- Open threads.

Citation rule:

- Each material social claim must have handle, date or search-window date, and URL/status ID.
- If not available, mark `citation_degraded` at the claim level.

Safety rule:

- X tools are read-only in this workflow.
- No X posts, likes, follows, DMs, or account actions.

Compression rule:

- Parent should not receive raw X result lists.
- Parent receives only return models, risk narratives, points mechanics, source count, degraded-citation count, and artifact path.

## S5 — X/social synthesis

Role: synthesize all S4 reports into cross-scope social expectations.

Input contract:

- All S4 artifact paths.
- Scope list.

Output contract:

- `x-research/index.md`.
- `verification/final-x-research-points-yield-verification.md`.

Required synthesis fields:

- Cross-issuer summary.
- Return-estimate models.
- Points / airdrop uncertainty.
- STAC/STRC/yield uncertainty.
- Issuer/redemption/freeze/control risk.
- PT liquidity/maturity/accounting risk.
- Crowded farming/leverage/unwind risk.
- Signal vs noise.
- Citation degradation.
- Contradictions and controversies.
- Open follow-up threads.

Compression rule:

- This is the social handoff to underwriting.
- It should not include raw post dumps.

## S6 — Quantitative underwriting

Role: convert evidence into decision variables.

Input contract:

- All S2 token analyst reports.
- All S3 PT reports, if PTs are in scope.
- S5 social synthesis, if points/social are in scope.
- Position size.
- Horizon.
- Net annualized hurdle.
- Optional: mandate constraints and risk appetite.

Output contract:

- `<run_artifact_root>/investment-analysis/quantitative-underwriting-methodology.md`.
- `<run_artifact_root>/investment-analysis/investment-analyst-report-points-pt-risk-return.md`.
- `<run_artifact_root>/investment-analysis/index.md`.

Required calculations:

- Gross ROI.
- Simple annualized return.
- Compound annualized return, when relevant.
- Points EV.
- Points ROI.
- Points annualized return.
- Expected loss.
- Exit cost.
- Risk-adjusted ROI.
- Risk-adjusted annualized return.
- Break-even points ROI.
- Break-even terminal drawdown.
- Price-stability certainty score.

Required outputs:

- Decision summary.
- Base assumptions.
- Gross return stack.
- Risk-adjusted return stack.
- Points valuation.
- Price-stability certainty by token.
- Token-by-token investment view.
- Sensitivity map.
- Required live inputs before capital allocation.
- Source map.
- Stale-data markers.

Decision statuses:

- Underwrite.
- Underwrite only with points upside.
- Reject on risk-adjusted basis.
- Cannot underwrite.

Compression rule:

- S6 is the first stage allowed to compare candidates.
- It should cite paths rather than paste full upstream content.

## S7 — Final verification

Role: verify full run before completion.

Input contract:

- All declared output paths.
- Workflow manifest.
- Workspace validation commands.

Output contract:

- `verification/final-investment-analysis-verification.md`.

Required checks:

- Required files exist.
- Per-token and per-PT folders follow `output-structure.md`.
- Cross-links resolve.
- Required sections present.
- Quantitative fields present.
- No source artifact gives unsupported allocation conclusions.
- Workspace validation passes or unrelated failures are isolated.

Parent completion rule:

- The parent should report only after S7 passes or explicitly names unresolved blockers.
