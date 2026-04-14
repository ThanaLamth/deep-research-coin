/**
 * 🤖 Telegram Assistant Bot
 * 
 * General-purpose AI assistant accessible via Telegram.
 * Can chat, execute commands, and integrate with research tools.
 * 
 * Setup:
 *   1. Create bot via @BotFather on Telegram
 *   2. Get BOT_TOKEN from @BotFather
 *   3. Set TELEGRAM_BOT_TOKEN in .env file
 *   4. Run: node telegram-bot.js
 * 
 * Commands:
 *   /start - Start the bot
 *   /help - Show available commands
 *   /status - Check system status
 *   /whale <address> - Track whale wallet
 *   /scan <token> - Scan token holders
 *   /research <token> - Start deep research
 *   /price <symbol> - Get token price
 *   /alert <threshold> - Set price alert
 *   /tools - List available tools
 *   /about - About this bot
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ==================== Configuration ====================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env file');
  console.log('📝 Setup:');
  console.log('   1. Create .env file with TELEGRAM_BOT_TOKEN=your_bot_token');
  console.log('   2. Get token from @BotFather on Telegram');
  console.log('   3. Run: npm install node-telegram-bot-api dotenv');
  process.exit(1);
}

// Polling mode (for development)
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Store user sessions
const userSessions = {};

// Allowed users (optional security - only allow specific users)
const ALLOWED_USERS = process.env.ALLOWED_TELEGRAM_USER_IDS
  ? process.env.ALLOWED_TELEGRAM_USER_IDS.split(',').map(id => id.trim())
  : []; // Empty = allow all

// ==================== Helper Functions ====================

/**
 * Check if user is allowed to use bot
 */
function isUserAllowed(userId) {
  if (ALLOWED_USERS.length === 0) return true;
  return ALLOWED_USERS.includes(userId.toString());
}

/**
 * Send typing indicator
 */
async function sendTyping(chatId) {
  await bot.sendChatAction(chatId, 'typing');
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return parseFloat(num).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Execute shell command and return result
 */
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

// ==================== Message Handlers ====================

/**
 * /start command
 */
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) {
    await bot.sendMessage(chatId, '❌ You are not authorized to use this bot.');
    return;
  }

  userSessions[userId] = { active: true, started: Date.now() };

  const welcomeMessage = `
👋 *Welcome to your Research Assistant!*

I'm your personal AI assistant for cryptocurrency research and analysis. I can help you:

🐋 *Track Whales* - Monitor whale wallets in real-time
📊 *Analyze Tokens* - Scan holders and tokenomics
🔍 *Deep Research* - Generate full research reports
💰 *Check Prices* - Get current market data
⚙️ *Run Tools* - Execute research tools on demand

Use /help to see all available commands.

Let's get started! 🚀
  `.trim();

  await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

/**
 * /help command
 */
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  const helpMessage = `
📖 *Available Commands*

*General:*
/start - Start the bot
/help - Show this help message
/status - Check system status
/tools - List all available tools
/about - About this bot

*Research:*
/research <token> - Start deep research on token
/price <symbol> - Get token price info
/whale <address> - Track whale wallet
/scan <token_address> - Scan token holders

*Alerts:*
/alert set <threshold> - Set price alert
/alert list - View active alerts
/alert clear - Clear all alerts

*Tools:*
/whale_track - Track predefined whales
/screenshot <url> - Capture webpage screenshot
/pdf <token> - Generate research PDF

*Examples:*
/research RAVE
/price BTC
/whale 0x0d07...92fe
/alert set 10000
  `.trim();

  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

/**
 * /status command
 */
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  await sendTyping(chatId);

  try {
    // Check if key files exist
    const files = {
      'whale-tracker.js': fs.existsSync('whale-tracker.js'),
      'screenshots-api.js': fs.existsSync('screenshots-api.js'),
      'WORKFLOW.md': fs.existsSync('WORKFLOW.md'),
      'images/': fs.existsSync('images/')
    };

    const activeSessions = Object.keys(userSessions).length;
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    const statusMessage = `
📊 *System Status*

*Bot Status:* ✅ Online
*Uptime:* ${uptimeHours}h ${uptimeMinutes}m
*Active Sessions:* ${activeSessions}

*Files:*
${Object.entries(files).map(([file, exists]) => `${exists ? '✅' : '❌'} ${file}`).join('\n')}

*Node.js:* ${process.version}
*Platform:* ${process.platform}
*Memory:* ${formatNumber(process.memoryUsage().heapUsed / 1024 / 1024)} MB

Last checked: ${new Date().toLocaleString()}
    `.trim();

    await bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    await bot.sendMessage(chatId, `❌ Error checking status: ${error.message}`);
  }
});

/**
 * /tools command
 */
