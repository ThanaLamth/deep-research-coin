# RaveDAO (RAVE) - Lookonchain + Arkham Style Application

**Date:** April 21, 2026  
**Purpose:** Apply the combined `Lookonchain + Arkham` checklist to the current RAVE case and identify what inputs are already sufficient versus what inputs are still missing.

---

## 1. Trigger / Event

### What happened?

RAVE had a highly unusual progression:

- early listing-window routing activity in **December 2025**
- broader access / liquidity improvement by **February 2026**
- a major squeeze / collapse cycle in **April 2026**

### Why does the market care?

Because the token appears to sit at the intersection of:

- thin or fragile float
- high concentration
- aggressive wallet routing
- derivatives sensitivity
- narrative-driven volatility

### Current assessment

This is a valid event-driven case for the checklist because the price move is large enough and structurally odd enough to justify wallet-level and entity-level review.

### Input status

- `Event quality`: **Enough**
- `Timestamp quality`: **Enough**
- `Market relevance`: **Enough**

---

## 2. Asset Identity

### What we have

- Token: `RaveDAO`
- Ticker: `RAVE`
- Primary Ethereum contract: `0x17205fab260a7a6383a81452cE6315A39370Db97`
- Additional cross-chain presence already seen in public market data:
  - Base
  - BSC

### Current assessment

Identity is sufficiently established to research the case.

### Input status

- `Token identity`: **Enough**
- `Primary contract`: **Enough**
- `Cross-chain presence`: **Partial**

### Missing if we want higher quality

- chain-by-chain circulating split
- official bridge mapping
- unified supply view across Ethereum / Base / BSC

---

## 3. Market Snapshot

### What we have

From existing notes and live snapshots already checked:

- current price region around the low-single-digit USD range after the collapse
- 30-day high around the low-20s
- crash low near the sub-$1 zone
- volume still extremely large relative to market cap
- venue pricing dispersion exists across CEX and DEX venues

### Current assessment

Enough to state that:

- the asset is in a **post-parabolic rebound regime**
- this is a **high-instability market**
- price discovery is **not clean across venues**

### Input status

- `Current price / volume`: **Enough**
- `Volatility regime`: **Enough**
- `Venue dispersion`: **Enough for initial thesis**

### Missing if we want higher quality

- exact venue depth
- orderbook quality by venue
- reliable spot/perp lead-lag mapping

---

## 4. Wallet Map

### Key wallets already identified

- `0x9831...` - owner / dominant holder
- `0x0d07...` - major active whale
- `0x1ab4...` - hub / likely exchange-facing sink
- `0xd063...` - routing wallet
- `0x8ed6...` - large source wallet in listing-window flow
- `0xc882...` - round-trip / redistribution wallet
- `0x6020...` - major recipient from owner

### Current assessment

This is already enough to do a credible Lookonchain-style first pass.

### Input status

- `Wallet map`: **Enough**
- `Key addresses`: **Enough**
- `Role hypothesis`: **Enough**

### Missing if we want higher quality

- systematic label verification
- additional cluster expansion
- watchlist overlap with other suspicious cases

---

## 5. Entity Map

### What we can say now

High-confidence labels:

- `0x9831...` behaves like owner / controlling wallet

High-confidence inferences:

- `0x1ab4...` behaves like a hub and may be exchange-facing
- `0xd063...` behaves like a routing leg
- `0x0d07...` behaves like a whale / active inventory wallet

Weak or incomplete inferences:

- whether `0x1ab4...` is definitively tied to a named exchange
- whether routing wallets belong to treasury, MM, insiders, or mixed operators

### Current assessment

This is where the case is **not yet Arkham-grade**.

### Input status

- `Entity map`: **Partial**

### Missing if we want higher quality

- Arkham labels for all key wallets
- deposit/address confirmation from exchange heuristics
- cluster ownership evidence
- repeated historical behavior by the same cluster

---

