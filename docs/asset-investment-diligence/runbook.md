# Runbook — asset investment diligence workflow

This runbook tells an agent how to execute `workflow.json` without loading all evidence into the parent context.

## 0. Start here

Workflow directory:

`docs/asset-investment-diligence`

Run artifact root:

`[run_artifact_root]`

Example run artifact root:

`research-runs/asset-risk-example`

Read in this order:

1. `README.md`.
2. `workflow.json`.
3. `stage-contracts.md`.
4. `parallelization-and-context.md`.
5. `subagent-prompts.md`.
6. `output-structure.md`.

Do not start by reading every report under the run artifact root. Those directories are stage outputs, not parent-agent context.

Every run returns one folder at `run_artifact_root`. Every analyzed token gets a `tokens/<token-slug>/` subfolder, and every PT market gets a `pt-markets/<pt-scope-slug>/` subfolder.

## 1. Define the run scope

Create a scope object before spawning workers:

```json
{
  "run_id": "asset-risk-diligence-YYYY-MM-DD",
  "run_artifact_root": "research-runs/<run-slug>",
  "position_size_usd": 1000000,
  "base_net_apr_hurdle": 0.10,
  "opportunistic_net_apr_hurdle": 0.20,
  "tokens": [
    {
      "scope_id": "eth-mainnet-apxusd",
      "chain_id": 1,
      "chain": "Ethereum mainnet",
      "symbol": "apxUSD",
      "token_address": "<address>",
      "intended_use": "spot / collateral / PT underlying / points exposure"
    }
  ],
  "pt_markets": [
    {
      "scope_id": "pendle-pt-eth-mainnet-apxusd-2026-11-05",
      "underlying_scope_id": "eth-mainnet-apxusd",
      "target_maturity": "2026-11-05",
      "chain_id": 1
    }
  ],
  "social_scopes": [
    {
      "scope_id": "apxusd-points-stac-pt-2026-11-05",
      "token_scope_id": "eth-mainnet-apxusd",
      "pt_scope_id": "pendle-pt-eth-mainnet-apxusd-2026-11-05",
      "programs": ["APYx Pips"]
    }
  ]
}
```

If a field is unknown, keep the field and set it to `null`. Do not delete unknown fields. Downstream stages must know what is missing.

Before S1, assign deterministic artifact directories and create/update `run-manifest.json` and `index.md` at the run root:

- token: `tokens/<chain>-<symbol>-<address-prefix>`;
- PT market: `pt-markets/<chain>-pt-<underlying-symbol>-<maturity>-<market-prefix>`.

## 2. Stage execution order

### 2.1 General token evidence

Run S1 for each token.

Parallelization:

- Spawn one subagent per token.
- Batch at most three subagents at once.
- Use the S1 prompt from `subagent-prompts.md`.

Parent receives:

- artifact paths;
- five strongest numeric facts;
- top risks;
- blocking unknowns;
- validation status.

Parent action after S1:

- Record paths in a run registry.
- Do not read full raw research unless validation fails.

### 2.2 Token analyst reports

Run S2 for each token after that token's S1 completes.

Parallelization:

- Spawn one subagent per token report.
- Batch at most three subagents at once.
- Use the S2 prompt from `subagent-prompts.md`.

Parent action after S2:

- Read only each report's executive view and source map.
- Record missing live inputs.
- Do not rank tokens yet.

### 2.3 PT market and economics reports

Run S3 for each PT market if PTs are in scope.

Parallelization:

- Spawn one subagent per PT market.
- Batch at most three subagents at once.
- Use the S3 prompt from `subagent-prompts.md`.

Parent action after S3:

- Record PT price, accounting asset price, maturity, liquidity, gross ROI/APR, and break-even drawdown.
- Update or verify `pt-markets/index.md` under the run artifact root.
- Do not treat PT APY as final return; expected loss and points are applied in S6.

### 2.4 X/social mining

Run S4 if points, social yield, depeg narratives, or market sentiment are in scope.

Parallelization:

- Spawn one subagent per social scope.
- Batch at most three subagents at once.
- Use the S4 prompt from `subagent-prompts.md`.

Parent action after S4:

- Record return models, points mechanics, risk narratives, source count, and degraded-citation count.
- Do not ingest raw X result lists.

### 2.5 X/social synthesis

Run S5 once after all S4 artifacts exist.

Serial execution:

- Parent can run this directly, or delegate once if the artifact list is complete.
- Use the S5 prompt from `subagent-prompts.md`.

Parent action after S5:

- Read `x-research/index.md` under the run artifact root as the social handoff to underwriting.
- Note contradictions and citation degradation.

### 2.6 Quantitative underwriting

Run S6 once after token, PT, and social inputs are available.

Serial execution:

- Parent should run this directly when possible.
- Use the S6 prompt if delegating a draft.

Required inputs:

- all token analyst reports;
- all PT reports, if PTs are in scope;
- X synthesis, if social evidence is in scope;
- position size;
- base and opportunistic hurdle rates.

Required outputs under the run artifact root:

- `<run_artifact_root>/investment-analysis/quantitative-underwriting-methodology.md`;
- `<run_artifact_root>/investment-analysis/investment-analyst-report-points-pt-risk-return.md`;
- `<run_artifact_root>/investment-analysis/index.md`.

Parent action after S6:

- Verify formulas and numbers.
- Read the decision summary, assumptions, risk-adjusted stack, sensitivity map, and live-input blockers.

### 2.7 Final verification

Run S7 after all output files exist.

Serial execution:

- Parent should run verification directly.

Required checks:

- `workflow.json` parses.
- `output-structure.md` exists and per-token / per-PT folders match it.
- Every stage has id, title, role, dependencies, parallelization, inputs, outputs, and validation fields.
- Links from `README.md` resolve.
- If validating the included example, artifacts mapped in `examples/asset-risk-reports-mvp-current-run-map.md` exist under `research-runs/asset-risk-example`.
- Investment-analysis reports contain quantitative fields.
- Terminology checks pass for workflow docs.
- Workspace validation passes:
  - `python3 scripts/workspace_sync.py --check`
  - `python3 scripts/workspace_policy_check.py --all`

Write under the run artifact root:

- `verification/final-investment-analysis-verification.md`.

## 3. Parent run registry

During execution, keep a small registry in memory or a temporary JSON file:

```json
{
  "S1_general_asset_mining": {
    "eth-mainnet-apxusd": {
      "status": "pass",
      "artifact_dir": "tokens/ethereum-apxusd-1234abcd",
      "artifacts": ["tokens/ethereum-apxusd-1234abcd/research/onchain-admin.md"]
    }
  },
  "S2_asset_risk_analyst_report": {},
  "S3_pt_market_economics": {},
  "S4_x_social_mining": {},
  "S5_x_social_synthesis": {},
  "S6_quantitative_underwriting": {},
  "S7_final_verification": {}
}
```

The registry lets the parent evaluate completeness without reading every artifact.

## 4. Validation commands

From this project root `/Users/ilya/ai-assistant/projects/front-asset-intel-mcp`:

```bash
python3 - <<'PY'
import json
from pathlib import Path
workflow = Path('docs/asset-investment-diligence')
manifest = json.loads((workflow / 'workflow.json').read_text())
required_stage_keys = {'id', 'title', 'role', 'depends_on', 'parallelization', 'inputs', 'outputs', 'validation'}
for stage in manifest['stages']:
    missing = required_stage_keys - set(stage)
    assert not missing, (stage.get('id'), missing)
files = [
    workflow / 'README.md',
    workflow / 'RUN-RESEARCH.md',
    workflow / 'workflow.json',
    workflow / 'stage-contracts.md',
    workflow / 'parallelization-and-context.md',
    workflow / 'subagent-prompts.md',
    workflow / 'runbook.md',
    workflow / 'output-structure.md',
    workflow / 'examples/asset-risk-reports-mvp-current-run-map.md',
]
missing = [str(p) for p in files if not p.exists()]
assert not missing, missing
print('ASSET_INVESTMENT_DILIGENCE_WORKFLOW_FILE_CHECK_PASS')
PY

npm test
```

From monorepo root `/Users/ilya/ai-assistant`, also run workspace validation when committing this project through the workspace:

```bash
python3 scripts/workspace_sync.py --check
python3 scripts/workspace_policy_check.py --all
```

## 5. Completion standard

A run is complete only when:

- all required stage outputs exist under the run artifact root;
- serial synthesis and underwriting outputs exist;
- validation commands pass or unrelated failures are isolated;
- the final user summary includes exact files created, commands run, and unresolved live-input blockers.

If a stage was skipped, the final summary must state why it was skipped.
