# Lookonchain + Arkham Research Checklist

Use this template when researching a token, wallet cluster, listing event, unlock, whale movement, or suspected manipulation case.

The goal is to combine:

- **Lookonchain-style speed**
  - fast wallet discovery
  - timing-sensitive signals
  - clear size / PnL / flow storytelling

with

- **Arkham-style structure**
  - entity labeling
  - mechanism analysis
  - custody / exchange / routing context
  - confidence separation between facts and inference

---

## 1. Trigger / Event

Start with one concrete event. Do not start with broad theory.

### Required

- What happened?
- Exact timestamp or date
- Why does the market care?

### Common triggers

- listing announcement
- perp listing
- spot listing
- unlock / vesting event
- wallet wakes up after dormancy
- token deploy / contract announcement
- major price spike / crash
- unusual whale movement
- bridge in / bridge out
- exchange inflow / outflow surge

### Output

- `Event`
- `Timestamp`
- `Market relevance`

---

## 2. Asset Identity

Confirm what asset is actually being researched.

### Required

- token name
- ticker
- chain(s)
- contract address(es)
- official links

### Nice to have

- CoinGecko page
- CoinMarketCap page
- Arkham asset/entity page
- Ethplorer page
- DEX pools / CEX tickers

### Output

- `Token`
- `Contracts`
- `Primary chain`
- `Cross-chain presence`

---

## 3. Market Snapshot

Take a market snapshot before drawing conclusions.

### Required

- current price
- 24h volume
- market cap
- FDV if relevant
- circulating / available supply

### Strongly recommended

- 7d high / low
- 30d high / low
- venue price dispersion
- volume / market cap ratio

### Questions

- Is the market trending, rebounding, or collapsing?
- Is this an isolated move or part of a broader market move?
- Are venues pricing the asset consistently?

### Output

- `Current market structure`
- `Volatility state`
- `Key price levels`

---

## 4. Wallet Map

Build a first-pass wallet map quickly.

### Minimum set

- owner / treasury wallet
- deployer
- top holder(s)
- whale wallet(s)
- hub / aggregator wallet(s)
- exchange-facing wallet(s)
- suspicious round-trip wallets

### Questions

- Which wallets appear first around the event?
- Which wallets receive the largest flows?
- Which wallets sit in the middle of routing paths?
- Which wallets are active on both sides of the market?

### Output

- short list of `3-10 key wallets`
- one-line role hypothesis for each wallet

---

## 5. Entity Map

Do not stop at raw wallet addresses when better labeling is possible.

### Required questions

- Is this wallet likely:
  - exchange
  - market maker
  - treasury
  - custodian
  - protocol contract
  - deployer cluster
  - fund / whale
  - bridge / router

### Sources

- Arkham labels
- exchange deposit/address patterns
- repeated transaction behavior
- on-chain clustering
- counterparties

### Output

- `Confirmed entity labels`
- `High-confidence entity inferences`
- `Unknown but important wallets`

---

## 6. Timing Analysis

Timing is where Lookonchain-style work becomes powerful.

### Required

- When did wallets buy / receive / route funds?
- Was it before or after the public event?
- How long were funds or tokens held?
- Was there unusual speed of in/out movement?

### Questions

- Pre-announcement buying?
- Immediate post-listing routing?
- Dormant wallet activation?
- Repeated pattern before every major move?

### Output

- `Before event`
- `During event`
- `After event`

---

## 7. Flow Path

Trace actual movement. Avoid vague wording.

### Required

- source wallet
- intermediate wallet(s)
- destination wallet(s)
- amount
- tx hash
- timestamp

### Questions

- Is this a one-hop flow or multi-hop flow?
- Does it look like:
  - accumulation
  - distribution
  - exchange deposit
  - routing
  - bridge movement
  - custody transfer
  - internal wallet reorg

### Output

- `Flow path table`
- `Top transfers`
- `Notable round-trips`

---

## 8. Size / Concentration

Quantify why the flow matters.

### Required

- amount moved
- % total supply
- % circulating supply
- % daily volume

### Strongly recommended

- top 5 / top 10 holder concentration
- entity concentration
- float concentration vs total supply concentration

### Questions

- Is this flow large enough to matter for price?
- Is the float actually small?
- Is the market easy to squeeze?

### Output