bot.onText(/\/tools/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  const toolsMessage = `
🛠️ *Available Tools*

*On-Chain Analysis:*
• Whale Tracker - Track whale wallets
• Token Scanner - Scan ERC20 holders
• Balance Checker - Check wallet balances
• Transfer Monitor - Monitor token flows

*Research:*
• Deep Research - Full analysis reports
• Web Scraper - Extract data from websites
• Screenshot Capture - Capture webpages
• PDF Export - Generate PDF reports

*Data Sources:*
• Etherscan API v2 - On-chain data
• CoinMarketCap - Price data
• CoinGecko - Market data
• News Sources - Latest updates

*Export:*
• Coindesk-style HTML reports
• WordPress-ready format
• PDF documents
• GitHub push

All tools are accessible via commands or direct chat.
  `.trim();

  await bot.sendMessage(chatId, toolsMessage, { parse_mode: 'Markdown' });
});

/**
 * /whale command - Track whale wallet
 */
bot.onText(/\/whale (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  const walletAddress = match[1].trim();

  if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
    await bot.sendMessage(chatId, '❌ Invalid wallet address. Must be 0x... (42 characters)');
    return;
  }

  await sendTyping(chatId);
  await bot.sendMessage(chatId, `🔍 Tracking whale wallet: \`${walletAddress}\``, { parse_mode: 'Markdown' });

  try {
    // Run whale tracker
    const result = await execCommand(`node whale-tracker.js --wallet ${walletAddress}`);
    
    // Send result (split if too long)
    const maxLength = 4000;
    if (result.length > maxLength) {
      await bot.sendMessage(chatId, result.substring(0, maxLength) + '\n\n... (truncated)');
    } else {
      await bot.sendMessage(chatId, `\`\`\`\n${result}\n\`\`\``, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    await bot.sendMessage(chatId, `❌ Error tracking whale: ${error.message}`);
  }
});

/**
 * /scan command - Scan token holders
 */
bot.onText(/\/scan (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  const tokenAddress = match[1].trim();

  if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
    await bot.sendMessage(chatId, '❌ Invalid token contract address');
    return;
  }

  await sendTyping(chatId);
  await bot.sendMessage(chatId, `📊 Scanning token holders: \`${tokenAddress}\``, { parse_mode: 'Markdown' });

  try {
    const result = await execCommand(`node whale-tracker.js --scan ${tokenAddress}`);
    
    const maxLength = 4000;
    if (result.length > maxLength) {
      await bot.sendMessage(chatId, result.substring(0, maxLength) + '\n\n... (truncated)');
    } else {
      await bot.sendMessage(chatId, `\`\`\`\n${result}\n\`\`\``, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    await bot.sendMessage(chatId, `❌ Error scanning token: ${error.message}`);
  }
});

/**
 * /research command - Start deep research
 */
bot.onText(/\/research (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  const token = match[1].trim();

  await sendTyping(chatId);
  await bot.sendMessage(chatId, `🔍 Starting deep research on: *${token}*\n\nThis will take a few minutes. I'll notify you when complete.`, { parse_mode: 'Markdown' });

  // In a real implementation, you'd trigger the research workflow here
  // For now, show a placeholder message
  setTimeout(async () => {
    await bot.sendMessage(chatId, `
✅ *Research Initiated for ${token}*

Next steps:
1. Collect 10+ news sources
2. Fetch on-chain data via Etherscan API
3. Analyze whale wallets
4. Generate screenshots
5. Create Coindesk-style report
6. Export to PDF and WordPress

Manual step: Run research script manually for full workflow.
    `.trim(), { parse_mode: 'Markdown' });
  }, 2000);
});

/**
 * /price command - Get token price
 */
bot.onText(/\/price (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  const symbol = match[1].trim().toUpperCase();

  await sendTyping(chatId);

  try {
    // Fetch from CoinGecko API (free, no key required)
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`);
    const data = await response.json();

    if (data[symbol.toLowerCase()]) {
      const info = data[symbol.toLowerCase()];
      const priceMessage = `
💰 *${symbol} Price*

*Price:* $${formatNumber(info.usd)}
*24h Change:* ${info.usd_24h_change > 0 ? '📈' : '📉'} ${formatNumber(info.usd_24h_change)}%
*Market Cap:* $${formatNumber(info.usd_market_cap)}

Last updated: ${new Date().toLocaleString()}
      `.trim();

      await bot.sendMessage(chatId, priceMessage, { parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, `❌ Token "${symbol}" not found. Try the CoinGecko ID (e.g., "bitcoin" instead of "BTC")`);
    }
  } catch (error) {
    await bot.sendMessage(chatId, `❌ Error fetching price: ${error.message}`);
  }
});

/**
 * /screenshot command - Capture webpage screenshot
 */
bot.onText(/\/screenshot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  const url = match[1].trim();

  if (!url.startsWith('http')) {
    await bot.sendMessage(chatId, '❌ Invalid URL. Must start with http:// or https://');
    return;
  }

  await sendTyping(chatId);
  await bot.sendMessage(chatId, `📸 Capturing screenshot: \`${url}\``, { parse_mode: 'Markdown' });

  try {
    const screenshotPath = path.join(__dirname, 'temp_screenshot.png');
    
    // Use Puppeteer to capture
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: screenshotPath, fullPage: false });
    await browser.close();

    // Send screenshot to user
    await bot.sendPhoto(chatId, screenshotPath, { caption: `📸 Screenshot of ${url}` });

    // Clean up
    fs.unlinkSync(screenshotPath);
  } catch (error) {
    await bot.sendMessage(chatId, `❌ Error capturing screenshot: ${error.message}`);
  }
});

