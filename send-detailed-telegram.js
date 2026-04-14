require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = -1003958337967;

// MONAD detailed message with code block tables
const monadMsg = `🔍 *MONAD (MON) - Full Analysis*

📊 *Market Data Overview*
\`\`\`
Metric           Value              Status
─────────────────────────────────────
Price            $0.03662           ✅ Verified
24h Change       +8.29%             ✅ Verified
Market Cap       $433.08M           ✅ Verified
FDV              $3.68B             ✅ Verified
24h Volume       $112.65M           ✅ Healthy
Vol/MCap         26.01%             ✅ Trading
ATH              $0.04876           Nov 26, 2025
ATL              $0.01615           Feb 06, 2026
vs ATH           -24.9%             🟡 Below
vs ATL           +126.7%            🟢 Above
Circulating      11.82B (11.7%)     ⚠️ Low float
Total Supply     100.68B            ✅ Verified
Locked           ~88.88B (88.3%)    🔴 High lock
Rank             #88                ✅ Verified
\`\`\`

📈 *Price History (IDO → Listing → ATH → Hiện tại)*
\`\`\`
Stage     Price        Date          Change      Notes
──────────────────────────────────────────────────────
🎯 IDO    $0.025       Nov 17, 2025  —           Fjord Foundry + Coinbase
🏪 List   $0.028-0.032 Nov 24, 2025  +12-28%     Above IDO price
🚀 ATH    $0.04876     Nov 26, 2025  +52-74%     Peak hype, NYSE
💧 ATL    $0.01615     Feb 06, 2026  -67%        Post-hype dump
📊 Now    $0.03662     Apr 14, 2026  +46% IDO    Recovering
\`\`\`

📊 *Analysis*
\`\`\`
Metric          Value     Assessment
────────────────────────────────────────
IDO → Current   +46.5%    🟢 Profitable
IDO → ATH       +95%      🟡 Near 2x
ATH → Current   -24.9%    🔴 Below peak
ATL → Current   +126.7%   🟢 Strong recovery
Current vs IDO  1.46x     🟢 Healthy
\`\`\`

🔑 *Key Insights:*
1. IDO buyers still +46.5% profit ✅
2. ATH was only 2 days after listing = pump-and-dump
3. Recovered 127% from ATL = strong momentum
4. Current 46% above IDO = sustained demand
5. Break ATH ($0.049) → target $0.06-$0.08 (2-3x IDO)

⚠️ *CRITICAL WARNING:*
Nov 24, 2026: 16.8B MON unlock (142% of circulating)
→ Price could drop: $0.03662 × (11.82B / 28.62B) = *$0.0151 (-59%)*
→ If NYSE + ecosystem growth → impact may be less
→ THIS IS THE #1 RISK for long-term holders

💰 *Tokenomics*
\`\`\`
Allocation         %      Amount    Vesting
────────────────────────────────────────────
Ecosystem          38.5%  38.5B     Gradual
Team/Insiders      27%    27B       Cliff + vest
Investors          20%    20B       Cliff + vest
Community          14.5%  14.5B     Distributed
\`\`\`
🔴 Team + Investors = 47% - HIGH insider allocation

🔒 *Next Major Unlock*
\`\`\`
Date          Amount     % Circ    Value
────────────────────────────────────────
Nov 24, 2026  16.8B MON  142%      $629.86M
Late 2026     >50% unlock  —       —
\`\`\`
⚠️ Impact: 142% supply increase = MASSIVE shock expected

🏦 *Backers:* Paradigm, Coinbase Ventures, Electric Capital
👥 *Team:* Ex-Jump Trading engineers
💵 *Raised:* $431M total (144% oversubscribed)

📄 *Full Report:* https://github.com/ThanaLamth/deep-research-coin/blob/main/MONAD-analysis.md`;

