# 📊 Deep Research Coin

> Professional cryptocurrency research with on-chain verification.

---

## 🚀 Quick Start

```bash
npm install puppeteer
node screenshots-api.js
```

Read the full workflow: **[WORKFLOW.md](./WORKFLOW.md)**  
Quick reference: **[QUICKSTART.md](./QUICKSTART.md)**

---

## 📂 Latest Research: RaveDAO (RAVE)

### Reports
| File | Description |
|------|-------------|
| [RAVE-Research-Report.pdf](./RAVE-Research-Report.pdf) | Full technical analysis |
| [RAVE-Deep-Research-Coindesk.pdf](./RAVE-Deep-Research-Coindesk.pdf) | Coindesk-style report |
| [RAVE-WordPress.html](./RAVE-WordPress.html) | WordPress-ready (copy-paste) |

### Supporting Files
| File | Description |
|------|-------------|
| [RAVE-analysis.md](./RAVE-analysis.md) | Initial analysis |
| [ONCHAIN-VERIFICATION.md](./ONCHAIN-VERIFICATION.md) | All Etherscan links |
| [SOURCES.md](./SOURCES.md) | Research sources (15+) |

### Screenshots
| Image | Source |
|-------|--------|
| ![CoinMarketCap](./images/coinmarketcap-price.png) | [CoinMarketCap](https://coinmarketcap.com/currencies/ravedao/) |
| ![Etherscan Supply](./images/etherscan-total-supply.png) | [Etherscan API](https://etherscan.io/token/0x17205fab260a7a6383a81452cE6315A39370Db97) |
| ![Whale Wallet](./images/etherscan-whale-wallet.png) | [Etherscan API](https://etherscan.io/address/0x0d0707963952f2fba59dd06f2b425ace40b492fe) |

---

## 🔍 Methodology

1. **Web Research** - Collect 10+ news sources
2. **On-Chain Verification** - Etherscan API v2
3. **Screenshot Capture** - API → HTML → PNG
4. **Report Generation** - Coindesk-style HTML
5. **PDF Export** - Puppeteer-PDF
6. **WordPress Export** - Copy-paste ready HTML

---

## 📁 Project Structure

```
├── WORKFLOW.md                          # Complete workflow documentation
├── QUICKSTART.md                        # Quick reference guide
├── RAVE-analysis.md                     # Initial RAVE analysis
├── RAVE-Research-Report.pdf             # Technical report (PDF)
├── RAVE-Deep-Research-Coindesk.pdf      # Journalistic report (PDF)
├── RAVE-WordPress.html                  # WordPress-ready HTML
├── ONCHAIN-VERIFICATION.md              # Full Etherscan verification
├── SOURCES.md                           # Research sources
├── README.md                            # This file
└── images/
    ├── coinmarketcap-price.png          # Price data
    ├── coingecko-chart.png              # Price chart
    ├── etherscan-total-supply.png       # Supply verification
    ├── etherscan-whale-wallet.png       # Whale wallet (13,489 ETH)
    ├── etherscan-whale-transfers.png    # Whale transfers
    └── etherscan-aggregator.png         # Aggregator wallet
```

---

## 🛠️ Tools

| Tool | Purpose | Status |
|------|---------|--------|
| Etherscan API v2 | On-chain data | ✅ Working |
| Puppeteer | Web automation | ✅ Working |
| screenshots-api.js | Screenshot via API | ✅ **Best method** |
| puppeteer-pdf | PDF generation | ✅ Working |
| **whale-tracker.js** | **Whale tracking (Lookonchain-style)** | ✅ **NEW** |

---

## 🐋 Whale Tracker

Track whale wallets like Lookonchain/Arkham Intelligence - **proactively, not reactively**.

```bash
# Track predefined whales
node whale-tracker.js

# Track specific wallet
node whale-tracker.js --wallet 0x0d0707963952f2fba59dd06f2b425ace40b492fe

# Scan token holders
node whale-tracker.js --scan 0x17205fab260a7a6383a81452cE6315A39370Db97
```

Full guide: **[WHALE-TRACKER-GUIDE.md](./WHALE-TRACKER-GUIDE.md)**

---

## ⚠️ Security

- **NEVER commit API keys or tokens**
- Use `.gitignore` for sensitive files
- Remove tokens from `package.json` repository URL
- If exposed, revoke immediately and force push

---

## 📊 Key Findings: RAVE

| Metric | Reported (CMC) | Verified (On-Chain) |
|--------|---------------|-------------------|
| Total Minted | 1B (100%) | **977.6M (97.76%) minted** |
| Circulating Supply | 248M (24.8%) | **~248M (24.8%) - 76% locked for vesting** ✅ |
| Market Cap | $2.4B | **~$2.3B** (based on circulating) |
| Whale Activity | Rumored | **Confirmed** (13,489 ETH) |
| Vesting Lock | 76% locked | **Verified** - gradual release schedule |

---

## 📝 License

MIT - Use freely for research purposes.

---

**Last Updated:** April 13, 2026  
**Contact:** [GitHub Issues](https://github.com/ThanaLamth/deep-research-coin/issues)
