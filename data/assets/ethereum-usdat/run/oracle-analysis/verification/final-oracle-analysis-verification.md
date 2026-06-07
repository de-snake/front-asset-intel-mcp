# Final oracle analysis verification

Status: review_required

## Required file checks

- Required root files checked: README.md, run-manifest.json, index.md, verification/final-oracle-analysis-verification.md.
- Required per-scope files checked for USDat and sUSDat: scope.json, oracle/scope.md, oracle/feed-graph.md, oracle/node-classification.md, oracle/source-primitive-audit.md, oracle/stress-tradeoff-analysis.md, oracle/protocol-fit-memo.md, raw/feed-probes.json, raw/source-evidence/, verification/oracle-analysis-verification.md.

## Formula and source checks

- Pricing formula present in feed-graph.md and node-classification.md for both scopes.
- Source primitive audit includes source identity, source type, timestamp, cadence, trust, methodology, and raw evidence pointer.
- Node classification includes market, NAV, hardcoded, and hybrid taxonomy coverage where applicable.
- Stress analysis includes liquidity-cascade and liquidity-trap branches.
- Side-specific verdict matrix includes position_side, token_role, stress_direction, and loss_bearer.

## Gearbox adapter checks

Every Gearbox adapter fact is present in each protocol-fit memo with explicit state. Non-pass facts are propagated as review_required blockers: market_or_credit_manager, route_availability, allowed_token_status, exit_health_factor, PFS/update-authority source_inconclusive items, and position-size-dependent route checks.

## Cross-link checks

Local link / cross-link paths were checked by inspection for index, scope files, raw evidence pointers, protocol memos, and verification artifacts. Cross-link resolution status: checked.

## Workspace validation

Workspace validation command to run after final edits: `git diff --check`. Exit status will be recorded by the parent validation step. Current oracle artifact status remains review_required because Preview/Execute gates are unresolved.
