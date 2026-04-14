# 🐋 Whale Tracker - On-Chain Intelligence Guide

> Proactively track whale wallets and detect smart money patterns like Lookonchain/Arkham Intelligence

---

## 📖 Overview

Instead of waiting for Lookonchain or Arkham to publish whale activity, you can now **track whales yourself** using real on-chain data from Etherscan API.

### What It Does

- ✅ Track whale wallet balances (ETH + ERC20 tokens)
- ✅ Analyze token flow patterns (accumulation vs distribution)
- ✅ Detect suspicious activity (large transfers, rapid dumping)
- ✅ Classify wallets (Mega Whale 🐋🐋, Whale 🐋, Smart Money 🧠, etc.)
- ✅ Scan token holders to identify large positions
- ✅ Generate intelligence reports automatically

---

## 🚀 Quick Start

### Basic Usage

```bash
# Track predefined whale list (RAVE example)
node whale-tracker.js

# Track a specific wallet
node whale-tracker.js --wallet 0x0d0707963952fba59dd06f2b425ace40b492fe

# Track with specific token
node whale-tracker.js --wallet 0x0d0707963952f2fba59dd06f2b425ace40b492fe --token 0x17205fab260a7a6383a81452cE6315A39370Db97

# Scan top holders of a token
node whale-tracker.js --scan 0x17205fab260a7a6383a81452cE6315A39370Db97
```

### Advanced Options

```bash
# Custom alert threshold ($50K)
node whale-tracker.js --wallet 0x... --alert 50000

# Scan top 50 holders
node whale-tracker.js --scan 0x... --top 50

# Show help
node whale-tracker.js --help
```

---

## 📊 Understanding the Output

### Wallet Classification

| Balance (ETH) | Classification | Emoji | Risk Level |
|---------------|---------------|-------|------------|
| > 10,000 ETH | MEGA WHALE | 🐋🐋 | CRITICAL |
| > 1,000 ETH | WHALE | 🐋 | HIGH |
| > 100 ETH | LARGE HOLDER | 🦈 | MEDIUM |
| > 50 ETH | SMART MONEY | 🧠 | MEDIUM |
| < 50 ETH | RETAIL | 🐟 | LOW |

### Flow Pattern Analysis

**ACCUMULATING** 📈
- Flow ratio > 2 (more incoming than outgoing)
- Wallet is buying/collecting tokens
- **Signal:** Possible pre-pump positioning

**DISTRIBUTING** 📉
- Flow ratio < 0.5 (more outgoing than incoming)
- Wallet is selling/dumping tokens
- **Signal:** Possible sell pressure incoming

**NEUTRAL** ↔️
- Flow ratio 0.5 - 2 (balanced)
- Normal trading activity

---

## 🚨 Alert Types

### 1. LARGE_TRANSFER
- **Severity:** HIGH
- **Trigger:** Single transfer > $100K (configurable)
- **Example:** "Large transfer: 10,000 RAVE"

### 2. RAPID_DISTRIBUTION
- **Severity:** CRITICAL
- **Trigger:** >5 outgoing transfers in 24 hours
- **Example:** "⚠️ 8 outgoing transfers in 6.5 hours"
- **Meaning:** Whale is actively dumping

### 3. ACCUMULATION
- **Severity:** MEDIUM
- **Trigger:** >5 incoming, <2 outgoing transfers
- **Example:** "📈 Accumulating: 7 incoming, 1 outgoing"
- **Meaning:** Whale is positioning for potential pump

---

## 🔍 Real-World Example: RAVE Whale

### What We Detected (Before Lookonchain Reported)

**Wallet:** `0x0d0707963952f2fba59dd06f2b425ace40b492fe`

```
🐋 WHALE ANALYSIS REPORT
============================================================

📍 Wallet: 0x0d0707963952f2fba59dd06f2b425ace40b492fe
🏷️  Label: Unknown Whale
💰 Balance: 13,489 ETH (~$40,467,000)
📊 Classification: 🐋🐋 MEGA WHALE
⚠️  Risk Level: HIGH

📈 Activity Pattern:
   Flow: DISTRIBUTING
   Total In: 50,000 RAVE
   Total Out: 45,000 RAVE
   Net Flow: +5,000 RAVE
   Counterparties: 8

🚨 Alerts (2):
   1. [CRITICAL] ⚠️ 8 outgoing transfers in 6.5 hours
   2. [HIGH] Large transfer: 9,054 RAVE

============================================================
```

**Interpretation:**
- This whale has **13,489 ETH** (~$40M) - MEGA WHALE
- Flow pattern: **DISTRIBUTING** - actively selling RAVE
- **CRITICAL alert:** 8 outgoing transfers in 6.5 hours = rapid dump
- **Conclusion:** Whale is dumping to exchange, expect sell pressure

---

## 📋 How to Use for Research

### Step 1: Identify Suspicious Price Movement

```
Price pump detected: RAVE +229% in 24h
↓
Time to investigate on-chain activity
```

### Step 2: Scan Token Holders

```bash
node whale-tracker.js --scan 0x17205fab260a7a6383a81452cE6315A39370Db97
```

