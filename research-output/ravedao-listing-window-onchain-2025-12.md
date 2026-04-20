# 🔗 RaveDAO (RAVE) - Listing Window On-Chain Analysis

**Research Date:** April 20, 2026  
**Token:** RAVE (RaveDAO)  
**Contract:** `0x17205fab260a7a6383a81452cE6315A39370Db97` (Ethereum)  
**Focus Window:** December 12-14, 2025  

---

## 1. Why This File Exists

This note isolates the on-chain behavior around the early RAVE listing window to answer one specific question:

> Did the market structure around the initial listing phase look clean, or did it already show signs of concentrated inventory routing and potential manipulation risk?

The two external timeline anchors discussed were:

- **December 12, 2025:** Aster listing / launch window
- **December 14, 2025:** Binance `RAVEUSDT` perpetual futures launch

This file focuses only on **Ethereum token flow**, not orderbook data inside Aster or Binance.

---

## 2. Core Takeaway

The on-chain picture around the listing window does **not** look like a clean retail-distributed launch.

Instead, it shows:

- large token movements through a small number of wallets
- multi-hop routing into a hub wallet cluster
- significant mint activity around the same time
- concentrated flows that look more like **inventory setup / distribution choreography** than organic spot demand

This does **not** prove illegal manipulation by itself.

But it does support the weaker and more defensible claim:

> RAVE entered its early trading life with a structure that was unusually easy to influence because inventory moved through a small number of coordinated-looking wallets.

---

## 3. Methodology

Contract analyzed:

- `0x17205fab260a7a6383a81452cE6315A39370Db97`

Checks performed:

- contract creation verification
- ERC-20 `Transfer` logs by block range
- comparison of **December 12, 2025**, **December 13, 2025**, and **December 14, 2025**
- identification of the largest transfers and most active recipient / sender wallets

Contract creation reference:

- Deploy tx: https://etherscan.io/tx/0x8d6ef4f6db0723582c877c5a87534916c1349d9ead6a30d0d5f7c760a06b2b65

Contract deployment time:

- **October 16, 2025 17:58:11 UTC**

That means the token already existed on-chain well before the December listing window.

---

## 4. Timeline Summary

| Date (UTC) | Transfer Count | Mint Count | Gross Token Volume | High-Level Read |
|-----------|----------------|------------|--------------------|-----------------|
| **December 12, 2025** | 5,760 | 252 | ~95.52M RAVE | Major routing / staging day |
| **December 13, 2025** | 4,266 | 281 | ~7.99M RAVE | Cooldown / digestion day |
| **December 14, 2025** | 3,570 | 195 | ~42.61M RAVE | Redistribution / recycling day |

The most important point is that **December 12** and **December 14** stand out relative to the day in between.

That pattern is more consistent with a controlled inventory process than with smooth organic demand.

---

## 5. Exchange / Access Timeline

This section is included because the wallet activity only makes sense in context if you also map when **trading access** expanded.

### Confirmed / Referenced Venue Timeline

| Date | Venue | Type | Source Status | Why It Matters |
|------|-------|------|---------------|----------------|
| **October 16, 2025** | Ethereum | Contract deployed | ✅ On-chain verified | Token existed well before the December listing window |
| **December 12, 2025** | Aster | Launch / listing window around `RAVE/USD1` | ⚠️ Referenced by Aster announcement link and third-party relays | Earliest discussed venue access in this analysis window |
| **December 14, 2025** | Binance | `RAVEUSDT` perpetual futures | ✅ Official Binance announcement | Major leverage venue opens before the April 2026 squeeze |
| **February 11, 2026** | Coinbase | Spot access / listing reference | ⚠️ Secondary-source reference, not independently verified here from Coinbase announcement page | Important because it likely widened real spot access materially |
| **By April 2026** | Multi-venue attention | Broader access / visibility | ⚠️ Inference from later market coverage and exchange mentions | Helps explain why the large move happened later, not immediately in December |

### Why This Matters

The December on-chain activity should not be read in isolation.

The broader sequence appears to be:

