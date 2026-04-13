# 🚀 Quick Start - Crypto Research

## 3-Min Setup
```bash
mkdir research && cd research
npm init -y && npm install puppeteer
mkdir images
```

## Workflow in 5 Steps

### 1️⃣ Research the Token
```
Search: "[TOKEN] pump news [month] [year]"
Search: "[TOKEN] on-chain whale analysis"
Search: "[TOKEN] tokenomics vesting"
```

### 2️⃣ Verify On-Chain (Etherscan API)
```javascript
const API = '94ZBJE843MVHAQTZCVQKWGZ2DSVU6MA3WK';
const CONTRACT = '0x...';

// Get real supply
fetch(`https://api.etherscan.io/v2/api?chainid=1&module=stats&action=tokensupply&contractaddress=${CONTRACT}&apikey=${API}`)

// Get whale balance
fetch(`https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=0xWHALET&apikey=${API}`)

// Get transfers
fetch(`https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokentx&contractaddress=${CONTRACT}&address=0xWHALET&page=1&offset=10&sort=desc&apikey=${API}`)
```

### 3️⃣ Capture Screenshots
```bash
node screenshots-api.js
```
> ✅ Uses API → HTML → Screenshot (bypasses Cloudflare)

### 4️⃣ Generate Reports
- **Technical Report:** `RAVE-Research-Report.html` → PDF
- **Coindesk-Style:** `RAVE-Deep-Research-Coindesk.html` → PDF
- **WordPress Ready:** `RAVE-WordPress.html` → Copy-paste

### 5️⃣ Push to GitHub
```bash
git init && git add .
git commit -m "feat: add research report"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

---

## Output Files
| File | Purpose |
|------|---------|
| `TOKEN-analysis.md` | Initial analysis |
| `TOKEN-Research-Report.pdf` | Technical report |
| `TOKEN-Deep-Research-Coindesk.pdf` | Journalistic report |
| `TOKEN-WordPress.html` | WordPress-ready |
| `images/*.png` | Verified screenshots |
| `SOURCES.md` | Source documentation |

---

## Key Rules
- ✅ Always verify supply via Etherscan API
- ✅ Use API → HTML for screenshots (not web)
- ✅ Include 10+ sources with APA references
- ❌ Never commit API keys or tokens
- ❌ Trust CoinMarketCap circulating supply

---

**Full workflow:** [WORKFLOW.md](./WORKFLOW.md)
