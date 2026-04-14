require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = -1003958337967;

// MONAD on-chain message (shorter)
const monadOnchain = `🔗 *MONAD - On-Chain Analysis*

⚠️ MON is on Solana blockchain
Contract: \`CrAr4R...7FreP2\`

📊 *On-Chain Metrics:*
\`\`\`
Metric                Value
─────────────────────────────
Blockchain            Solana
Total Supply          100.68B MON
Circulating           11.82B (11.7%)
Top 10 Wallets        42% of supply
Holders (reported)    7.02K+
Unique Holders        ~3.8K (est.)
\`\`\`

🐋 *Whale Concentration:*
\`\`\`
Holder Tier    % Supply    Risk
───────────────────────────────
Top 10         42%         🔴 HIGH
Top 50         ~65%        🟡 MEDIUM
Retail         ~22%        🟢 LOW
\`\`\`

🔑 *Key Observations:*

1. *Top 10 control 42%* - HIGH centralization
   - Bitcoin top 10 = ~6%, ETH = ~15%
   - MONAD 42% = very concentrated
   - Risk: Coordinated selling possible

2. *Low holder count (~7K)* for $433M MCap
   - Healthy projects: 50K+ holders
   - Suggests early stage or concentrated

3. *No major exchange dumps yet*
   - Whales not aggressively selling YET
   - BUT Nov 2026 unlock will change this

⚠️ *On-Chain Risk:*
\`\`\`
Risk Factor            Severity
───────────────────────────────
Top 10 control 42%     🔴 HIGH
Low holder count       🟡 MEDIUM
Unlock Nov 2026 142%   🔴 CRITICAL
No exchange dump yet   🟢 OK
\`\`\`

🔗 *Solscan:* https://solscan.io/token/CrAr4RRJMBVwRsZtT62pEhfA9H5utymC2mVx8e7FreP2

---

🔗 *ETHER.FI (ETHFI) - On-Chain*

✅ Network: Ethereum (ERC-20)
Contract: \`0xfe0c3006...F9F9Cc0eB\`
Etherscan: https://etherscan.io/token/0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb

📊 *On-Chain Metrics:*
\`\`\`
Metric                Value
─────────────────────────────
Blockchain            Ethereum
Total Supply          1B ETHFI
Circulating           787.26M (78.7%) ✅
Recent Transfers      ~588K (historical)
Staking Contract      Active ✅
Multi-chain           ETH + Arbitrum
\`\`\`

🔑 *Key Observations:*

1. *No major whale movements*
   - Recent transfers small (<0.1M)
   - Whales holding or already exited

2. *78.7% circulating = LOW unlock risk*
   - Most tokens already in market
   - Compare MON: only 11.7% circulating

3. *Staking contract active:*
   - 4 reward streams incentivize holding
   - Reduces circulating supply pressure
   - Also on Arbitrum

⚠️ *On-Chain Risk:*
\`\`\`
Risk Factor            Severity
───────────────────────────────
Low whale activity     🟢 LOW
High circulating       🟢 LOW
Staking active         🟢 POSITIVE
CertiK 3.9/10          🟡 MEDIUM
\`\`\`

🔗 *Etherscan:* https://etherscan.io/token/0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb

---

📊 *On-Chain Comparison:*
\`\`\`
Metric         MONAD      ETHFI
────────────────────────────────
Chain          Solana     Ethereum
Circulating    11.7% 🔴   78.7% ✅
Top 10         42% 🔴     N/A 🟡
Unlock Risk    142% 🔴    21.3% ✅
Staking        No         Yes ✅
\`\`\`

🏆 *Verdict:*
• MONAD: HIGH on-chain risk (concentration + unlock)
• ETHFI: LOW on-chain risk (high circulating + staking)`;

bot.sendMessage(chatId, monadOnchain, { parse_mode: 'Markdown', disable_web_page_preview: true })
  .then(() => {
    console.log('✅ Sent on-chain analysis to Telegram!');
    bot.stopPolling();
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    bot.stopPolling();
  });
