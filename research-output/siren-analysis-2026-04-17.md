# SIREN research snapshot

As of 2026-04-17 08:34:49 UTC.

## 1. Project identification

- Name: SIREN
- Chain: BNB Chain
- Contract: `0x997a58129890bbda032231a52ed1ddc845fc18e1`
- Official site: https://sirenai.me/
- DEX pair used for live tape: https://dexscreener.com/bsc/0xb2af49dbf526054faf19602860a5e298a79f3d05
- CoinGecko page: https://www.coingecko.com/en/coins/siren-2
- GeckoTerminal token page: https://www.geckoterminal.com/bsc/tokens/0x997a58129890bbda032231a52ed1ddc845fc18e1
- GoPlus security: https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=0x997a58129890bbda032231a52ed1ddc845fc18e1

Official site branding pulled from the live bundle identifies the project as "Siren Sisters" / "Smart Crypto Assistant" under `SIREN LABS PTE. LTD.`. CoinGecko categorizes it under BNB Chain Ecosystem, Meme, Binance Alpha Spotlight, and Four.meme Ecosystem.

## 2. Market / fundamental summary

- CoinGecko at 08:34 UTC: price `$1.46`, market cap `$1.065B`, 24h volume `$146.6M`, rank `#70`, +`76.18%` in 24h, +`106.24%` in 7d.
- Deepest live DEX pool at 08:34 UTC: price about `$1.30`, liquidity about `$12.89M`, 24h volume about `$19.79M`, `25,771` buys vs `15,259` sells, but price still down `33.48%` over the last hour and `26.99%` over 6h.
- ATH on CoinGecko was `$3.61` on 2026-03-22, so current pricing is still about `60%+` below peak.

Interpretation:

- SIREN is still a narrative-first BNB AI/meme trade, not a fundamentals-first protocol token.
- Venue dispersion is material: CoinGecko spot was `$1.46` while the deepest Pancake pool was about `$1.30` at the same timestamp. That usually signals fragmented liquidity and should be treated as execution risk.
- Public footprint is thin for a `$1B+` asset: official site, dapp, X, and Telegram exist, but CoinGecko does not list a whitepaper or GitHub repo.

## 3. On-chain findings

Sources used:

- Raw BNB RPC calls via `https://bsc-rpc.publicnode.com`
- GoPlus token-security API

Verified token / supply state:

- ERC-20 total supply on-chain: `1,000,000,000 SIREN`
- Dead address balance: `272,725,694.958 SIREN` or `27.27%` of max supply
- CoinGecko circulating / total shown to market: about `727.27M`, which lines up with max supply minus the dead allocation
- Main Pancake V3 WBNB pool holds about `6,418,089.034 SIREN`, only `0.64%` of max supply and about `0.88%` of CoinGecko circulating supply

Holder / contract risk:

- Holder count: `46,876`
- LP holder count: `58`
- Top 10 holders control about `50.14%` of max supply, but that includes the dead wallet at `27.27%`
- Ex-dead, the next 9 holders still control about `22.87%`
- Ex-dead, the next 5 holders control about `18.11%`
- Security posture is cleaner than many meme names: `0` buy tax, `0` sell tax, `0` transfer tax, open source, no proxy, owner is zero address, no hidden owner, no blacklist flag, no honeypot flag

Live pool-flow read from raw Pancake V3 swap logs on the main WBNB pool:

- Last 30 minutes: about `653,951.452 SIREN` into the pool vs `299,643.552 SIREN` out, net `354,307.899 SIREN` into the pool
- Last 5 minutes: about `80,277.952 SIREN` into the pool vs `31,886.977 SIREN` out, net `48,390.975 SIREN` into the pool

Interpretation:

- Despite the still-positive 24h change, the main pool tape was net sell-pressure during the live check.
- Liquidity is not deep relative to the headline market cap, so concentrated wallets can move price faster than the market-cap headline suggests.

## 4. Risks / invalidation

Main risks:

- Price-source dispersion: CoinGecko vs deepest DEX pool was roughly a `12%` gap during this check.
- Concentration risk: even excluding the dead wallet, live large holders still control a meaningful share.
- Momentum unwind risk: DEX price was still falling hard intraday while raw pool flow stayed net into the pool.
- Thin fundamentals: public evidence supports a strong narrative / distribution machine, but not much hard product or developer depth.

What would invalidate the cautious / bearish near-term read:

- DEX price stabilizes and reclaims the `$1.45+` area on real liquidity
- Main Pancake pool flow flips from net SIREN into the pool to net SIREN out of the pool
- Holder concentration diffuses instead of tightening during the next leg up

## 5. Files created or updated

- Created: `/home/qwen/deep-research-coin/research-output/siren-analysis-2026-04-17.md`
