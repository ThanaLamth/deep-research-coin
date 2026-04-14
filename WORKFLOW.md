# 🚀 Crypto Deep Research Workflow

> Complete workflow for researching cryptocurrency tokens with on-chain verification, creating Coindesk-style reports, and publishing to WordPress.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Web Research](#phase-1-web-research)
4. [Phase 2: On-Chain Verification](#phase-2-on-chain-verification)
5. [Phase 3: Screenshot Capture](#phase-3-screenshot-capture)
6. [Phase 4: Report Generation](#phase-4-report-generation)
7. [Phase 5: PDF Export](#phase-5-pdf-export)
8. [Phase 6: WordPress Export](#phase-6-wordpress-export)
9. [Phase 7: Push to GitHub](#phase-7-push-to-github)
10. [Tools & Scripts](#tools--scripts)
11. [Lessons Learned](#lessons-learned)

---

## 📖 Overview

This workflow transforms a simple token URL into a **professional research report** with:
- ✅ Web research from multiple sources
- ✅ On-chain data verification via Etherscan API
- ✅ Verified screenshots (API-generated for blocked sites)
- ✅ Coindesk-style journalistic report
- ✅ SEO-optimized HTML
- ✅ PDF export
- ✅ WordPress-ready format
- ✅ Full source documentation

---

## 🛠️ Prerequisites

### Required APIs & Keys
| Service | Purpose | Get Key |
|---------|---------|---------|
| **Etherscan API** | On-chain data verification | https://etherscan.io/myapikey |
| **2Captcha** (optional) | Captcha solving for screenshots | https://2captcha.com/enterpage |
| **OMO Captcha** (optional) | Alternative captcha solver | https://omocaptcha.com |

### Required Software
```bash
# Node.js (v18+)
node --version

# npm packages
npm install puppeteer

# Optional: for PDF conversion
npx puppeteer-pdf --help
```

### GitHub Token
- Create a Personal Access Token with `repo` scope
- ⚠️ **NEVER commit tokens** - use `.gitignore` and remove from `package.json`

---

## Phase 1: Web Research

### 1.1 Gather Token Information
Start with the token's CoinMarketCap or CoinGecko page:
- Current price, market cap, volume
- Circulating supply, total supply
- Project description
- Contract address

### 1.2 Search for News & Analysis
```
Search queries:
- "[TOKEN] price pump [month] [year] news"
- "[TOKEN] on-chain whale analysis"
- "[TOKEN] fundamentals tokenomics [year]"
- "[TOKEN] new listing exchange announcement"
```

### 1.3 Collect Sources
Create a sources table with:
- Source name
- URL
- Key findings/data points
- Date published

### Example Tools Used:
- `web_search` - Google/Bing search
- `web_fetch` - Extract content from URLs
- Multiple sources for cross-verification

---

## Phase 2: On-Chain Verification

### 2.1 Etherscan API Setup
```javascript
const ETHERSCAN_API_KEY = 'your_api_key';
const CONTRACT_ADDRESS = '0x...';
const BASE_URL = 'https://api.etherscan.io/v2/api';
```

### 2.2 Key API Endpoints

| Purpose | Endpoint |
|---------|----------|
| Token Supply | `/v2/api?chainid=1&module=stats&action=tokensupply&contractaddress={ADDRESS}&apikey={KEY}` |
| Wallet Balance | `/v2/api?chainid=1&module=account&action=balance&address={ADDRESS}&apikey={KEY}` |
| ERC20 Transfers | `/v2/api?chainid=1&module=account&action=tokentx&contractaddress={ADDRESS}&address={WALLET}&page=1&offset=10&sort=desc&apikey={KEY}` |
| Contract ABI | `/v2/api?chainid=1&module=contract&action=getabi&address={ADDRESS}&apikey={KEY}` |

### 2.3 Verification Checklist
- [ ] Verify total supply matches reported circulating supply
- [ ] Identify whale wallets (large ETH balance)
- [ ] Track token flows between wallets
- [ ] Check for active minting vs locked supply
- [ ] Identify aggregator/distributor wallets
- [ ] Map whale → exchange distribution path

### 2.4 Data Verification Script
```javascript
// Fetch multiple data points in parallel
const [supplyRes, whaleBalanceRes, transfersRes] = await Promise.all([
  fetch(supplyUrl),
  fetch(whaleUrl),
  fetch(transfersUrl)
]);

const supplyData = await supplyRes.json();
const whaleBalance = await whaleBalanceRes.json();
const transfers = await transfersRes.json();
```

---

## Phase 3: Screenshot Capture

### 3.1 The Problem
Most crypto sites (Etherscan, CoinGecko) use **Cloudflare Turnstile** which blocks headless browsers.

### 3.2 Solutions Attempted

| Method | Status | Notes |
|--------|--------|-------|
| **Direct Puppeteer** | ❌ Blocked | Cloudflare detects headless |
| **OMO Captcha API** | ❌ Failed | No sitekey found for Turnstile invisible |
| **2Captcha API** | ❌ Failed | Turnstile invisible has no sitekey |
| **CF Auto-Resolve Wait** | ❌ Failed | Doesn't auto-resolve in headless |
| **✅ API → HTML Render** | ✅ **WORKS** | Bypass web entirely |

### 3.3 Working Approach: API → HTML

Instead of trying to screenshot blocked websites:

1. **Fetch data via API** (Etherscan API has no Cloudflare)
2. **Generate HTML page** with the real data
3. **Screenshot the HTML** (no captcha needed)

```javascript
// 1. Fetch real data
const supplyData = await fetch(etherscanApiUrl).then(r => r.json());

// 2. Create HTML with the data
const html = `
  <html>
  <head><title>Etherscan - Token Supply</title></head>
  <body>
    <div class="header">🔍 Etherscan - Verified Data</div>
    <table>
      <tr><th>Total Supply</th><td>${supplyData.result}</td></tr>
      <tr><th>Source</th><td>Etherscan API v2</td></tr>
    </table>
  </body>
  </html>
`;

// 3. Screenshot the generated HTML
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.screenshot({ path: 'output.png' });
```

### 3.4 Sites That Work Normally
- ✅ **CoinMarketCap** - Usually works with Puppeteer
- ⚠️ **CoinGecko** - Sometimes blocked by Cloudflare
- ❌ **Etherscan** - Always blocked by Cloudflare Turnstile

### 3.5 Screenshot Scripts Repository

| Script | Purpose | Status |
|--------|---------|--------|
| `screenshots.js` | Basic Puppeteer | ❌ Blocked |
| `screenshots-omo.js` | OMO captcha solver | ❌ No sitekey |
| `screenshots-2captcha.js` | 2Captcha integration | ❌ Turnstile invisible |
| `screenshots-cf.js` | CF auto-resolve attempt | ❌ Doesn't work |
| **`screenshots-api.js`** | **API → HTML → Screenshot** | ✅ **WORKS** |

---

## Phase 4: Report Generation

### 4.1 Coindesk-Style Report Structure

```html
<!DOCTYPE html>
<html>
<head>
  <!-- SEO Meta Tags -->
  <meta name="description" content="...">
  <meta name="keywords" content="...">
  <meta property="og:title" content="...">
  <meta property="og:type" content="article">
  
  <!-- Coindesk-style CSS -->
  <style>
    /* Professional journalism styling */
  </style>
</head>
<body>
  <!-- Header -->
  <header class="report-header">
    <div class="site-name">Deep Research Coin</div>
    <div class="category">Exclusive Research</div>
    <h1 class="article-title">...</h1>
    <p class="article-subtitle">...</p>
    <div class="article-meta">
      <span class="author">By ...</span>
      <span>Date</span>
    </div>
  </header>

  <!-- Key Points Box -->
  <div class="key-points">
    <h3>Key Points</h3>
    <ul>...</ul>
  </div>

  <!-- Article Body -->
  <h2>Section Title</h2>
  <p>Lede paragraph with key stats...</p>
  
  <!-- Images with captions -->
  <figure>
    <img src="images/..." alt="...">
    <figcaption>Source: <a href="...">Etherscan</a></figcaption>
  </figure>

  <!-- Data Tables -->
  <table>...</table>

  <!-- Callout Boxes -->
  <div class="callout">...</div>

  <!-- Blockquotes -->
  <blockquote>
    "Quote text"
    <cite>— Source</cite>
  </blockquote>

  <!-- References (APA Style) -->
  <div class="references">
    <h2>References</h2>
    <ol>
      <li>Author. (Date). <em>Title</em>. URL</li>
    </ol>
  </div>

  <!-- Disclosure -->
  <div class="disclosure">
    <strong>Disclosure:</strong> ...
  </div>
</body>
</html>
```

### 4.2 SEO Checklist
- [ ] Meta description (150-160 characters)
- [ ] Meta keywords (5-10 relevant terms)
- [ ] Open Graph tags (og:title, og:description, og:type)
- [ ] Canonical URL
- [ ] H1 → H2 → H3 hierarchy
- [ ] Alt text on all images
- [ ] Internal/external links
- [ ] Schema markup (optional)

### 4.3 Image Sourcing
Use **GitHub raw URLs** for images in reports:
```
https://raw.githubusercontent.com/USER/REPO/main/images/FILENAME.png
```

---

## Phase 5: PDF Export

### 5.1 Using Puppeteer-PDF
```bash
npx puppeteer-pdf "input.html" -p "output.pdf" \
  -w "210mm" -h "297mm" \
  -mt "15mm" -mr "20mm" -mb "15mm" -ml "20mm" \
  -pb
```

### 5.2 PDF CSS Best Practices
```css
@page {
  size: A4;
  margin: 2cm 2.5cm;
  @top-right {
    content: "Document Title";
    font-size: 8pt;
    color: #999;
  }
  @bottom-center {
    content: "Page " counter(page);
  }
}

/* Prevent page breaks inside elements */
figure, table, .callout {
  page-break-inside: avoid;
}

/* Control page breaks before headings */
h1, h2 {
  page-break-after: avoid;
}
```

---

## Phase 6: WordPress Export

### 6.1 WordPress-Ready HTML Format

The HTML file should use **WordPress native classes**:

```html
<!-- Images -->
<figure class="wp-block-image size-large">
  <img src="https://raw.githubusercontent.com/..." alt="...">
  <figcaption>Source: <a href="...">Etherscan</a></figcaption>
</figure>

<!-- Tables -->
<table class="wp-block-table">
  <thead><tr><th>...</th></tr></thead>
  <tbody><tr><td>...</td></tr></tbody>
</table>

<!-- Blockquotes -->
<blockquote class="wp-block-quote">
  <p>Quote text</p>
  <cite>— Source</cite>
</blockquote>
```

### 6.2 How to Paste into WordPress

**Method A: Classic Editor**
1. Posts → Add New
2. Switch to **"Text"** tab
3. Paste entire HTML
4. Publish

**Method B: Gutenberg Editor**
1. Posts → Add New
2. Add **"Custom HTML"** block
3. Paste entire HTML
4. Preview → Publish

**Method C: Code Editor**
1. Open post
2. Click ⋮ → **"Code Editor"**
3. Paste HTML
4. Return to **"Visual Editor"**

---

## Phase 7: Push to GitHub

### 7.1 Initialize & Commit
```bash
cd project-folder
git init
git add .
git config user.email "your@email.com"
git config user.name "YourName"
git commit -m "feat: add research report with verified data"
```

### 7.2 Connect Remote & Push
```bash
# ⚠️ DO NOT include token in URL
git remote add origin https://github.com/USER/REPO.git
git branch -M main
git push -u origin main
```

### 7.3 Security: Remove Tokens
If you accidentally committed a token:

```bash
# 1. Fix the file (remove token)
# 2. Amend commit
git add .
git commit --amend -m "new message"

# 3. Force push
git push origin main --force
```

### 7.4 .gitignore Template
```gitignore
node_modules/
package-lock.json
*.env
.env.local
```

---

## 🛠️ Tools & Scripts

### File Structure
```
deep-research-coin/
├── RAVE-analysis.md              # Initial analysis
├── RAVE-Research-Report.html     # Technical report (HTML)
├── RAVE-Research-Report.pdf      # Technical report (PDF)
├── RAVE-Deep-Research-Coindesk.html  # Coindesk-style report
├── RAVE-Deep-Research-Coindesk.pdf   # Coindesk-style PDF
├── RAVE-WordPress.html           # WordPress-ready HTML
├── ONCHAIN-VERIFICATION.md       # Full Etherscan links
├── SOURCES.md                    # Research sources
├── README.md                     # Project overview
├── images/
│   ├── coinmarketcap-price.png
│   ├── coingecko-chart.png
│   ├── etherscan-total-supply.png
│   ├── etherscan-whale-wallet.png
│   ├── etherscan-whale-transfers.png
│   └── etherscan-aggregator.png
└── scripts/
    ├── screenshots.js            # Direct Puppeteer (blocked)
    ├── screenshots-omo.js        # OMO captcha (failed)
    ├── screenshots-2captcha.js   # 2Captcha (failed)
    ├── screenshots-cf.js         # CF bypass (failed)
    └── screenshots-api.js        # API → HTML (✅ WORKS)
```

---

## 📚 Lessons Learned

### ✅ What Worked
1. **Etherscan API** - Reliable, no Cloudflare blocking
2. **API → HTML → Screenshot** - Best approach for blocked sites
3. **Parallel API calls** - Faster data collection
4. **GitHub raw URLs** - Works for images in reports
5. **Puppeteer-PDF** - Good PDF generation
6. **Multiple source verification** - Cross-check data

### ❌ What Didn't Work
1. **Direct Puppeteer on Etherscan** - Always blocked by Turnstile
2. **OMO Captcha API** - Couldn't find sitekey for invisible Turnstile
3. **2Captcha Turnstile** - Same issue, no sitekey exposed
4. **Cloudflare auto-resolve wait** - Doesn't work in headless
5. **Committing tokens in package.json** - GitHub secret scanning blocks push

### 🔑 Key Insights
- **CoinMarketCap circulating supply can be WRONG** - Always verify on-chain
- **97.76% minted, but 76% locked for vesting** - Circulating supply ~24.8% is CORRECT
- **Whale distribution patterns are visible on-chain** - Follow the money
- **API data > Web screenshots** - More reliable, verifiable, and reproducible
- **Never expose API keys** - GitHub will block your push
- **Vesting schedules matter** - Locked tokens affect future supply pressure

---

## 🚀 Quick Start Template

```bash
# 1. Setup
mkdir my-research && cd my-research
npm init -y && npm install puppeteer
mkdir images

# 2. Research
# - Use web_search for news
# - Use web_fetch for articles
# - Collect 10+ sources

# 3. On-Chain Verification
# - Get contract address from CMC
# - Query Etherscan API for supply
# - Identify whale wallets
# - Track token flows

# 4. Screenshots
node screenshots-api.js

# 5. Generate Reports
# - Create Coindesk-style HTML
# - Add images with GitHub raw URLs
# - Include APA references

# 6. Export
npx puppeteer-pdf report.html -p report.pdf -w 210mm -h 297mm -pb

# 7. WordPress
# - Convert to WordPress HTML format
# - Use wp-block-image, wp-block-table classes

# 8. Push to GitHub
git init && git add .
git commit -m "feat: add research report"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

---

## 📊 Output Checklist

For each research report, ensure you have:

- [ ] `TOKEN-analysis.md` - Initial analysis
- [ ] `TOKEN-Research-Report.pdf` - Full technical report
- [ ] `TOKEN-Deep-Research-Coindesk.pdf` - Journalistic report
- [ ] `TOKEN-WordPress.html` - WordPress-ready format
- [ ] `images/` folder with 5+ screenshots
- [ ] `SOURCES.md` - Complete source documentation
- [ ] All external links working
- [ ] APA references (10+ sources)
- [ ] No exposed API keys or tokens

---

**Last Updated:** April 13, 2026  
**Author:** Deep Research Coin  
**Repository:** https://github.com/ThanaLamth/deep-research-coin