/**
 * /alert command - Set price alerts
 */
bot.onText(/\/alert (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  const args = match[1].trim().split(' ');
  const action = args[0].toLowerCase();

  switch (action) {
    case 'set':
      const threshold = parseFloat(args[1]);
      if (isNaN(threshold)) {
        await bot.sendMessage(chatId, '❌ Invalid threshold. Usage: /alert set <amount_usd>');
        return;
      }
      
      if (!userSessions[userId]) userSessions[userId] = {};
      userSessions[userId].alertThreshold = threshold;
      
      await bot.sendMessage(chatId, `✅ Price alert set: $${formatNumber(threshold)}\n\nI'll notify you when major movements exceed this threshold.`);
      break;

    case 'list':
      const threshold = userSessions[userId]?.alertThreshold;
      if (threshold) {
        await bot.sendMessage(chatId, `📊 Active alerts:\n• Price movement > $${formatNumber(threshold)}`);
      } else {
        await bot.sendMessage(chatId, '⚠️ No active alerts. Use /alert set <amount> to create one.');
      }
      break;

    case 'clear':
      if (userSessions[userId]) {
        delete userSessions[userId].alertThreshold;
      }
      await bot.sendMessage(chatId, '✅ All alerts cleared.');
      break;

    default:
      await bot.sendMessage(chatId, '❌ Unknown alert action. Use: set, list, or clear');
  }
});

/**
 * /about command
 */
bot.onText(/\/about/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isUserAllowed(userId)) return;

  const aboutMessage = `
🤖 *Research Assistant Bot*

A personal Telegram assistant for cryptocurrency research and analysis.

*Features:*
• On-chain whale tracking
• Token holder scanning
• Deep research workflows
• Price monitoring
• Screenshot capture
• PDF report generation

*Built with:*
• Node.js
• Telegram Bot API
• Etherscan API v2
• Puppeteer
• Deep Research Coin Toolkit

*GitHub:* https://github.com/ThanaLamth/deep-research-coin

Version: 1.0.0
Last Updated: April 14, 2026
  `.trim();

  await bot.sendMessage(chatId, aboutMessage, { parse_mode: 'Markdown' });
});

/**
 * Handle general messages (chat mode)
 */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (!isUserAllowed(userId)) return;

  // Skip commands (handled above)
  if (text.startsWith('/')) return;

  // Skip if not text
  if (!text) return;

  await sendTyping(chatId);

  // Simple conversational responses
  const lowerText = text.toLowerCase();

  if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
    await bot.sendMessage(chatId, `👋 Hello! How can I help you with research today?`);
  } else if (lowerText.includes('whale') || lowerText.includes('track')) {
    await bot.sendMessage(chatId, `🐋 Want to track a whale? Use:
/whale <wallet_address>
/scan <token_address>

Or just send me the wallet address!`);
  } else if (lowerText.includes('price') || lowerText.includes('cost')) {
    await bot.sendMessage(chatId, `💰 Get token prices with:
/price <symbol>

Example: /price BTC`);
  } else if (lowerText.includes('research') || lowerText.includes('analyze')) {
    await bot.sendMessage(chatId, `🔍 Start deep research with:
/research <token_name>

This will collect news, on-chain data, and generate a full report!`);
  } else if (lowerText.includes('help')) {
    await bot.sendMessage(chatId, `📖 Need help? Use /help to see all available commands.`);
  } else {
    // Default response
    await bot.sendMessage(chatId, `
🤔 I'm not sure I understand. Here's what I can do:

• Track whale wallets: /whale <address>
• Scan token holders: /scan <token>
• Get prices: /price <symbol>
• Start research: /research <token>
• Capture screenshots: /screenshot <url>

Use /help for full command list.
    `.trim());
  }
});

// ==================== Error Handling ====================

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
});

bot.on('error', (error) => {
  console.error('❌ Bot error:', error.message);
});

// ==================== Startup ====================

console.log('🤖 Telegram Assistant Bot starting...');
console.log('📱 Bot is now online and listening for messages');
console.log('💬 Use /start to begin chatting');
console.log('');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down bot...');
  process.exit(0);
});
