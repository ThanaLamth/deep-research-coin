// Send DEXE research results to Telegram
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Get chat ID - send /start to bot first to get your ID
// Or use @userinfobot to get your ID
async function getMyChatId() {
    const updates = await bot.getUpdates();
    if (updates.length > 0) {
        return updates[updates.length - 1].message.chat.id;
    }
    throw new Error('No chat ID found. First message the bot on Telegram or use @userinfobot');
}

async function sendResearchResults() {
    try {
        // Get chat ID from recent updates
        const chatId = await getMyChatId();
        console.log(`Sending to chat ID: ${chatId}`);

        // Read the research report
        const reportPath = path.join(__dirname, 'research-output', 'dexe-analysis-2026-04-15.md');
        const report = fs.readFileSync(reportPath, 'utf8');

        // Send summary message
        const summary = `🔍 *DEXE Research Complete*

💰 *Price:* $12.08
📈 *24h:* +19.94%
💵 *MCap:* $1.01B
📊 *Volume:* $35.31M
🏆 *Rank:* #55

🚀 *ROOT CAUSES:*
1. Extreme Volume/MCap Ratio
2. Supply Structure

⚠️ *RED FLAGS:*
• Extreme Volume/MCap Ratio

✅ *POSITIVES:*
• On-Chain Supply Verified
• Strong Price Momentum

🔴 *HIGH RISK*
📉 *Expected:* 30-50% correction possible
💡 *Risk/Reward:* POOR TO MODERATE 🟡

📊 *Viability:* 0/100 (Grade D - TRÁNH)
🎯 *Pump Probability:* 18% (LOW)`;

        await bot.sendMessage(chatId, summary, { parse_mode: 'Markdown' });

        // Send PDF file
        const pdfPath = path.join(__dirname, 'research-output', 'dexe-analysis-2026-04-15.pdf');
        
        await bot.sendDocument(chatId, pdfPath, {
            caption: '📄 *DEXE Full Research Report*\n\n' +
                     '• Market Data Overview\n' +
                     '• On-Chain Analysis\n' +
                     '• Root Causes\n' +
                     '• Fundamental Analysis\n' +
                     '• Project Viability\n' +
                     '• Price Prediction\n' +
                     '• Risk Assessment\n' +
                     '• Recommendations\n' +
                     '• Pattern Matching\n\n' +
                     '_Generated: 2026-04-15_',
            parse_mode: 'Markdown'
        });

        console.log('✅ Research results sent to Telegram!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('No chat ID')) {
            console.log('\n💡 To fix this:');
            console.log('1. Open Telegram and find @topcmc_bot');
            console.log('2. Send /start to the bot');
            console.log('3. Run this script again');
            console.log('\nOR use @userinfobot to get your chat ID and edit this script');
        }
        
        process.exit(1);
    }
}

sendResearchResults();