## 6. Timing Analysis

### What we already know

- contract deployed on **October 16, 2025**
- major listing-window flows on:
  - **December 12, 2025**
  - **December 14, 2025**
- Coinbase spot access reference around **February 11, 2026**
- major public squeeze regime in **April 2026**

### Why this matters

The sequence supports a strong working model:

- **December 2025** = rails / routing / inventory preparation
- **February 2026** = broader market access
- **April 2026** = squeeze activation

### Current assessment

Timing quality is already one of the strongest parts of the RAVE case.

### Input status

- `Timing`: **Enough**

### Missing if we want higher quality

- more precise timestamps for public announcements vs wallet moves
- venue-level timing for spot vs perp reaction
- pre-announcement purchase detection at a finer granularity

---

## 7. Flow Path

### What we already have

The case already contains concrete path examples such as:

- `0x8ed6... -> 0xd063... -> 0x34d5... -> 0x1ab4...`
- `0xd063... -> 0x8dc3... -> 0x0d07...`
- `0xd063... -> 0xbf12... -> 0x1ab4...`
- `0x0d07... -> 0xc882... -> 0x0d07...`

These are exactly the kinds of routes a Lookonchain-style note wants to surface.

### Current assessment

Flow-path quality is already strong enough for publication.

### Input status

- `Flow path`: **Enough**
- `Top transfers`: **Enough**
- `Multi-hop examples`: **Enough**

### Missing if we want higher quality

- full route diagrams
- cluster-level grouping of recurring paths
- destination classification with stronger confidence

---

## 8. Size / Concentration

### What we already know

- holder concentration is extremely high
- top holder share alone is dominant
- top few holders control almost the entire supply
- the token has repeatedly shown behavior consistent with thin-float sensitivity

### Current assessment

This is enough to explain why:

- price can overshoot violently
- order books can be manipulated or at least distorted
- squeezes can happen without healthy organic demand

### Input status

- `Concentration`: **Enough**
- `Float fragility`: **Enough**

### Missing if we want higher quality

- true float estimate by excluding treasury / locked / non-tradable buckets
- entity-adjusted concentration instead of raw address concentration

---

## 9. Current On-Chain Behavior

### What we already know

From recent transfer checks:

- owner wallet activity is still relevant
- whale `0x0d07...` remains active on both inbound and outbound sides
- hub `0x1ab4...` is still functioning as an active transfer node

### Current assessment

This is enough to say:

> the market is still in active-inventory mode, not in quiet long-term accumulation mode

That is an important current-state conclusion.

### Input status

- `Current wallet behavior`: **Enough**

### Missing if we want higher quality

- rolling 24h / 72h netflow tracker for key wallets
- balance-change dashboard for the key cluster

---

## 10. Derivatives / Positioning

### What we have now

Only partial inference:

- Binance perp listing timing
- narrative evidence that derivatives mattered
- observed squeeze-like behavior in price

### What we do NOT yet have directly

- funding
- open interest
- liquidation clusters
- basis behavior

### Current assessment

This is the biggest missing layer in the whole case.

### Input status

- `Derivatives layer`: **Not enough**

### Why this matters

Without this, we can say:

- the market **looks** squeeze-driven

but we cannot fully prove:

- how much of the move was perp-led vs spot-led
- whether shorts or longs were the main trapped side

---

## 11. Cross-Chain / Bridge Check

### What we have

- public market data shows RAVE also exists on Base and BSC

### What is missing

- bridge routes
- chain-level supply split
- chain-specific liquidity quality

### Current assessment

This is a meaningful missing input.

### Input status

- `Cross-chain`: **Not enough**

### Why this matters

If active trading or routing shifted across chains, a purely Ethereum reading can miss part of the real structure.

---

## 12. PnL / Smart Money Layer

### What we have now

Some size and timing observations, but not a full PnL layer.

### What is missing

- entry estimates
- exit estimates
- realized PnL
- unrealized PnL
- repeated profitability history

