# sUSDat technical report

Status: review_required

## Scope and inputs

- Token identity: sUSDat collateral candidate on Ethereum mainnet.
- Token address: `0xd166337499e176bbc38a1fbd113ab144e5bd2df7`.
- Borrow asset: USDC.
- Borrow rate assumption: 9%.
- Supplied LTV/LT context: 0.86.
- Missing input decision effect: no position size, target leverage, hold horizon, wallet eligibility, user HF floor, or Credit Manager was supplied.

## Source-grounded token facts

| Fact slot | State | Evidence | Decision effect |
| --- | --- | --- | --- |
| Token identity | found | `name()=Staked USDat`, `symbol()=sUSDat`, address above | Scope resolved |
| Decimals | found | `decimals()=18` | Needed for share math |
| Implementation proxy status | found | EIP-1967 implementation `0x2005e0ca201a37694125ff267ae57872bea0a0ce`, admin slot zero | Governance semantics remain source_inconclusive |
| Issuer protocol entity | found | Saturn docs | Issuer-controlled branch applies |
| Backing NAV model | found | ERC-4626 vault over USDat with STRC/digital-credit exposure | NAV and queue risk are central |
| Transfer restrictions | found | `isBlacklisted(address)`, `paused()`, withdrawal queue docs | Wallet and route eligibility required |
| Mint redeem access | input_missing | Queue status and wallet eligibility not supplied | Blocks Preview/Execute |
| Admin control surface | found | blacklist/pause probes, ERC-4626 methods | Human review required |
| Liquidity depth | found but size-dependent | Curve and DexScreener snapshots | Position-size route check still missing |
| Oracle accounting method | found | Gearbox ERC4626 feed over USDat feed | Accounting value may differ from immediate market exit value |
| Audits incidents | source_inconclusive | Audit docs listed; incident sweep not complete | Review input |
| Missing fields decision effect | found | Missing inputs listed above | Proposal cannot advance to Preview |

## Controls and restrictions

sUSDat is an issuer-managed ERC-4626 vault share with blacklist/pause surfaces and a queue-based redemption process. The queue process can be incompatible with forced liquidation timing unless the strategy relies on proven secondary-market depth.

## Liquidity and oracle surface

The main observed public venue is the Curve sUSDat/USDC pool with about $1.8M displayed liquidity and about 296,560 USDC against 1.62M sUSDat. The Gearbox feed values sUSDat by ERC-4626 exchange rate multiplied by the USDat feed, with latest answer 0.95272729 USD on 2026-06-06 08:00:47 UTC.

## Missing fields and decision effect

- Credit Manager / market: input_missing; blocks allowed-token and collateral-parameter conclusion.
- Position size: input_missing; blocks exit slippage, liquidation depth, and route capacity.
- Wallet eligibility / KYC / blacklist state: input_missing; blocks automation.
- Queue state and hold horizon: input_missing; blocks redemption and risk/return assessment.
- User risk policy / HF floor: input_missing; blocks Preview/Execute.

## Technical appendix

- `research/onchain-admin.md`
- `research/issuer-backing-security.md`
- `research/transfer-liquidity-oracle-governance.md`
- `research/dexscreener-susdat-20260606.json`
- `research/defillama-prices-usdat-susdat-20260606.json`