- `Supply quality`
- `Float quality`
- `Concentration risk`

---

## 9. Current On-Chain Behavior

Check what the important wallets are doing now, not just historically.

### Required

- latest incoming transfers
- latest outgoing transfers
- current balances of key wallets
- recent net inflow / net outflow

### Questions

- Are key wallets currently accumulating?
- Are they distributing?
- Are they active on both sides?
- Is there owner/treasury activity right now?

### Output

- `Current bias from wallet behavior`

---

## 10. Derivatives / Positioning

This is often the missing layer in token research.

### Required when relevant

- funding
- open interest
- liquidations
- basis
- perp venue listing timeline

### Questions

- Is this spot-led or perp-led?
- Are shorts trapped?
- Are longs overcrowded?
- Is price moving because of real demand or leverage mechanics?

### Output

- `Perp pressure`
- `Squeeze risk`
- `Long squeeze risk`

---

## 11. Cross-Chain / Bridge Check

Necessary if the token exists on multiple chains.

### Required when relevant

- supply by chain
- bridge routes
- chain-specific liquidity
- whether the “active” market is really on Ethereum, Base, BSC, etc.

### Questions

- Is price discovery happening on one chain while analysis is being done on another?
- Are tokens being bridged to dump or to provide liquidity?

### Output

- `Cross-chain relevance`
- `Bridge risk / bridge support`

---

## 12. PnL / Smart Money Layer

This is the strongest Lookonchain-style add-on.

### Required when possible

- entry price
- exit price
- realized PnL
- unrealized PnL
- hold duration

### Questions

- Did this wallet buy before the public knew?
- Is this wallet smart money or just lucky timing?
- Is this wallet repeatedly profitable in similar setups?

### Output

- `PnL significance`
- `Potential insider / smart-money signal`

---

## 13. Confidence Ladder

Never present all claims with the same certainty.

### Required categories

- `Fact`
- `High-confidence inference`
- `Weak / speculative inference`

### Example

- Fact: `Wallet A sent 5M tokens to Wallet B`
- High-confidence inference: `Wallet B likely functions as a routing hub`
- Weak inference: `Wallet B may be exchange-facing`

---

## 14. Final Interpretation

Convert raw work into a market view.

### Required

- What is definitely happening?
- What is probably happening?
- What is still unknown?

### Preferred structure

- `Bullish factors`
- `Bearish factors`
- `Neutral / unknown factors`

---

## 15. Trade Implication

End with actual price implication, not just on-chain trivia.

### Required

- short-term bias
- medium-term bias
- trigger levels
- invalidation levels

### Good output style

- `Bull case`
- `Base case`
- `Bear case`

with estimated ranges or scenarios

---

## 16. Minimum Deliverables

Every final research note should include at least:

1. `Event summary`
2. `Wallet map`
3. `Flow path`
4. `Entity map`
5. `Concentration summary`
6. `Current on-chain behavior`
7. `Price implication`
8. `Fact vs inference separation`

---

## 17. Fast Version

If speed matters, use this abbreviated flow:

1. identify the event
2. find 3-5 key wallets
3. trace top 5 transfers
4. check top holders
5. identify whether the structure is accumulation, distribution, or routing
6. add current price/volume
7. give bull/base/bear implication

---

## 18. Common Failure Modes

Avoid these mistakes:

- mistaking exchange routing for true selling
- calling any large wallet “insider” without timing proof
- ignoring derivatives when price action is perp-led
- ignoring cross-chain supply
- using total supply when float is what matters
- using price only without wallet behavior
- using wallet behavior only without market structure

---

## 19. Suggested Output Format

Use this order:

1. `What happened`
2. `Why the market cares`
3. `Key wallets`
4. `Key entities`
5. `Flow timeline`
6. `Concentration / float quality`
7. `Current wallet behavior`
8. `Derivatives context`
9. `Bull / base / bear`
10. `What is confirmed vs inferred`

---

## 20. Recommended Research Questions

Before finishing, answer these:

- Who moved first?
- Was the move before or after public information?
- Where did the tokens or funds actually go?
- Which wallet matters most?
- Which entity matters most?
- Is this accumulation, distribution, or choreography?
- Is the move spot-led or perp-led?
- How concentrated is the tradable float?
- What would make the thesis wrong?