bot.sendMessage(chatId, monadMsg, { parse_mode: 'Markdown', disable_web_page_preview: true })
  .then(() => {
    console.log('✅ Sent MONAD to Telegram!');
    // Wait 2 seconds then send ETHFI
    setTimeout(() => {
      const ethfiMsg = `🔍 *ETHER.FI (ETHFI) - Full Analysis*

📊 *Market Data Overview*
\`\`\`
Metric           Value              Status
─────────────────────────────────────
Price            $0.4384            ✅ Verified
24h Change       +7.12%             ✅ Verified
Market Cap       $345.2M            ✅ Verified
FDV              $438.48M           ✅ Verified
24h Volume       $30.49M            ✅ Healthy
Vol/MCap         8.83%              ✅ Trading
ATH              $8.57              Mar 27, 2024
ATL              $0.3621            Oct 10, 2025
vs ATH           -94.9%             🔴 CATASTROPHIC
vs ATL           +21.1%             🟢 Recovery
Circulating      787.26M (78.7%)    ✅ High
Locked           212.74M (21.3%)    ✅ Low dilution
FDV/MCAP         1.27x              ✅ Low risk
\`\`\`

📈 *Price History (IEO → Listing → ATH → Hiện tại)*
\`\`\`
Stage     Price        Date          Change      Notes
──────────────────────────────────────────────────────
🎯 IEO    $3.00        Mar 14-18     —           Binance Launchpool
🏪 List   $3.50-4.00   Mar 18, 2024  +17-33%     Above IEO
🚀 ATH    $8.57        Mar 27, 2024  +114-145%   Restaking peak
💧 ATL    $0.3621      Oct 10, 2025  -96%        Narrative death
📊 Now    $0.4384      Apr 14, 2026  -85% IEO    Devastating
\`\`\`

📊 *Analysis*
\`\`\`
Metric          Value     Assessment
────────────────────────────────────────
IEO → Current   -85.4%    🔴 Catastrophic
IEO → ATH       +186%     🟡 2.8x peak
ATH → Current   -94.9%    🔴 Value destroyed
ATL → Current   +21.1%    🟢 Slight recovery
Current vs IEO  0.146x    🔴 85% below
\`\`\`

🔑 *Key Insights:*
1. IEO buyers LOST 85% - devastating for Launchpool
2. ATH was only 9 days after listing = classic pump
3. Dumped -96% from ATH = narrative completely died
4. Current 85% below IEO ($3.00) - NO recovery yet
5. $50M buyback proposed below $3 but FAILED

⚠️ *What This Means:*
• NOT deep value - 95% drop is REAL fundamental decline
• Restaking narrative peaked Mar 2024, NEVER recovered
• ATH $8.57 likely NEVER seen again
• Realistic target: $0.50-$0.65 (still 78-83% below ATH)

💰 *Valuation Check*
\`\`\`
Metric                  Value
────────────────────────────────
Current MCap            $345M
Current Price           $0.4384
IEO Price               $3.00
Fair Value (IEO)        $3.00 = 6.8x from now
Fair Value (50% ATH)    $4.28 = 9.8x from now
MCap for IEO            $3B (need 8.7x)
MCap for ATH            $8.57B (need 24.8x)
\`\`\`
❓ Can ETHFI grow 8-25x to justify?

💰 *Tokenomics*
\`\`\`
Total Supply     1B ETHFI (capped)
Circulating      787.26M (78.7%)  ✅ High
Locked           212.74M (21.3%)  ✅ Low dilution
FDV/MCAP         1.27x            ✅ Low risk
\`\`\`

🎁 *4 Reward Streams:*
1. ETH staking rewards
2. ether.fi Loyalty Points
3. Restaking rewards (EigenLayer)
4. DeFi liquidity provision

⚠️ *Risks:*
🔴 95% below ATH - WHY?
🟡 CertiK security: 3.9/10
🟡 Competition: Lido, Renzo, Puffer
🟡 No unique moat
🟡 Past domain security incident
🟡 EigenLayer dependency

📊 *Verdict:*
DEEP VALUE or VALUE TRAP?
- If restaking returns → $0.50-$0.65 (+14% to +48%)
- If narrative dies → $0.30 or lower
- Risk/Reward: 1:1 to 1:2.8 (slightly favorable)

📄 *Full Report:* https://github.com/ThanaLamth/deep-research-coin/blob/main/ETHFI-analysis.md`;

      bot.sendMessage(chatId, ethfiMsg, { parse_mode: 'Markdown', disable_web_page_preview: true })
        .then(() => {
          console.log('✅ Sent ETHFI to Telegram!');
          bot.stopPolling();
        })
        .catch(e => {
          console.error('❌ Error ETHFI:', e.message);
          bot.stopPolling();
        });
    }, 2000);
  })
  .catch(e => {
    console.error('❌ Error MONAD:', e.message);
    bot.stopPolling();
  });
