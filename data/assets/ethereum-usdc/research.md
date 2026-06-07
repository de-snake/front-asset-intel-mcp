# USDC — Ethereum asset research snapshot

- Asset: USD Coin (USDC)
- Issuer: Circle
- Chain/address: Ethereum `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- MCP purpose: make canonical USDC resolve as a known high-quality stablecoin instead of returning `not found`.
- Snapshot date: 2026-06-07

## Bottom line

USDC should be treated as a top-tier stablecoin in this static MCP surface. It is Circle-issued, 1:1 redeemable for eligible users, backed by highly liquid cash and cash-equivalent reserve assets, and has deep market liquidity. The peg has been stress-tested: during the March 2023 Silicon Valley Bank shock USDC traded below $1, then recovered when redemption processing resumed and reserve confidence normalized.

The static decision is not “execute blindly.” The right table treatment is: known/high-quality stablecoin, live route preview required. Automation still needs a current venue quote for the intended size, holder/redemption eligibility if direct Circle redemption matters, and policy acceptance of Circle issuer controls.

## Identity

Circle’s official contract-address documentation lists Ethereum USDC at `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`. Etherscan identifies the verified Ethereum token contract as Circle USDC / USD Coin.

Aliases captured in this MCP package include `USDC`, `usdc`, `USD Coin`, `Circle USDC`, the slug `ethereum-usdc`, the raw token address, and the chain-prefixed address.

## Backing and reserve transparency

Circle’s USDC page describes USDC as redeemable 1:1 for US dollars and backed by highly liquid cash and cash-equivalent assets. Circle’s transparency page publishes current reserve data. In the fetched 2026-06-07 snapshot, the transparency page showed the USDC tab as of 2026-06-04 with approximately $75.5B in circulation and $75.7B total reserves, with reserves categorized across bank deposits, overnight reverse Treasury repo, and sub-3-month Treasuries.

This is enough to score backing/NAV evidence as strong for a static analyst-agent known-asset surface. It is not the same as a live independent reconciliation at execution time, so agents should still prefer live reserve/market checks for unusually large or policy-sensitive flows.

## Redemption and holder eligibility

Circle describes USDC as 1:1 redeemable for US dollars. Direct mint/redeem access is not universal to every token holder: Circle Mint / Circle account redemption is an eligible-user route, and Circle terms describe redemption conditions for those users. Ordinary DeFi holders generally rely on secondary-market exit unless they are eligible Circle customers.

For this reason, the summary scores redemption as restricted-but-understood rather than fully open holder-accessible redemption. This should not block recognizing USDC; it only means execution automation should know whether it is relying on secondary liquidity or direct Circle redemption.

## Liquidity and peg behavior

USDC has very deep exchange and DeFi liquidity and normally trades tightly around $1. The important adverse historical test is the March 2023 SVB episode. Federal Reserve FEDS Notes describe USDC’s low point occurring when primary markets/redemptions were constrained and its recovery toward peg when Circle resumed redemption processing.

That stress history is a positive/negative mix for underwriting: it proves bank/deposit exposure can matter, but it also gives a real-world recovery case rather than an untested peg thesis.

## Issuer controls

USDC is not a permissionless no-admin asset. Circle’s public materials and the Ethereum contract architecture reflect an issuer-operated stablecoin with compliance/admin controls, including upgradeable contract architecture and known freeze/blacklist-style control surfaces. Those controls are expected for a regulated stablecoin, but they remain a protocol automation risk.

The MCP summary therefore keeps issuer controls as the main weak dimension even while treating USDC as a top-tier stablecoin overall.

## Return context

Vanilla USDC has no native organic yield and no confirmed points program. The direct-token return estimate is intentionally near zero:

- Organic ROI over 83 days: 0.00%
- Points ROI over 83 days: 0.00%
- Base peg/control/issuer stress prior: 0.05%
- Exit-cost assumption: 0.02%
- Base risk-adjusted ROI: -0.07%

This return line is not saying USDC is economically bad; it says vanilla USDC is a cash/stablecoin leg, not a yield leg. Yield or points should be modeled only for a specific wrapper, venue, lending route, or campaign.

## Static MCP conclusion

Use USDC as a known, high-quality stablecoin candidate. Do not expose `not found` for USDC. Before automated Preview/Execute, fetch the live route quote/slippage for the intended size and confirm the user’s policy accepts Circle redemption eligibility and issuer-control constraints.

## Sources

- Circle USDC page: https://www.circle.com/usdc
- Circle transparency page: https://www.circle.com/transparency
- Circle USDC terms: https://www.circle.com/legal/usdc-terms
- Circle USDC contract addresses: https://developers.circle.com/stablecoins/usdc-contract-addresses
- Circle MiCA USDC white paper: https://www.circle.com/legal/mica-usdc-whitepaper
- Etherscan Ethereum USDC: https://etherscan.io/address/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
- Federal Reserve FEDS Notes on SVB/stablecoin stress: https://www.federalreserve.gov/econres/notes/feds-notes/in-the-shadow-of-bank-run-lessons-from-the-silicon-valley-bank-failure-and-its-impact-on-stablecoins-20251217.html
