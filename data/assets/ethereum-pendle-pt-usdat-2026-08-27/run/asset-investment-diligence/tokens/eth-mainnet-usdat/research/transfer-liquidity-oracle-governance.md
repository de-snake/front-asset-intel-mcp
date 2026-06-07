# USDat transfer liquidity oracle governance

Status: review_required

## Liquidity depth

- DexScreener snapshot saved at `dexscreener-usdat-20260606.json`.
- Main displayed venue: Curve USDat/USDC pool `0xF4d0CF32908b2C7f1021339c43Df0F77f06896d7`.
- Displayed liquidity in that snapshot: about $15.7M; 24h volume about $2.16M.
- Direct Curve pool balances: coin0 USDC `7,822,418.142613`; coin1 USDat `7,884,155.725500`; virtual price about `1.001490689399622626`.
- Decision effect: public venue depth exists, but the run has no position size. Route and liquidation depth remain input_missing for Preview.

## Oracle accounting method

- Supplied Gearbox feed: `0x54DF8bAa0F35B767fFd2124c1D4F13788251E312`.
- Live feed type: `PRICE_FEED::CURVE_TWAP`.
- Latest answer: `99965317` with 8 decimals, or 0.99965317 USD.
- Feed path: USDat Curve TWAP over the USDat/USDC Curve pool, quoted through a bounded USDC/USD feed.
- Decision effect: the oracle is market-derived rather than a hardcoded 1.00 peg, which protects LPs better than a constant in a real depeg, but thin/stressed liquidity can still create liquidation-route risk.

## Transfer restrictions

- Transfer restriction branch is active because USDat is documented as permissioned and the token exposes freeze/pause controls.
- Decision effect: allowed liquidation recipients, Credit Account holding eligibility, and downstream transferability must be checked before automation.

## Governance and feed update surface

- Gearbox docs state that PFS token/feed availability is controlled through Instance Owner operations and that effective price feeds are normalized to 8 decimals.
- Feed update authority for this exact feed was not resolved in this run.
- State: source_inconclusive for exact feed-update authority.
- Decision effect: feed replacement or bound changes remain human-review inputs.
