# Run index — USDat / sUSDat Analyze → Propose

Status: `review_required`

## Scope

Primary scope: `usdat-susdat-collateral-20260606`.

Question: Should USDat or sUSDat be treated as acceptable Gearbox Credit Account collateral candidates on Ethereum mainnet when borrowing USDC at a 9% borrow-rate assumption?

Input hash: `c7bbc03e59800311ca808043d085a1f0074a898914c4eb37c884db476c10776d`.

## Review entry points

Start with the package-level `RESULT.md`, then use these supporting files if more detail is needed:

- [combined Analyze → Propose return](agentic-flow/analyze-and-propose.md)
- [asset final verification](asset-investment-diligence/verification/final-investment-analysis-verification.md)
- [oracle final verification](oracle-analysis/verification/final-oracle-analysis-verification.md)
- [USDat analyst report](asset-investment-diligence/tokens/eth-mainnet-usdat/analyst-report.md)
- [sUSDat analyst report](asset-investment-diligence/tokens/eth-mainnet-susdat/analyst-report.md)

## Generated roots

- Parent run: this folder.
- Asset child: `asset-investment-diligence/`.
- Oracle child: `oracle-analysis/`.

## Recommendation

USDat is the stronger Analyze-stage candidate; sUSDat is higher risk because the ERC-4626 accounting value and immediate market exit value can diverge. Neither asset is ready for Preview or Execute.

## Blocking unknowns

- `eth-mainnet-usdat-gearbox-oracle.market_or_credit_manager`
- `eth-mainnet-susdat-gearbox-oracle.market_or_credit_manager`
- `run.position_size`
- `run.target_leverage`
- `run.hold_horizon`
- `run.user_risk_policy`
- wallet / Credit Account / liquidator eligibility
- size-specific route / liquidation quote
