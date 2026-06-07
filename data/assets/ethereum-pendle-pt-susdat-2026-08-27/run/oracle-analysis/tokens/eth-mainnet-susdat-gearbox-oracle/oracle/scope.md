# Oracle scope - sUSDat Gearbox feed

Status: review_required

## Scope

- Asset: sUSDat.
- Token: `0xd166337499e176bbc38a1fbd113ab144e5bd2df7`.
- Protocol: Gearbox.
- Chain: Ethereum mainnet.
- Market or Credit Manager: state=input_missing from user input.
- Feed address: `0xe5d7ce380349f0380d8A216A75BCd1070C0ed5b1`.
- Position side: Credit Account borrower / leverage farmer; side matrix also covers pool LP, liquidator, and curator/operator.
- Token role: collateral.
- Position size: state=input_missing.

## Acceptance policy

The feed can support Analyze-stage reasoning only. Preview/Execute remains blocked until Credit Manager, allowed-token status, position size, route quote, wallet eligibility, queue state, and user risk policy are supplied.
