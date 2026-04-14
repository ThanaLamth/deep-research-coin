require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = -1003958337967;

const summary = `💎 *ETHER.FI (ETHFI) - Hidden Gem #2*

💰 *Price:* $0.4384 (+7.12%)
📊 *MCap:* $345.2M | *FDV:* $438.48M
📉 *ATH:* $8.57 | *ATL:* $0.3621
🔴 *Current vs ATH:* -94.9% (CATASTROPHIC DROP)
✅ *Circulating:* 787M/1B (78.7% - HIGH)
🔒 *Locked:* 21.3% - LOW dilution risk
🔥 *Vol/MCap:* 8.83% - HEALTHY

🚀 *POSITIVE:*
✅ 78.7% circulating - minimal unlock risk
✅ FDV/MCAP only 1.27x - price is 'real'
✅ Binance Launchpool backing
✅ EigenLayer/restaking ecosystem
✅ 4 reward streams (ETH staking + loyalty + restaking + DeFi)
✅ 95% below ATH - COULD be deep value

⚠️ *RISKS:*
🔴 95% below ATH ($8.57 → $0.44) - WHY?
🟡 CertiK security rating 3.9/10
🟡 Fierce competition (Lido, Renzo, Puffer)
🟡 No unique moat vs competitors
🟡 Past domain security incident

🎯 *KEY LEVELS:*
• Resistance: $0.50 (+14%) | $0.65 (+48%)
• Support: $0.40 (-9%) | ATL $0.3621 (-17%)

💡 *VERDICT:*
DEEP VALUE or VALUE TRAP?
- If restaking narrative returns → $0.50-$0.65
- If narrative dies further → $0.30 or lower
- Risk/Reward: 1:1 to 1:2.8 (slightly favorable)

📄 *Full Report:* https://github.com/ThanaLamth/deep-research-coin/blob/main/ETHFI-analysis.md`;

bot.sendMessage(chatId, summary, { parse_mode: 'Markdown', disable_web_page_preview: true })
  .then(() => {
    console.log('✅ Sent ETHFI summary to Telegram!');
    bot.stopPolling();
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    bot.stopPolling();
  });
