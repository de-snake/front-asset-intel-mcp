# USDat technical report

Status: review_required

## Scope and inputs

- Token identity: USDat collateral candidate on Ethereum mainnet.
- Token address: `0x23238f20b894f29041f48d88ee91131c395aaa71`.
- Borrow asset: USDC.
- Borrow rate assumption: 9%.
- Supplied LTV/LT context: 0.90.
- Missing input decision effect: no position size, target leverage, hold horizon, wallet eligibility, user HF floor, or Credit Manager was supplied.

## Source-grounded token facts

| Fact slot | State | Evidence | Decision effect |
| --- | --- | --- | --- |
| Token identity | found | `name()=USDat`, `symbol()=USDat`, address above | Scope resolved |
| Decimals | found | `decimals()=6` | Needed for oracle and route math |
| Total supply | found | 133,279,638.354298 USDat | Scale context only |
| Implementation proxy status | found | EIP-1967 implementation `0x17cac25c6d6bbcb592837fea083a5c8eb4d1e52e`, admin `0xcf1072da5f0d127aef99136489bad08bfa3d1a7d` | Upgrade/admin branch remains live |
| Issuer protocol entity | found | Saturn docs and public site | Issuer-controlled branch applies |
| Backing NAV model | found | Saturn docs: 1:1 peg, M0 tokenized treasury backing at launch | Reserve and redemption integrity matter |
| Transfer restrictions | found | Saturn docs: onboarded addresses required; token exposes `isFrozen(address)` | Eligibility blocks automation |
| Mint redeem access | input_missing | No wallet/KYC state supplied | Blocks Preview/Execute |
| Admin control surface | found | `isFrozen(address)`, `paused()`, proxy admin | Human-in-loop issuer-control checks needed |
| Liquidity depth | found but size-dependent | Curve pool and DexScreener snapshots | Position-size route check still missing |
| Oracle accounting method | found | Gearbox Curve TWAP feed over USDat/USDC with bounded USDC/USD quote | Market-derived feed reduces constant-peg overvaluation risk |
| Audits incidents | source_inconclusive | Saturn audit docs listed; no incident sweep completed | Review input before production approval |
| Missing fields decision effect | found | Missing inputs listed above | Proposal cannot advance to Preview |

## Controls and restrictions

USDat is issuer-controlled collateral. The relevant controls are permissioned onboarding, per-address freeze state, pause state, proxy upgrade/admin control, and redemption access. A zero-address probe returning `isFrozen=false` is not evidence that a Gearbox Credit Account, liquidator, or recipient route is eligible.

## Liquidity and oracle surface

The main observed public exit venue is the Curve USDat/USDC pool with about $15.7M displayed liquidity and about 7.82M USDC / 7.88M USDat direct balances. The Gearbox feed reads USDat through a Curve TWAP and a bounded USDC/USD child feed, with latest answer 0.99965317 USD on 2026-06-06 08:00:47 UTC.

## Missing fields and decision effect

- Credit Manager / market: input_missing; blocks allowed-token and collateral-parameter conclusion.
- Position size: input_missing; blocks exit slippage, liquidation depth, and route capacity.
- Wallet eligibility / KYC / freeze state: input_missing; blocks automation.
- User risk policy / HF floor: input_missing; blocks Preview/Execute.

## Technical appendix

- `research/onchain-admin.md`
- `research/issuer-backing-security.md`
- `research/transfer-liquidity-oracle-governance.md`
- `research/dexscreener-usdat-20260606.json`
- `research/defillama-prices-usdat-susdat-20260606.json`
