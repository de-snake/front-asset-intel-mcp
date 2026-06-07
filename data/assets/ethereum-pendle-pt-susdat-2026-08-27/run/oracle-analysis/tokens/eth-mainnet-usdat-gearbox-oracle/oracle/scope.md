# Oracle scope - USDat Gearbox feed

Status: review_required

## Scope

- Asset: USDat.
- Token: `0x23238f20b894f29041f48d88ee91131c395aaa71`.
- Protocol: Gearbox.
- Chain: Ethereum mainnet.
- Market or Credit Manager: state=input_missing from user input.
- Feed address: `0x54DF8bAa0F35B767fFd2124c1D4F13788251E312`.
- Position side: Credit Account borrower / leverage farmer; side matrix also covers pool LP, liquidator, and curator/operator.
- Token role: collateral.
- Position size: state=input_missing.

## Acceptance policy

The feed can support Analyze-stage reasoning only. Preview/Execute remains blocked until Credit Manager, allowed-token status, position size, route quote, wallet eligibility, and user risk policy are supplied.