### Current assessment

This is optional for a first pass, but very valuable if we want a sharper Lookonchain-style note.

### Input status

- `PnL layer`: **Partial**

---

## 13. Confidence Ladder

### Facts we already have

- contract deployment
- specific transfer paths
- specific transfer sizes
- high concentration
- owner / whale / hub activity

### High-confidence inferences

- inventory routing occurred
- the structure was fragile enough to support later squeeze behavior
- current wallet behavior still looks active rather than passive

### Weak / incomplete inferences

- specific named exchange attribution for some wallets
- full insider / MM / treasury identity for routing wallets
- exact perp-led mechanism without funding/OI/liquidations

### Current assessment

This part is already strong enough for publication if we keep the language disciplined.

### Input status

- `Confidence separation`: **Enough**

---

## 14. Final Interpretation

### What is already strong

RAVE is already a good case for the checklist because it clearly shows:

- event-driven timing
- wallet concentration
- multi-hop routing
- active whale behavior
- weak market quality
- plausible squeeze mechanics

### What is still weak

The Arkham side is not fully satisfied because we still lack:

- strong entity labels
- mechanism separation between selling, routing, custody, and settlement
- cross-chain completeness
- derivatives completeness

---

## 15. Trade Implication

### What we can already say confidently

- the structure is fragile
- the token can still squeeze
- rallies can still happen without healthy fundamentals
- active wallet behavior means every rally has distribution risk

### What we cannot say confidently yet

- whether the next move will be spot-led or perp-led
- which venue is truly leading price discovery
- whether cross-chain flow is reinforcing or weakening the current rebound

---

## 16. What Inputs Should Be Added Next?

If I only add **3 more inputs** to make RAVE much stronger under this framework, I would choose:

1. **Entity labels for the key wallets**
   - especially `0x1ab4...`, `0xd063...`, `0xc882...`, `0x6020...`

2. **Derivatives snapshot**
   - funding
   - open interest
   - liquidation pressure
   - basis

3. **Cross-chain flow**
   - Ethereum vs Base vs BSC
   - supply split
   - bridge activity

---

## 17. Bottom Line

### Is the RAVE case ready for the Lookonchain + Arkham framework?

**Yes, for a strong first-pass version.**

### Is it complete?

**No.**

### What is missing?

- entity certainty
- perp certainty
- cross-chain certainty

### Final call

The current RAVE case already supports a convincing note built around:

- event
- wallet map
- timing
- routing
- concentration
- current behavior
- price implication

But if we want the note to become genuinely high-confidence and reusable as a model case, we should still add:

- `entity map`
- `perp data`
- `cross-chain data`

---

## 18. Follow-Up Inputs Added

The 3 missing layers above were then checked directly with live venue APIs, Etherscan labels, RPC supply reads, and DEX liquidity snapshots.

This does not make the case perfect, but it materially upgrades the note.

---

## 19. Entity Map Upgrade

### What is now verified

From Etherscan labels:

- `0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23` = **Bitget 6**
- `0x0d0707963952f2fba59dd06f2b425ace40b492fe` = **Gate deposit address**
- `0xc882b111a75c0c657fc507c04fbfcd2cc984f071` = **Gate deposit address**

### Why this changes the read

This is a major upgrade over the earlier hypothesis.

Before, `0x1ab4...` and `0x0d07...` could still be described as generic hub / whale wallets.

Now the better read is:

- `0x1ab4...` is not just a hub, it is **Bitget-facing**
- `0x0d07...` is not just a whale wallet, it is **Gate-facing**
- `0xc882...` looping with `0x0d07...` is not clean independent whale behavior, it is **same-exchange-facing choreography**

### Updated interpretation

The December 12-14 flow graph now looks more like:

- source / routing wallets
- intermediate splitter wallets
- exchange deposit endpoints

rather than:

- source wallet
- independent organic buyers

