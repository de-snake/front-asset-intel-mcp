# Oracle analysis child root

Status: review_required

## What was analyzed

Analyzed the supplied Gearbox Ethereum mainnet feeds for USDat and sUSDat collateral. USDat feed is a Curve TWAP path over USDat/USDC with bounded USDC/USD quote. sUSDat feed is an ERC-4626 path over the USDat feed.

## Manifest

Manifest: `run-manifest.json`.

## Scope folders

- USDat oracle scope: `tokens/eth-mainnet-usdat-gearbox-oracle`
- sUSDat oracle scope: `tokens/eth-mainnet-susdat-gearbox-oracle`

## Files to read first

Read `index.md`, then each scope `oracle/protocol-fit-memo.md`, then `verification/final-oracle-analysis-verification.md`.

## Final validation status

Final validation status: review_required. The child run is Analyze-stage only and preserves missing inputs as blockers.
