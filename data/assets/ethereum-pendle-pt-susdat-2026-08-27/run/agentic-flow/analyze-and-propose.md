# Combined Analyze → Propose return — USDat / sUSDat

This is the parent workflow return in human-readable form. The machine-readable contract used by the validator is stored beside it as [`analyze-and-propose.json`](analyze-and-propose.json).

## Stage status

- Discover: complete by user premise
- Analyze: complete
- Propose: request_more_inputs
- Preview: blocked
- Execute: blocked
- Monitor: not_started

## Status block

Formal validation status: `pass`.

Semantic review status: `not_run`.

Workflow decision status: `review_required`.

Proposal gate: `request_more_inputs`.

Explanation: the child validators pass, but the workflow is not decision-grade because live position, market, route, wallet, and user-policy inputs are still missing. Passing validation means the artifacts are structurally complete, not that USDat or sUSDat is approved for Preview or Execute.

## Human result

USDat is the stronger Analyze-stage candidate because the supplied Gearbox oracle path reaches a Curve USDat/USDC market primitive and observed liquidity is materially deeper.

sUSDat is the more conditional candidate because the supplied feed values an ERC-4626 share over USDat while immediate liquidation may depend on thinner secondary liquidity, queue processing, and issuer / STRC realization.

Neither candidate is ready for Preview or Execute from the supplied inputs.

## Analyze artifacts

Readable artifacts:

- [USDat analyst report](../asset-investment-diligence/tokens/eth-mainnet-usdat/analyst-report.md)
- [USDat technical report](../asset-investment-diligence/tokens/eth-mainnet-usdat/technical-report.md)
- [USDat feed graph](../oracle-analysis/tokens/eth-mainnet-usdat-gearbox-oracle/oracle/feed-graph.md)
- [USDat protocol-fit memo](../oracle-analysis/tokens/eth-mainnet-usdat-gearbox-oracle/oracle/protocol-fit-memo.md)
- [sUSDat analyst report](../asset-investment-diligence/tokens/eth-mainnet-susdat/analyst-report.md)
- [sUSDat technical report](../asset-investment-diligence/tokens/eth-mainnet-susdat/technical-report.md)
- [sUSDat feed graph](../oracle-analysis/tokens/eth-mainnet-susdat-gearbox-oracle/oracle/feed-graph.md)
- [sUSDat protocol-fit memo](../oracle-analysis/tokens/eth-mainnet-susdat-gearbox-oracle/oracle/protocol-fit-memo.md)
- [asset final verification](../asset-investment-diligence/verification/final-investment-analysis-verification.md)
- [oracle final verification](../oracle-analysis/verification/final-oracle-analysis-verification.md)

## Requested inputs before Preview

- Evaluated Gearbox market / Credit Manager / pool for USDat.
- Evaluated Gearbox market / Credit Manager / pool for sUSDat.
- Position size or scenario size range.
- Target leverage or scenario leverage.
- Intended hold horizon.
- User risk policy: HF floor, max drawdown, automation policy.
- Wallet / Credit Account / liquidator eligibility for holding, transfer, redemption, freeze, and blacklist state.
- Size-specific route or liquidation quote for the proposed unwind path.

## Gate contract

Owner: human reviewer / market operator.

Source: live Gearbox market configuration, wallet / Credit Account state, issuer eligibility state, and executable route quotes.

Method: rerun Analyze with the missing inputs, then only proceed to Preview if the proposal contains position-size-specific risk/return, HF, oracle, route, and eligibility checks.

Acceptance criteria: USDat or sUSDat may move past `request_more_inputs` only when the live inputs above are supplied and the run no longer depends on generic liquidity or eligibility assumptions.
