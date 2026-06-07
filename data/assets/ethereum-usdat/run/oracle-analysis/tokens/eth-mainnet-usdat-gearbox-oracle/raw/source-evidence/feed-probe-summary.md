# USDat feed probe source evidence

Status: review_required

- Source identity: Gearbox feed `0x54DF8bAa0F35B767fFd2124c1D4F13788251E312`, child bounded USDC feed `0x8Ad48f5269A9e8C21F677bc81CCE503E55196949`, Chainlink USDC/USD `0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6`, Curve pool `0xF4d0CF32908b2C7f1021339c43Df0F77f06896d7`.
- Source type: Curve TWAP market primitive plus bounded Chainlink quote primitive.
- Timestamp: feed updatedAt 2026-06-06 08:00:47 UTC.
- Cadence: child bounded feed stalenessPeriod 87,300 seconds; top Curve TWAP feed stalenessPeriod 0 in probe.
- Trust: Gearbox feed wrappers plus Chainlink USDC/USD plus Curve pool state.
- Methodology: USDat/USDC Curve TWAP multiplied by bounded USDC/USD quote, normalized to 8 decimals.
- Raw evidence pointer: raw/feed-probes.json.
