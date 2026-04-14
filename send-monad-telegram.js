require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = -1003958337967;

const summary = `🔍 *MONAD (MON) - Hidden Gem Research*

💰 *Price:* $0.03662 (+8.29%)
📊 *MCap:* $433.08M | *FDV:* $3.68B
📈 *ATH:* $0.04876 (-24.9%) | *ATL:* $0.01615
🔒 *Circulating:* 11.82B/100B (11.7% Low Float!)
🔥 *Vol/MCap:* 26.01% - HEALTHY trading

🚀 *WHY IT'S A GEM:*
✅ NYSE PARTNERSHIP - surged 25% on announcement
✅ Top backers: Paradigm, Coinbase, Electric Capital
✅ Ex-Jump Trading team (HFT expertise)
✅ 10,000 TPS + EVM compatible
✅ $431M raised (144% oversubscribed)
✅ Below ATH by 25% - room to recover

💰 *TOKENOMICS:*
• Team/Insiders: 47% (27B + 20B)
• Ecosystem: 38.5% (38.5B)
• Community: 14.5% (14.5B)
• 88.3% LOCKED = artificial scarcity

⚠️ *CRITICAL RISK:*
🔴 NOV 24, 2026 - 16.8B MON unlock
   = 142% of current circulating supply
   = $629.86M worth of new tokens
   = MASSIVE supply shock expected

📊 *KEY LEVELS:*
• Resistance: $0.040 (+9%) | ATH $0.04876 (+33%)
• Support: $0.033 (-10%) | $0.028 (-24%)
• Target: $0.040-$0.045 (2-4 weeks)

⏰ *TIMELINE:*
✅ NOW - Jun 2026: ACCUMULATE (NYSE momentum)
⚠️ Jul - Oct 2026: TAKE PROFITS
🚫 Nov 24, 2026: EXIT (16.8B unlock)

🎯 *VERDICT:*
SHORT-TERM: GOOD (bullish momentum + NYSE catalyst)
LONG-TERM: POOR (Nov 2026 unlock = massive dilution)

💡 *Strategy:* Trade the NYSE wave, EXIT before unlock

📄 *Full Report:* https://github.com/ThanaLamth/deep-research-coin/blob/main/MONAD-analysis.md`;

bot.sendMessage(chatId, summary, { parse_mode: 'Markdown', disable_web_page_preview: true })
  .then(() => {
    console.log('✅ Sent MONAD summary to Telegram!');
    bot.stopPolling();
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    bot.stopPolling();
  });