That is a more serious structural signal.

### Confidence ladder

Facts:

- `0xd063... -> 0x34d5... -> 0x1ab4...`
- `0xd063... -> 0x8dc3... -> 0x0d07...`
- `0x0d07... -> 0xc882... -> 0x0d07...`
- `0x1ab4...` is labeled Bitget 6
- `0x0d07...` and `0xc882...` are labeled Gate deposit addresses

High-confidence inference:

- a meaningful part of the early RAVE inventory flow was **exchange-facing inventory routing**

Still unproven:

- whether those exchange-facing transfers were market making, treasury routing, insider distribution, or mixed activity

### Updated input status

- `Entity map`: **Enough for a strong first-pass**

---

## 20. Derivatives Snapshot Upgrade

### Binance check

As of **April 21, 2026**, Binance spot and Binance futures public symbol checks for `RAVEUSDT` return invalid / non-listed status.

That matters because it means:

- current RAVE leverage is **not Binance-centric**
- the perp layer should be read through other venues

### Venue checks that are active now

#### Bybit

- `RAVEUSDT` status: **Trading**
- launch time: **December 15, 2025 05:50:12 UTC**
- mark price: **$1.73386**
- open interest: **14,235,786 RAVE**
- open interest value: **$24.68M**
- 24h turnover: **$472.15M**
- funding rate: **+0.467245% per hour**

#### Bitget

- `RAVEUSDT` status: **normal**
- open time: **December 12, 2025 09:12:14 UTC**
- mark price: **$1.77184**
- holding amount: **18,697,617 RAVE**
- 24h notional volume: **$330.36M**
- funding rate: **+0.0499% per hour**

#### MEXC

- `RAVE_USDT` status: **active**
- opening time: **December 12, 2025 12:10:00 UTC**
- fair price: **$1.7618**
- hold volume: **552,398 contracts**
- contract size: **10 RAVE**
- estimated open contracts notional: about **5.52M RAVE**
- 24h amount: **$167.10M**
- funding rate: **+0.1338% per hour**

### What this means

This is enough to materially upgrade the derivatives layer.

The current perp picture is:

- leverage is still active across multiple venues
- volume is still extremely large
- funding is positive across the checked venues

That combination supports:

- crowded long positioning
- squeeze / liquidation sensitivity
- strong mechanical amplification of spot moves

### What it does NOT prove

- exact liquidation ladder by price level
- whether the initial April impulse was first triggered by spot or perps

### Updated input status

- `Derivatives layer`: **Enough for first-pass publication**

---

## 21. Cross-Chain Upgrade

### What is now verified

CoinGecko public identity data confirms three live contract footprints:

- Ethereum: `0x17205fab260a7a6383a81452ce6315a39370db97`
- Base: `0x1aa8fd5bcce2231c6100d55bf8b377cff33acfc3`
- BSC: `0x97693439ea2f0ecdeb9135881e49f354656a911c`

Using direct `totalSupply()` reads on each chain with `18` decimals:

- Ethereum: **951,997,589.659455 RAVE**
- Base: **15,389,430.470855 RAVE**
- BSC: **32,611,771.876928 RAVE**
- Combined observed supply: **999,998,792.007238 RAVE**

### Supply split

- Ethereum: **95.20%**
- Base: **1.54%**
- BSC: **3.26%**

### DEX liquidity / volume snapshots

Largest DEX pools found during the check:

- Ethereum Uniswap: about **$1.47M** liquidity, **$2.70M** 24h volume
- Base Aerodrome: about **$414.6K** liquidity, **$6.16M** 24h volume
- BSC PancakeSwap: about **$37.3K** liquidity, **$2.50M** 24h volume

### What this means

This is the most useful cross-chain conclusion:

- supply is overwhelmingly **Ethereum-based**
- but turnover is not purely Ethereum-based
- Base and BSC act more like **satellite liquidity / routing venues**

That matters because:

- a small-chain pool can help distort local price discovery
- even if it does not hold a large share of total supply

The BSC read is especially fragile because:

- liquidity is small
- but volume is still large relative to that liquidity

That is compatible with:

- unstable pricing
- high slippage sensitivity
- easier short-term dislocation

### What is still missing

- official bridge architecture
- named bridge contracts
- chain-by-chain bridge flow history

### Updated input status

- `Cross-chain`: **Enough for first-pass publication**

---

## 22. Revised Trade Implication

After adding the new data, the case reads more clearly:

- the entity layer now leans more toward **exchange-facing routing**
- the derivatives layer now clearly shows **active leverage**
- the cross-chain layer now clearly shows **Ethereum-dominant supply with fragile satellite liquidity**

That combination makes the market easier to describe as:

- structurally fragile
- leverage-amplified
- vulnerable to both pumps and air pockets

This is stronger than the earlier first-pass read because it is no longer just:

- concentration
- strange wallet routing

It is now:

- concentration
- exchange-facing wallet routing
- active perp speculation
- multi-chain liquidity fragmentation

---

## 23. Revised Bottom Line

### Is the RAVE case now ready for the Lookonchain + Arkham framework?

**Yes.**

### What improved most?

- `entity certainty`
- `perp certainty`
- `cross-chain certainty`

### What still remains imperfect?

- unlabeled ownership of the intermediate routing wallets
- liquidation-cluster precision
- official bridge mapping

### Final call after the follow-up check

RAVE is now much closer to a full `Lookonchain + Arkham` style case.

The strongest read is:

- early inventory was routed through a narrow wallet graph
- part of that graph terminated at labeled exchange deposit wallets
- derivatives became active across multiple non-Binance venues
- supply is mostly on Ethereum, but fragile liquidity exists on Base and BSC

That is enough to argue that RAVE was not just a random high-beta move.

It was a market structure that was:

- concentrated
- exchange-connected
- leverage-sensitive
- cross-chain fragmented

---

## 24. Sources Used For The Follow-Up Upgrade

- CoinGecko asset data: `https://api.coingecko.com/api/v3/coins/ravedao?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false`
- Bitget label: `https://etherscan.io/address/0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23`
- Gate label: `https://etherscan.io/address/0x0d0707963952f2fba59dd06f2b425ace40b492fe`
- Gate label: `https://etherscan.io/address/0xc882b111a75c0c657fc507c04fbfcd2cc984f071`
- Bybit instruments: `https://api.bybit.com/v5/market/instruments-info?category=linear&symbol=RAVEUSDT`
- Bybit ticker: `https://api.bybit.com/v5/market/tickers?category=linear&symbol=RAVEUSDT`
- Bitget contracts: `https://api.bitget.com/api/v2/mix/market/contracts?productType=USDT-FUTURES`
- Bitget ticker: `https://api.bitget.com/api/v2/mix/market/ticker?symbol=RAVEUSDT&productType=USDT-FUTURES`
- MEXC contract detail: `https://contract.mexc.com/api/v1/contract/detail`
- MEXC contract ticker: `https://contract.mexc.com/api/v1/contract/ticker?symbol=RAVE_USDT`
- Ethereum RPC `totalSupply()`: `https://ethereum-rpc.publicnode.com`
- Base RPC `totalSupply()`: `https://base-rpc.publicnode.com`
- BSC RPC `totalSupply()`: `https://bsc-rpc.publicnode.com`
- DexScreener token view: `https://api.dexscreener.com/latest/dex/tokens/0x17205fab260a7a6383a81452ce6315a39370db97`
- DexScreener token view: `https://api.dexscreener.com/latest/dex/tokens/0x1aa8fd5bcce2231c6100d55bf8b377cff33acfc3`
- DexScreener token view: `https://api.dexscreener.com/latest/dex/tokens/0x97693439ea2f0ecdeb9135881e49f354656a911c`