- **December 2025:** market rails get built
- **February 2026:** access likely broadens further via Coinbase spot reference
- **April 2026:** enough attention, leverage, and narrative pile onto an already-fragile float structure

That is why the price can stay relatively contained during the original listing window but still explode much later.

### Caution On Source Quality

- The **Binance perpetual listing** is directly confirmed by Binance.
- The **Aster launch window** is anchored to the Aster announcement link discussed in the thread, but text extraction from that page is difficult and some surrounding details were easier to confirm through relay coverage.
- The **February 11, 2026 Coinbase spot reference** comes from later analytical / exchange commentary rather than a Coinbase announcement page directly verified inside this file.

That means the timeline is still useful, but the confidence level is not identical across all venue entries.

---

## 6. December 12, 2025 - Setup / Routing Phase

### Aggregate Stats

- **Transfer count:** `5,760`
- **Mint count:** `252`
- **Gross token volume:** `95,519,817.347 RAVE`

### Largest Transfers Observed

1. `20,000,000 RAVE`  
   `0x8ed6245c3276307e1a9d9dc872e98a0e770070fd`  
   -> `0xd063ee03cb86d7050496ad5c56f7185961100452`  
   Tx: https://etherscan.io/tx/0x57b710a0a80505349ef3c25238960653531f1987cda1315345c5490788142468

2. `8,000,000 RAVE`  
   `0xd063ee03cb86d7050496ad5c56f7185961100452`  
   -> `0x34d5acad385158095f2ca8ee47834af626a88be1`  
   Tx: https://etherscan.io/tx/0x3e2ddb5db3c755d6a5fad6fde2b4f0a18a7d3d244fff80e98e4a630256a22473

3. `8,000,000 RAVE`  
   `0x34d5acad385158095f2ca8ee47834af626a88be1`  
   -> `0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23`  
   Tx: https://etherscan.io/tx/0xc4887389a60547e8646638eed365007c48fdf538d75df1aab6db46820110d00b

4. `8,000,000 RAVE` mint  
   `0x0000000000000000000000000000000000000000`  
   -> `0xd7edc88172a374ae222e57b99875426f8b4d37da`  
   Tx: https://etherscan.io/tx/0x4cab9ea4616706773842c6dfb3921b6c5af7c90cf771cbd5532077452fbb87e7

5. `6,000,000 RAVE` mint  
   `0x0000000000000000000000000000000000000000`  
   -> `0xd7edc88172a374ae222e57b99875426f8b4d37da`  
   Tx: https://etherscan.io/tx/0x4311ccf53d783978abe19c32730f75b92ec914c6944a8f71e786948fdc4c1e20

6. `4,349,910 RAVE`  
   `0x8ed6245c3276307e1a9d9dc872e98a0e770070fd`  
   -> `0xd7edc88172a374ae222e57b99875426f8b4d37da`  
   Tx: https://etherscan.io/tx/0x3d565db108350ff6dfba27f6afeeb2b872716b980cdddf6c803d4b1d95f82f0e

7. `4,000,000 RAVE`  
   `0xd063ee03cb86d7050496ad5c56f7185961100452`  
   -> `0x8dc31b473f31203143c90479a26510e85f0577bb`  
   Tx: https://etherscan.io/tx/0x5c89bda9ffa84414c1894f120517c4eca4c6e7e4cf1e9d701be7bc778974f139

8. `4,000,000 RAVE`  
   `0x8dc31b473f31203143c90479a26510e85f0577bb`  
   -> `0x0d0707963952f2fba59dd06f2b425ace40b492fe`  
   Tx: https://etherscan.io/tx/0x69ac97191d6c8c8e8bdb88a31edf8de9f55ec6151cf9cbc7a5c7f195aca0001d

### Top Recipient Wallets That Day

- `0xd063...0452` received about `20.00001M`
- `0xd7ed...37da` received about `18.34994M`
- `0x1ab4...8f23` received about `10.106218M`
- `0x0d07...92fe` received about `4.739777M`

### Interpretation

This looks like a **setup / routing day**:

- a large source wallet moves inventory into an intermediate wallet
- inventory is then split again
- one branch routes into `0x1ab4...8f23`
- another branch routes into `0x0d07...92fe`
- large mints are also occurring into a separate wallet cluster

This does **not** read like broad public demand.

It reads like:

- inventory placement
- liquidity staging
- or controlled distribution across a small number of relevant counterparties

---

## 7. December 13, 2025 - Digestion / Pause

### Aggregate Stats

- **Transfer count:** `4,266`
- **Mint count:** `281`
- **Gross token volume:** `7,987,892.717 RAVE`

### Notable Features

- flow was much smaller than December 12
- no comparable `5M-20M` transfer cluster
- `0x1ab4...8f23` had effectively no visible role that day
- `0x0d07...92fe` had modest activity only

### Interpretation

This looks like a **cooldown day** between two much more important phases.

That matters because it suggests:

- December 12 was not just baseline token activity
- December 14 was also not random noise

Instead, the three-day sequence looks staged:

- **12 Dec:** heavy routing
- **13 Dec:** reduced activity / pause
- **14 Dec:** renewed large-wallet reshuffling

---

## 8. December 14, 2025 - Redistribution / Recycling Phase

### Aggregate Stats

- **Transfer count:** `3,570`
- **Mint count:** `195`
- **Gross token volume:** `42,609,940.503 RAVE`

### Largest Transfers Observed

1. `5,000,000 RAVE`  
   `0xd063ee03cb86d7050496ad5c56f7185961100452`  
   -> `0xbf1272fbdb6f28388f3f709675c51ee12512af18`  
   Tx: https://etherscan.io/tx/0x509be19d41824ebddcaf091131f026e938512d2c4df6afde9499c8cd469b497c

2. `5,000,000 RAVE`  
   `0xbf1272fbdb6f28388f3f709675c51ee12512af18`  
   -> `0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23`  
   Tx: https://etherscan.io/tx/0x6045487bf2ca27ed17913bdb6a3c4ab6bcdd3df63b063ea1b6e5399ad908f2c6

3. `3,140,626.414 RAVE`  
   `0x0d0707963952f2fba59dd06f2b425ace40b492fe`  
   -> `0xc882b111a75c0c657fc507c04fbfcd2cc984f071`  
   Tx: https://etherscan.io/tx/0x09a97a046954f00e403b802ae5054eb74c4a2e2dc57c21d7d6281efd88bf3882

4. `3,140,626.414 RAVE`  
   `0xc882b111a75c0c657fc507c04fbfcd2cc984f071`  
   -> `0x0d0707963952f2fba59dd06f2b425ace40b492fe`  
   Tx: https://etherscan.io/tx/0xfe50db3ebbccae1228eb88681ef2c81ff67b26308050b87f0b7dfb4d8a4f5c8a

5. `2,499,990.393 RAVE`  
   `0x9936bfdea80f055644e19867c6f8fd13fcd20865`  
   -> `0x0d0707963952f2fba59dd06f2b425ace40b492fe`  
   Tx: https://etherscan.io/tx/0x17ead3e008556f9dd8a7551a89acce36fb3c4f47e722bdd6826c459c8560713d

6. `1,499,996.404 RAVE`  
   `0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23`  
   -> `0x9936bfdea80f055644e19867c6f8fd13fcd20865`  
   Tx: https://etherscan.io/tx/0xe074c37a4d59d0160ba17f04dd86b7e436f2463da0de63577ecd0d4d566f394a

7. `999,993.988 RAVE`  
   `0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23`  
   -> `0x9936bfdea80f055644e19867c6f8fd13fcd20865`  
   Tx: https://etherscan.io/tx/0x41c8e4142e0e793e473005394b3803d00f98a2466fb1cd8b3a621076e9b23428

### Top Recipient Wallets That Day

- `0x0d07...92fe` received about `6.136346M`
- `0x1ab4...8f23` received about `5.958960M`
- `0xbf12...af18` received `5.000000M`
- `0xc882...f071` received `3.140626M`

### Top Sender Wallets That Day

