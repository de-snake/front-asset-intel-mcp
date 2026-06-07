# Parallelization and context-control plan

This workflow is designed so the parent agent coordinates the run while subagents do bounded work. The goal is to avoid shared context bloat and preserve reasoning quality.

## Parent-agent responsibilities

The parent agent owns:

- user scope and constraints;
- workflow stage graph;
- subagent task spawning;
- artifact path registry;
- final cross-candidate reasoning;
- validation and user-facing summary.

The parent agent should not own:

- raw explorer dumps;
- raw X results;
- full contract source;
- full research logs;
- per-token evidence expansion unless auditing a disputed field.

## Subagent responsibilities

A subagent owns one bounded stage unit:

- one token for S1;
- one token report for S2;
- one PT market for S3;
- one token/PT social lane for S4.

Subagents write artifacts to disk. They return a compressed handoff, not full notes.

## Parallelizable stages

### S1 — General asset mining

Parallel unit: one token.

Safe to parallelize because:

- token evidence collection is independent;
- each token writes to a separate `tokens/<token-slug>/` directory with its own `research/`, technical report, analyst report, and verification files;
- cross-token comparison is not allowed in S1.

Suggested concurrency:

- 2–3 subagents for normal runs;
- 4 subagents only if API/rate-limit pressure is low.

Parent handoff into each subagent:

- token address, chain, symbol, intended use;
- methodology path;
- output directory;
- required file list.

Parent return expected:

- artifact paths;
- five strongest numeric facts;
- top risks;
- blocking unknowns;
- validation status.

### S2 — Asset-risk analyst reports

Parallel unit: one token.

Safe to parallelize because:

- each token report is a single-candidate memo;
- no ranking or comparison is allowed;
- all cross-candidate reasoning is deferred to S6.

Dependency:

- S1 for that token must be complete.

Suggested concurrency:

- 2–3 subagents.

### S3 — PT market/economics analysis

Parallel unit: one PT market.

Safe to parallelize because:

- each PT market has independent Pendle market identity;
- each PT report writes to separate report, technical-report, and verification files;
- shared Pendle docs can be cited by all agents without parent context expansion.

Dependency:

- S2 underlying token report should exist before PT analysis.

Suggested concurrency:

- 2–3 subagents.

### S4 — X/social mining

Parallel unit: one token/PT social scope.

Safe to parallelize because:

- each X search lane is independent;
- raw social results are the largest context-bloat risk, so they should stay inside subagents;
- parent only needs return models, risk narratives, points mechanics, and artifact path.

Dependency:

- S2 report exists.
- S3 PT report exists if social scope includes a PT.

Suggested concurrency:

- up to 3 subagents, matching the current Hermes delegated batch limit.

Important:

- S4 subagents must not call X write actions.
- S4 subagents must mark degraded citations instead of forcing unsupported certainty.

## Serial stages

### S5 — X/social synthesis

Must run serial after S4.

Reason:

- it reasons across all social artifacts;
- it identifies contradictions, common narratives, and source-quality boundaries;
- parallel synthesis would duplicate cross-scope reasoning and create conflicting summaries.

Context-control rule:

- read each S4 artifact's executive read, return models, risk narratives, and source index;
- do not paste all X source details into the synthesis artifact.

### S6 — Quantitative underwriting

Must run serial after token/PT/social inputs exist.

Reason:

- expected-loss priors and points scenarios must be consistent across candidates;
- risk-adjusted returns are comparative;
- decision statuses depend on common hurdle rates and position-size assumptions.

Context-control rule:

- use S2/S3/S5 summary fields and direct numeric fields;
- only read full upstream reports when a number, risk prior, or source claim needs audit.

### S7 — Final verification

Must run serial after all writes.

Reason:

- verification observes the final artifact set;
- workspace and cross-link checks require stable files.

## Delegation map

Use delegated workers for:

- S1 token mining.
- S2 token report generation.
- S3 PT market reports.
- S4 X/social mining.

Avoid delegated workers for:

- S5 synthesis if the parent already has the scope registry.
- S6 quantitative underwriting, unless the subagent is given all final stage summaries and returns a draft that parent verifies.
- S7 final verification.

## Context budget rules

For subagent prompts:

- Include scope and output contract.
- Include only the immediate predecessor artifact paths.
- Include validation requirements.
- Do not include full prior-stage content unless the subagent cannot read local files.

For parent synthesis:

- Read indexes first.
- Read executive sections before technical appendices.
- Read source maps only when validating claims.
- Keep raw data out of parent context.

## Handoff compression standards

A valid handoff contains:

- artifact path;
- status;
- key numbers;
- top risks;
- blockers;
- validation result.

A poor handoff contains:

- raw search results;
- raw ABI/source dumps;
- long copied sections from reports;
- unsupported labels like `healthy`, `risky`, or `good yield` without numbers.

## Failure and recovery

If a subagent crashes:

1. Inspect the task scope and output paths.
2. Check whether partial artifacts were written.
3. Recover manually or respawn the same bounded task.
4. Run the stage validator before marking complete.
5. Add a recovery note to the board or verification artifact.

If a stage blocks on missing data:

- mark the missing input and decision effect;
- do not silently replace it with a qualitative label;
- continue downstream only if the methodology allows a conservative expected-loss haircut.

If downstream reasoning disagrees with upstream evidence:

- parent expands the specific source artifact;
- parent audits the number or source claim;
- parent patches the upstream artifact if it is wrong;
- parent reruns affected validation.
