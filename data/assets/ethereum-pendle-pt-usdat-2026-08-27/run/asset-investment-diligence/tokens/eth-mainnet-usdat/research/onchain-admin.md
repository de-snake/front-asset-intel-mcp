# USDat onchain admin

Status: review_required

## Token identity

- Symbol: USDat.
- Token address: `0x23238f20b894f29041f48d88ee91131c395aaa71`.
- Chain: Ethereum mainnet.
- Decimals: 6.
- Total supply observed by `cast call totalSupply()`: `133279638354298`, or 133,279,638.354298 USDat.
- Source pointer: live `cast` probes run on 2026-06-06 against `https://ethereum-rpc.publicnode.com`.

## Implementation proxy status

- EIP-1967 implementation slot: `0x17cac25c6d6bbcb592837fea083a5c8eb4d1e52e`.
- EIP-1967 admin slot: `0xcf1072da5f0d127aef99136489bad08bfa3d1a7d`.
- Decision effect: upgrade/admin control is a live issuer-control branch; any Gearbox automation needs issuer state and admin-change monitoring.

## Admin control surface

- `isFrozen(address)` exists and returned `false` for the zero-address probe.
- `paused()` exists and returned `false`.
- `mToken()` returned `0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b`.
- `isBlacklisted(address)`, `owner()`, `admin()`, and `wards(address)` probes did not resolve through the tested signatures.
- Decision effect: the existence of `isFrozen(address)` and `paused()` is enough to keep USDat in the issuer-controlled collateral branch. Wallet-specific freeze and eligibility state remains unknown.

## Audits incidents

- Saturn docs list public audit artifacts under Transparency and Audits.
- No incident search was completed in this harness run; state=not_investigated for incident history beyond the cited docs.
- Decision effect: incident history is not a pass condition here, but it remains a review input before production collateral approval.