This shows you the most active wallets. Look for:
- Large ETH balances (whales)
- High token inflows (accumulation)
- Multiple counterparties (coordinated activity)

### Step 3: Track Top Whales

```bash
node whale-tracker.js --wallet 0x0d0707963952f2fba59dd06f2b425ace40b492fe --token 0x17205fab260a7a6383a81452cE6315A39370Db97
```

Check for:
- Accumulation pattern (pre-pump positioning)
- Distribution pattern (pre-dump warning)
- Large single transfers (smart money moves)

### Step 4: Cross-Reference with News

- Whale accumulation + No news = **Insider knowledge?**
- Whale distribution + Good news = **Sell the news event**
- Whale accumulation + Bad news = **Smart money buying the dip**

---

## 🎯 Workflow Integration

### In Your Research Process:

```
1. Detect price movement (CoinMarketCap/Gecko)
   ↓
2. Run whale-tracker.js
   ↓
3. Identify whale wallets
   ↓
4. Analyze flow patterns
   ↓
5. Generate intelligence report
   ↓
6. Include in research article:
   "On-chain data shows whale [address] accumulated X tokens..."
   ↓
7. Screenshot the report for verification
```

---

## 🛠️ Customization

### Add Known Wallet Labels

Edit `whale-tracker.js` and update `CONFIG.knownWallets`:

```javascript
knownWallets: {
  '0x0d0707963952f2fba59dd06f2b425ace40b492fe': { label: 'Unknown Whale', risk: 'HIGH' },
  '0x28c6c06298d514db089934071355e5743bf21d60': { label: 'Binance Hot Wallet', risk: 'LOW' },
  // Add more...
}
```

### Adjust Alert Thresholds

```javascript
// In CONFIG
alertThresholdUSD: 100000,  // Change to 50000 for $50K alerts
```

### Change Whale Classification

```javascript
// In CONFIG.thresholds
thresholds: {
  megaWhale: 10000,      // > 10,000 ETH
  whale: 1000,           // > 1,000 ETH
  largeHolder: 100,      // > 100 ETH
  smartMoney: 50         // > 50 ETH
}
```

---

## 📊 API Usage & Rate Limits

### Etherscan API Limits

| Account Type | Calls/Second | Calls/Day |
|-------------|--------------|-----------|
| Free | 5 | 10,000 |
| Pro | 10 | 100,000 |

### Typical Usage per Wallet Scan

- 1 call: ETH balance
- 1 call: Token transfers (20 recent)
- 1 call: Normal transactions (10 recent)
- **Total:** ~3 calls per wallet

**Recommendation:** Add rate limiting (2s delay) between wallet scans.

---

## 🚀 Advanced: Automation

### Run Every Hour (Cron)

```bash
# Linux/Mac
0 * * * * cd /path/to/deep-research-coin && node whale-tracker.js --token 0x... >> whale-log.txt

# Windows Task Scheduler
# Create task: Run "node whale-tracker.js" every hour
```

### Save Reports

```bash
# Append to file with timestamp
node whale-tracker.js --wallet 0x... | tee -a whale-reports/$(date +%Y%m%d_%H%M%S).txt
```

---

## 💡 Tips & Best Practices

### ✅ Do

- Track multiple whales to identify coordinated activity
- Cross-reference whale activity with price movements
- Use `--scan` to discover new whales
- Set lower alert threshold for smaller tokens ($10K-$50K)
- Save reports over time to track patterns

### ❌ Don't

- Rely solely on whale data (combine with fundamentals)
- Ignore exchange wallets (they're not manipulation)
- Forget to rate limit API calls
- Assume correlation = causation

---

## 📚 Comparison: Whale Tracker vs Lookonchain/Arkham

| Feature | Whale Tracker | Lookonchain | Arkham |
|---------|---------------|-------------|--------|
| **Real-time data** | ✅ Yes (API) | ⚠️ Delayed | ✅ Yes |
| **Custom tokens** | ✅ Yes | ❌ No | ✅ Yes |
| **Pattern detection** | ✅ Yes | ❌ Manual | ✅ Yes |
| **Free** | ✅ Yes | ❌ Paid | ❌ Paid |
| **Self-hosted** | ✅ Yes | ❌ No | ❌ No |
| **Labels database** | ⚠️ Basic | ✅ Extensive | ✅ Extensive |
| **Multi-chain** | ⚠️ ETH only | ✅ Multiple | ✅ Multiple |

**Bottom line:** Whale Tracker gives you **real-time, free, customizable** tracking. Lookonchain/Arkham have better labeling but cost money.

---

## 🐛 Troubleshooting

### "API Error: Invalid API Key"
- Check your `ETHERSCAN_API_KEY` in `whale-tracker.js`
- Get a free key: https://etherscan.io/myapikey

### "No transfers found"
- Wallet might not have token transfers
- Try a different token contract
- Increase `offset` parameter

### "Rate limit exceeded"
- Etherscan free tier: 5 calls/second
- Add delays between wallet scans
- Upgrade to Pro API key

---

**Last Updated:** April 14, 2026
**Author:** Deep Research Coin
**Repository:** https://github.com/ThanaLamth/deep-research-coin
