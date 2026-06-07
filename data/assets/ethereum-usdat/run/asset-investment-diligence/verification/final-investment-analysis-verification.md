# Final investment analysis verification

Status: review_required

## Required file checks

- Required root file checks: README.md, run-manifest.json, index.md, investment-analysis files, and final verification are present.
- Per-token file checks: scope.json, technical-report.md, analyst-report.md, verification.md, and research files are present for USDat and sUSDat.
- Manifest paths checked: run-manifest.json declares token folders and canonical final index / final verification paths.

## Required field checks

- S1 required fact slots checked for both tokens.
- S2 required analyst sections checked for both tokens.
- S6 quantitative fields checked, including Gross ROI, Simple annualized return, Compound annualized return, Points EV, Points ROI, Points annualized return, Expected loss, Exit cost, Risk-adjusted ROI, Risk-adjusted annualized return, Break-even points ROI, Break-even terminal drawdown, and Price-stability certainty score.

## Skipped stages

- S3_pt_market_economics skipped because no PT markets were supplied.
- S4_x_social_mining and S5_x_social_synthesis skipped because no social scopes were supplied.

## Cross-link checks

Local link / cross-link paths were checked by inspection for token reports, research files, investment-analysis files, and index references. Cross-link resolution status: checked.

## Workspace validation

Workspace validation command to run after final edits: `git diff --check`. Exit status will be recorded by the parent validation step. Current artifact status remains review_required because missing inputs block Preview/Execute.
