# sUSDat transfer liquidity oracle governance

Status: review_required

## Liquidity depth

- DexScreener snapshot saved at `dexscreener-susdat-20260606.json`.
- Main displayed venue: Curve sUSDat/USDC pool `0x6206cA315c2fCDd2A857b47EFB285AA12c529a7a`.
- Displayed liquidity in that snapshot: about $1.8M; 24h volume about $1.46M.
- Direct Curve pool balances: coin0 USDC `296,560.846211`; coin1 sUSDat `1,619,368.656036887211267757`; virtual price about `0.971637522163633718`.
- Decision effect: observed secondary liquidity is materially shallower than USDat and below what would support a large liquidation without explicit route sizing.

## Oracle accounting method

- Supplied Gearbox feed: `0xe5d7ce380349f0380d8A216A75BCd1070C0ed5b1`.
- Live feed type: `PRICE_FEED::ERC4626`.
- Latest answer: `95272729` with 8 decimals, or 0.95272729 USD.
- Child feed: USDat Gearbox Curve TWAP feed `0x54DF8bAa0F35B767fFd2124c1D4F13788251E312`.
- Exchange-rate probe: `getLPExchangeRate()` returned `953119`, matching about 0.953119 USDat per 1 sUSDat.
- Decision effect: the feed recursively accounts for sUSDat's USDat exposure, but it is accounting/NAV-derived and must be reconciled with secondary-market discounts and queue execution.

## Transfer restrictions

- sUSDat exposes blacklist and pause surfaces.
- Redemption is not instant ordinary ERC-20 exit; docs describe a withdrawal queue and secondary market alternative.
- Decision effect: issuer, queue, and route state must be checked for every proposed position size.

## Governance and feed update surface

- Gearbox docs require 8-decimal normalized feeds and price sanity checks.
- Exact feed-update authority for this sUSDat feed was not resolved in this run.
- State: source_inconclusive.
- Decision effect: feed bound/update authority remains a review gate.
