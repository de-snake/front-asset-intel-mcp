# sUSDat source primitive audit

Status: review_required

## Primitive audit

| Source identity | Source type | Timestamp | Cadence | Trust | Methodology | Raw evidence pointer |
| --- | --- | --- | --- | --- | --- | --- |
| Gearbox sUSDat feed `0xe5d7...ed5b1` | ERC4626 / hybrid | 2026-06-06 08:00:47 UTC | stalenessPeriod 0 reported on top wrapper | Gearbox feed wrapper | Multiplies sUSDat share exchange rate by child USDat/USD feed | raw/source-evidence/feed-probe-summary.md |
| sUSDat vault/token `0xd166...2df7` | NAV/accounting | 2026-06-06 probe | ERC-4626 live accounting | Saturn vault contract | `asset()=USDat`, `convertToAssets(1e18)=953119` | raw/source-evidence/feed-probe-summary.md |
| USDat child feed `0x54DF...E312` | Curve TWAP / hybrid | 2026-06-06 08:00:47 UTC | child quote has bounded staleness | Gearbox feed wrapper | USDat/USDC Curve TWAP times bounded USDC/USD | raw/source-evidence/feed-probe-summary.md |
| Secondary Curve pool `0x6206...9a7a` | market | 2026-06-06 probe | pool state, no oracle heartbeat | Curve pool contract | Exit route evidence; about 296,560 USDC and 1.62M sUSDat in direct balances | raw/source-evidence/feed-probe-summary.md |

## Evidence quality

The primitive path is sufficient for Analyze-stage feed-shape classification. It is not sufficient for Preview because route capacity, queue state, Credit Manager binding, and wallet eligibility are unresolved.