- `0x1ab4...8f23` sent about `6.472792M`
- `0x0d07...92fe` sent about `6.407381M`
- `0xd063...0452` sent `5.000000M`
- `0xbf12...af18` sent `5.000000M`

### Interpretation

This does **not** look like fresh clean accumulation.

It looks more like **redistribution / recycling** across a cluster:

- `0xd063...` still routes inventory
- `0x1ab4...` continues to act like a hub
- `0x0d07...` is heavily active on both sides
- tokens move between large wallets in patterns that are difficult to frame as normal retail behavior

The round-trip:

- `0x0d07... -> 0xc882...`
- `0xc882... -> 0x0d07...`

is especially notable because it looks like wallet choreography, not market demand.

---

## 9. Key Wallets

These are the wallets that matter most in the listing window read:

### `0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23`

Working role:

- **hub / exchange-facing wallet / inventory sink**

Why it matters:

- received `8M` on December 12
- received another `5M` path on December 14
- also sent out large blocks on December 14

Interpretation:

- this wallet looks central to the flow network

### `0x0d0707963952f2fba59dd06f2b425ace40b492fe`

Working role:

- **major whale / active inventory wallet**

Why it matters:

- received `4M` on December 12 from `0x8dc3...`
- highly active on December 14 both inbound and outbound

Interpretation:

- not a passive holder
- behavior is consistent with a wallet that mattered to price discovery

### `0xd063ee03cb86d7050496ad5c56f7185961100452`

Working role:

- **routing wallet / distribution leg**

Why it matters:

- received `20M` on December 12
- split onward into other key wallets
- remained active on December 14 with another `5M` transfer

Interpretation:

- this wallet looks like a major routing leg rather than an endpoint

---

## 10. What This Suggests About Market Structure

### What This Analysis Supports

1. **The early RAVE market was inventory-driven**
   - large quantities moved through a narrow wallet graph

2. **The December listing window already showed concentration risk**
   - a few wallets handled a disproportionate amount of meaningful flow

3. **The market was likely easy to influence**
   - even without proving explicit manipulation, this is enough to say price discovery was structurally fragile

4. **Later squeezes in April 2026 did not appear from nowhere**
   - the December flow suggests the market had already been shaped in a way that could support future volatility

### What This Analysis Does NOT Prove

- it does **not** prove illegal wash trading
- it does **not** prove a named exchange wallet without explicit labeling
- it does **not** prove a coordinated insider conspiracy from logs alone

The correct conclusion is narrower:

> The on-chain structure around the early RAVE listing window was concentrated, staged-looking, and unusually compatible with later manipulation or squeeze dynamics.

---

## 11. Best Practical Read

If you compress the three-day sequence into one sentence:

- **December 12, 2025:** heavy inventory setup / routing
- **December 13, 2025:** digestion / pause
- **December 14, 2025:** reshuffling / recycling between the same important wallet cluster

That is exactly the kind of structure that can later produce:

- low-float squeezes
- sharp repricings
- fake-looking momentum bursts
- large moves when derivatives attention finally arrives

---

## 12. References

- RAVE contract page: https://etherscan.io/token/0x17205fab260a7a6383a81452cE6315A39370Db97
- Contract deploy tx: https://etherscan.io/tx/0x8d6ef4f6db0723582c877c5a87534916c1349d9ead6a30d0d5f7c760a06b2b65
- Aster announcement reference: https://www.asterdex.com/en/announcement/8?category=NEW_LISTING
- Binance futures announcement: https://www.binance.com/en/support/announcement/detail/51aa167664c542eb857533e11eb213bc
- KuCoin analysis referencing February 11, 2026 Coinbase listing catalyst: https://www.kucoin.com/news/articles/analysis-behind-rave-token-80-surge-whale-accumulation-on-chain-data-tracking-practices
- Coinbase asset page (current availability reference): https://www.coinbase.com/price/ravedao

---

*Disclaimer: This is a market structure analysis, not an accusation of wrongdoing. On-chain concentration and staged-looking flow increase manipulation risk, but they do not alone prove intent.*
