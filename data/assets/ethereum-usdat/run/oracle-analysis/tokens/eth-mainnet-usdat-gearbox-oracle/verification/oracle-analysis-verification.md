# USDat oracle analysis verification

Status: review_required

- Scope checked: feed address, chain, token role, position side, and missing market/position inputs.
- Recursive graph checked: Curve TWAP market leg plus bounded Chainlink USDC/USD child.
- Source primitive audit checked: source identity, source type, timestamp, cadence, trust, methodology, and raw evidence pointer.
- Side-specific verdict matrix checked: position_side, token_role, stress_direction, and loss_bearer are present.
- Gearbox adapter facts checked: every required fact is present with an explicit state.
- Decision status: review_required because Credit Manager, allowed-token status, route size, wallet eligibility, and user risk policy remain unresolved.
