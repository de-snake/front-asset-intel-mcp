# sUSDat onchain admin

Status: review_required

## Token identity

- Symbol: sUSDat.
- Token address: `0xd166337499e176bbc38a1fbd113ab144e5bd2df7`.
- Chain: Ethereum mainnet.
- Name: Staked USDat.
- Decimals: 18.
- Total supply observed by `cast call totalSupply()`: `100143196908619173009455062`, or about 100,143,196.908619173009455062 sUSDat.

## Implementation proxy status

- EIP-1967 implementation slot: `0x2005e0ca201a37694125ff267ae57872bea0a0ce`.
- EIP-1967 admin slot: zero.
- Decision effect: implementation status was found, but full upgrade/governance semantics were not resolved from verified source in this run.

## Admin control surface

- `asset()` returned USDat `0x23238f20b894f29041f48D88eE91131C395Aaa71`.
- `totalAssets()` returned `95448414265218`, or 95,448,414.265218 USDat.
- `convertToAssets(1e18)` returned `953119`, or about 0.953119 USDat for 1 sUSDat.
- `isBlacklisted(address)` exists and returned `false` for the zero-address probe.
- `paused()` exists and returned `false`.
- `maxDeposit(address)` and `maxMint(address)` returned max uint for zero-address probe; `maxWithdraw(address)` and `maxRedeem(address)` returned zero for zero-address probe.
- Decision effect: ERC-4626 accounting is live, but withdrawal ability is wallet/queue dependent and cannot be generalized.

## Audits incidents

- Saturn docs list audit artifacts.
- No broad incident search was completed in this harness run; state=not_investigated outside cited source set.
- Decision effect: review remains required before production collateral approval.
