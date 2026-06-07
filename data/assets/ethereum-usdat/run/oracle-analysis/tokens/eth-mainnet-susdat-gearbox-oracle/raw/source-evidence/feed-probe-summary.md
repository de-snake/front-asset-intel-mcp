# sUSDat feed probe source evidence

Status: review_required

- Source identity: Gearbox feed `0xe5d7ce380349f0380d8A216A75BCd1070C0ed5b1`, child USDat feed `0x54DF8bAa0F35B767fFd2124c1D4F13788251E312`, sUSDat vault/token `0xd166337499e176bbc38a1fbd113ab144e5bd2df7`.
- Source type: ERC4626 NAV/accounting primitive multiplied by child USDat market primitive.
- Timestamp: feed updatedAt 2026-06-06 08:00:47 UTC.
- Cadence: top ERC4626 feed stalenessPeriod 0 in probe; child USDat quote relies on the bounded USDC feed's 87,300 second staleness.
- Trust: vault accounting plus Gearbox USDat feed plus Curve/Chainlink child primitives.
- Methodology: sUSDat share exchange rate times USDat/USD feed, normalized to 8 decimals.
- Raw evidence pointer: raw/feed-probes.json.
