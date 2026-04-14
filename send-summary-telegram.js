require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = -1003958337967;

const summary = `🔍 *ZAMA (Zama Protocol) - Deep Research Summary*

💰 *Price:* $0.02973 (+14.74%)
📊 *MCap:* $65.42M | *FDV:* $327.1M
🔥 *Vol/MCap:* 161.76% (8-32x NORMAL!)
📉 *ATH:* $0.04174 | *ATL:* $0.0167
🔒 *Circulating:* 2.2B/11B (20% Low Float)

🐋 *ON-CHAIN WHALE ALERT:*
• Whale 0x0d07 (13,651 ETH = ~$41M) DUMPING
• 2.27M ZAMA distributed in 0.8 HOURS
• 19 outgoing transfers → RAPID SELLING
• Aggregator → Exchange flow CONFIRMED

💸 *VERIFIED TX LINKS:*
1. 670K ZAMA → 0x2d33... | [View Tx](https://etherscan.io/tx/0x3e0a75f189e310a58df9fe0d6334b56eef67c55031cd60ed2eb22e0c86bab92c)
2. 502K ZAMA → 0x72bb... | [View Tx](https://etherscan.io/tx/0x39c5302b47e5766fe4b21928ebb7f878439b15e16f79ed79ca78e0dc3337325e)
3. 503K ZAMA → 0x5c97... | [View Tx](https://etherscan.io/tx/0x267d7583d64e7dcf9b2b680ebf5c55290f41f82fd05c0157ca001b94db467c7f)
4. 252K ZAMA → 0xc5fe... | [View Tx](https://etherscan.io/tx/0x2608bc2a8123928556953803c60a8cb687c2dd7317fc43ecbcaaad0a7634339c)
5. 237K ZAMA → 0x2086... | [View Tx](https://etherscan.io/tx/0xe3f9b417b450c37a9451ec6ca707aed6b6a0b70cbd8301f25aa9354f7c2c0e96)
6. 192K ZAMA → 0xe92e... | [View Tx](https://etherscan.io/tx/0xb7b76bedb5ae8dbfe490dd4dbed32db8b7ef007500dd76b633446523ac62d1dd)
...and 4 more verified transactions

🔑 *KEY FINDINGS:*
✅ Legit project: PhD team, live mainnet, $121M TVS
✅ Fair launch: Dutch auction 218% oversubscribed
✅ FHE technology pioneer (first-mover)
🔴 WHALE DUMPING CONFIRMED (2.27M ZAMA)
🔴 Trading 40% below auction ($0.05 → $0.03)
🔴 Monthly unlocks = 114.6M selling pressure
🔴 161% vol/mcap = extreme speculation

📰 *CATALYSTS:*
• Binance, Bybit, Phemex, Coinbase listed ✅
• GSR (Market Maker) partnership
• T-REX Ledger integration (RWA)
• Developer Console coming Q2/2026
• 1,000 TPS target 2026

💰 *TOKENOMICS:*
• 8 allocations (Team 20%, VCs 20%, Treasury 20%)
• 77.9% locked (vesting until 2031)
• Next unlock: May 2 = 114.6M (4.7% MCAP)

🔮 *PRICE TARGETS:*
• Resistance: $0.035 (+18%) | $0.04174 ATH (+40%)
• Support: $0.025 (-16%) | $0.0167 ATL (-44%)

⚠️ *VERDICT:*
CLASSIC PUMP & DUMP WITH ON-CHAIN CONFIRMATION
• Whale actively dumping (verified)
• Aggregator → Exchange selling active
• Low float amplifying volatility

📄 *Full Report:* https://github.com/ThanaLamth/deep-research-coin/blob/main/ZAMA-analysis.md
🇻🇳 *Tiếng Việt:* https://github.com/ThanaLamth/deep-research-coin/blob/main/ZAMA-analysis-VI.md`;

bot.sendMessage(chatId, summary, { parse_mode: 'Markdown', disable_web_page_preview: true })
  .then(() => {
    console.log('✅ Sent summary to Telegram!');
    bot.stopPolling();
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    bot.stopPolling();
  });
