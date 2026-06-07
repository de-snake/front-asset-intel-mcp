# USDat source primitive audit

Status: review_required

## Primitive audit

| Source identity | Source type | Timestamp | Cadence | Trust | Methodology | Raw evidence pointer |
| --- | --- | --- | --- | --- | --- | --- |
| Gearbox USDat feed `0x54DF...E312` | Curve TWAP / hybrid | 2026-06-06 08:00:47 UTC | stalenessPeriod 0 reported on top wrapper | Gearbox feed wrapper | Reads USDat/USDC Curve market leg and child quote feed | raw/source-evidence/feed-probe-summary.md |
| Curve pool `0xF4d0...96d7` | market | 2026-06-06 probe | pool state, no oracle heartbeat | Curve pool contract | USDat/USDC market primitive | raw/source-evidence/feed-probe-summary.md |
| Bounded USDC feed `0x8Ad4...6949` | hybrid | 2026-06-06 08:00:47 UTC | stalenessPeriod 87,300 seconds | Gearbox bounded wrapper | Bounds Chainlink USDC/USD at 1.04 | raw/source-evidence/feed-probe-summary.md |
| Chainlink USDC/USD `0x8fFf...18f6` | market | 2026-06-06 08:00:47 UTC | External feed cadence plus Gearbox bound staleness | Chainlink / AggregatorV3 | USDC/USD quote answer 0.99965695 | raw/source-evidence/feed-probe-summary.md |

## Evidence quality

The primitive path is sufficient for Analyze-stage feed-shape classification. It is not sufficient for Preview because PFS update status, Credit Manager binding, and size-specific route/liquidation capacity are unresolved.
