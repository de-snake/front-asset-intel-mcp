# Asset investment diligence agent workflow

This folder turns the current asset-risk diligence process into an executable agent workflow.

The purpose is to let a future agent run the process without loading every raw artifact into the parent context. Each stage has a bounded input contract, a bounded output contract, and explicit parallelization rules.

## What this workflow does

It transforms a token / PT opportunity scope into a decision-grade investment analyst report.

The pipeline separates evidence collection from reasoning:

1. General asset mining.
2. Asset-risk analyst report.
3. PT market/economics analysis, when PTs are in scope.
4. X/social mining for points, risk, return, and stress narratives.
5. X/social synthesis.
6. Quantitative underwriting and decision memo.

## Local use in this repo

Start with [`RUN-RESEARCH.md`](RUN-RESEARCH.md) for the short operating guide. The rest of this folder is the copied workflow contract used to create new precomputed research packages before importing them into `data/assets/<asset-slug>/`.

## Files

- `RUN-RESEARCH.md` — short guide for running new-token research for this MCP repo.
- `workflow.json` — machine-readable stage graph, dependencies, parallelization, subagent policy, and output paths.
- `stage-contracts.md` — exact input/output contract for every stage.
- `parallelization-and-context.md` — what the parent agent can parallelize, what must stay serial, and how to avoid context bloat.
- `subagent-prompts.md` — paste-ready prompts for delegated workers.
- `runbook.md` — execution order and validation sequence.
- `output-structure.md` — canonical run folder layout with per-token and per-PT subfolders.
- `examples/asset-risk-reports-mvp-current-run-map.md` — maps the current asset-risk reports MVP artifacts to the workflow stages.

## Core execution rule

The parent agent should not ingest all raw evidence.

Use this pattern:

- Parent owns the scope, stage graph, and final decision.
- Subagents own bounded research or report tasks.
- Subagents write artifacts to disk and return only:
  - artifact path;
  - verdict;
  - key numbers;
  - blockers;
  - validation result.
- Parent reads indexes and final memos first, then selectively expands source artifacts only when a number or conclusion needs audit.

## When to run each stage

- Spot token only: run stages 1, 2, and 6.
- Spot token with points/social upside: run stages 1, 2, 4, 5, and 6.
- PT opportunity without points: run stages 1, 2, 3, and 6.
- PT opportunity with points/social upside: run all stages.
- Evidence pack only: stop after stages 1–3 and validation.

## Expected final outputs

A complete investment-decision run should end with:

- one returned `<run_artifact_root>/` folder;
- `run-manifest.json` and `index.md` at the run root;
- one subfolder per analyzed token under `tokens/<token-slug>/`;
- one subfolder per analyzed PT market under `pt-markets/<pt-scope-slug>/`;
- token evidence, technical report, analyst report, and verification inside each token folder;
- PT technical report, analyst report, and verification inside each PT folder, if PTs are in scope;
- social evidence reports under `x-research/`, if points/social are in scope;
- social synthesis under `x-research/index.md`, if points/social are in scope;
- quantitative methodology and investment analyst report under `investment-analysis/`;
- final verification under `verification/final-investment-analysis-verification.md`.

The user-facing answer should return the run folder path, final index path, token folders, PT folders, and final verification path.

## Included example status

The included example map records a completed six-stage run for:

- apyUSD / PT-apyUSD 27 Aug 2026;
- apxUSD / PT-apxUSD 05 Nov 2026;
- USDat / PT-USDat 27 Aug 2026;
- sUSDat / PT-sUSDat 27 Aug 2026.

See `examples/asset-risk-reports-mvp-current-run-map.md` for artifact mapping.
