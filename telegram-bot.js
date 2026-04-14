/**
 * 🤖 @topcmc_bot - TopCMC Telegram Assistant Bot
 * Powered by CoinMarketCap browser scraping (no API key needed)
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const {
  scrapePrice,
  scrapeTrending,
  scrapeGainersLosers,
  scrapeNews,
  scrapeSearch,
  cacheKey,
  cacheRead,
  cacheWrite,
} = require('./cmc-scrape');
const { research } = require('./research');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not found');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ==================== /start ====================

bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
`👋 *Welcome to TopCMC Bot!*

I get live data from *CoinMarketCap* — no API key needed.

💰 Commands:
/price <coin> — Get price
/trending — Top coins
/gainers — Gainers & Losers
/news — Latest crypto news
/search <coin> — Find coins
/research <coin> — 🔥 Deep analysis (CMC + on-chain + fundamental)

💡 Try: \`/price bitcoin\` or \`/research bitcoin\`

/help for more`, { parse_mode: 'Markdown' });
});

// ==================== /help ====================

bot.onText(/\/help/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
`📖 *Commands*

*Price:*
/price <slug> — Get coin price
  e.g. /price bitcoin, /price ethereum

*Trending:*
/trending — Top 20 coins by market cap

*Gainers/Losers:*
/gainers — Top gainers & losers today

*News:*
/news — Latest crypto headlines

*Search:*
/search <query> — Find coins
  e.g. /search BTC, /search RAVE

*Research:* 🔥
/research <slug> — Deep analysis
  e.g. /research bitcoin
  /research ravedao 0x1720...
  (Includes CMC + on-chain + fundamental)

*Other:*
/status — Bot status
/about — About this bot

💡 *Tip:* Use CoinMarketCap slugs:
• \`bitcoin\` not \`btc\`
• \`ethereum\` not \`eth\`
• \`ravedao\` not \`rave\``, { parse_mode: 'Markdown' });
});

// ==================== /price ====================

bot.onText(/\/price (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const slug = match[1].trim().toLowerCase();

  bot.sendChatAction(chatId, 'typing');

  try {
    const data = await scrapePrice(slug);

    if (data.error) {
      await bot.sendMessage(chatId, `❌ ${data.error}\n\nMake sure you use the CoinMarketCap slug name (e.g., "bitcoin", "ethereum", "ravedao").`);
      return;
    }

    if (!data.name || data.name === '?') {
      await bot.sendMessage(chatId, `❌ Coin "${slug}" not found.\n\nCheck the URL on CoinMarketCap for the correct slug.`);
      return;
    }

    let text = `💰 *${data.name} (${data.symbol})*\n\n`;
    text += `*Price:* ${data.price}\n`;
    text += `*24h:* ${data.change24h}\n`;
    if (data.marketCap !== '?') text += `*Market Cap:* ${data.marketCap}\n`;
    if (data.volume24h !== '?') text += `*Volume:* ${data.volume24h}\n`;
    if (data.rank !== '?') text += `*Rank:* ${data.rank}\n`;
    if (data.supply !== '?') text += `*Supply:* ${data.supply}\n`;
    text += `\n_source: CoinMarketCap_`;

    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Price error:', error);
    await bot.sendMessage(chatId, `❌ Error fetching price: ${error.message}\n\nPlease try again.`);
  }
});

// ==================== /trending ====================

bot.onText(/\/trending/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendChatAction(chatId, 'typing');

  try {
    const coins = await scrapeTrending();

    if (!coins || coins.length === 0) {
      await bot.sendMessage(chatId, '❌ Could not load trending data.');
      return;
    }

    let text = '🔥 *Top Coins on CoinMarketCap*\n\n';
    text += '```\n';
    text += `${'Rank'.padStart(5)} ${'Name'.padEnd(22)} ${'Price'.padStart(14)} ${'24h'.padStart(10)}\n`;
    text += `${'-'.repeat(55)}\n`;

    coins.slice(0, 15).forEach(c => {
      const name = c.name.length > 22 ? c.name.substring(0, 19) + '...' : c.name;
      text += `${(c.rank || '?').padStart(5)} ${name.padEnd(22)} ${(c.price || '?').padStart(14)} ${(c.change24h || '?').padStart(10)}\n`;
    });

    text += '```\n';
    text += '\n_source: CoinMarketCap_';

    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Trending error:', error);
    await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// ==================== /gainers ====================

bot.onText(/\/gainers/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendChatAction(chatId, 'typing');

  try {
    const data = await scrapeGainersLosers();

    if ((!data.gainers || data.gainers.length === 0) && (!data.losers || data.losers.length === 0)) {
      await bot.sendMessage(chatId, '❌ Could not load gainers/losers data.');
      return;
    }

    let text = '📊 *Gainers & Losers*\n\n';

    if (data.gainers.length > 0) {
      text += '*🟢 Top Gainers*\n';
      text += '```\n';
      data.gainers.forEach(g => {
        const name = g.name.length > 25 ? g.name.substring(0, 22) + '...' : g.name;
        text += `+ ${name.padEnd(25)} ${g.change24h}\n`;
      });
      text += '```\n\n';
    }

    if (data.losers.length > 0) {
      text += '*🔴 Top Losers*\n';
      text += '```\n';
      data.losers.forEach(l => {
        const name = l.name.length > 25 ? l.name.substring(0, 22) + '...' : l.name;
        text += `- ${name.padEnd(25)} ${l.change24h}\n`;
      });
      text += '```\n';
    }

    text += '\n_source: CoinMarketCap_';

    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Gainers error:', error);
    await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// ==================== /news ====================

bot.onText(/\/news/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendChatAction(chatId, 'typing');

  try {
    const articles = await scrapeNews();

    if (!articles || articles.length === 0) {
      await bot.sendMessage(chatId, '❌ Could not load news.');
      return;
    }

    let text = `📰 *Latest Crypto News*\n\n`;
    articles.slice(0, 10).forEach((a, i) => {
      text += `${(i + 1)}. ${a.title}\n`;
    });

    text += `\n_source: CoinMarketCap_`;

    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('News error:', error);
    await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// ==================== /search ====================

bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1].trim();

  bot.sendChatAction(chatId, 'typing');

  try {
    const results = await scrapeSearch(query);

    if (!results || results.length === 0) {
      await bot.sendMessage(chatId, `❌ No results for "${query}".`);
      return;
    }

    let text = `🔍 *Search: "${query}"*\n\n`;
    results.slice(0, 10).forEach((r, i) => {
      const rank = r.rank !== '?' ? `#${r.rank}` : '';
      text += `${(i + 1)}. *${r.name}* ${r.symbol ? `(${r.symbol})` : ''} ${rank}\n`;
      text += `   Use: \`/price ${r.slug || r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}\`\n\n`;
    });
    text += `_source: CoinMarketCap_`;

    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Search error:', error);
    await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// ==================== /research ====================

bot.onText(/\/research (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1].trim();

  // Parse: /research bitcoin or /research ravedao 0x1234...
  const parts = input.split(/\s+/);
  const slug = parts[0].toLowerCase();
  const contractAddress = parts[1]?.startsWith('0x') ? parts[1] : null;

  bot.sendChatAction(chatId, 'typing');

  // Send "researching" status
  await bot.sendMessage(chatId,
    `🔍 *Starting Deep Research: ${slug}*\n\n` +
    `⏳ This may take 1-2 minutes...\n` +
    `📊 Gathering: CMC data + On-chain + Fundamental`,
    { parse_mode: 'Markdown' }
  );

  try {
    const result = await research(slug, { contractAddress });

    if (result.error) {
      await bot.sendMessage(chatId, `❌ ${result.error}`);
      return;
    }

    // Message 1: Summary
    await bot.sendMessage(chatId, result.telegramSummary, { parse_mode: 'Markdown' });

    // Small delay
    await new Promise(r => setTimeout(r, 800));

    // Message 2: On-chain detail
    await bot.sendMessage(chatId, result.onChainMessage, { parse_mode: 'Markdown' });

    // Small delay
    await new Promise(r => setTimeout(r, 800));

    // Message 3: Fundamental analysis
    await bot.sendMessage(chatId, result.fundamentalMessage, { parse_mode: 'Markdown' });

    // Small delay
    await new Promise(r => setTimeout(r, 800));

    // Message 5: Pattern matching + similar coins
    await bot.sendMessage(chatId, result.patternMatchMessage, { parse_mode: 'Markdown' });

    // Small delay
    await new Promise(r => setTimeout(r, 800));

    // Message 6: Send full report as PDF
    const pdfPath = result.pdfPath;

    await bot.sendDocument(chatId, pdfPath, {
      caption: `📄 *Full Research Report: ${result.cmcData.name} (${result.cmcData.symbol})*\n\n` +
        `📊 Sections:\n` +
        `• Market Data Overview\n` +
        `• On-Chain Analysis (Whale Wallets)\n` +
        `• Root Causes of Price Movement\n` +
        `• Fundamental Analysis\n` +
        `• Price Prediction (Short/Med/Long)\n` +
        `• Risk Assessment\n` +
        `• Recommendations\n\n` +
        `💡 Read carefully before making decisions`,
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Research error:', error);
    await bot.sendMessage(chatId,
      `❌ Error during research: ${error.message}\n\n` +
      `Please try again or use a different coin.`);
  }
});

// ==================== /status ====================

bot.onText(/\/status/, async (msg) => {
  const uptime = Math.floor(process.uptime());
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  await bot.sendMessage(msg.chat.id,
`📊 *Bot Status*\n\n✅ Online\n⏱️ Uptime: ${h}h ${m}m\n📅 ${new Date().toLocaleString()}\n🔧 Puppeteer + CoinMarketCap`,
  { parse_mode: 'Markdown' });
});

// ==================== /about ====================

bot.onText(/\/about/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
`🤖 *TopCMC Bot (@topcmc_bot)*\n\nCrypto prices from *CoinMarketCap* via headless browser scraping.\n\n✅ No API key needed\n✅ No rate limits\n✅ Live data\n\nVersion: 1.0.0`,
  { parse_mode: 'Markdown' });
});

// ==================== Error handling ====================

bot.on('polling_error', (e) => console.log('⚠️', e.code || e.message));
bot.on('error', (e) => console.error('❌', e.message));

console.log('🤖 TopCMC Bot (@topcmc_bot) starting...');
console.log('📡 Powered by CoinMarketCap scraper');
console.log('📱 Bot is online!');

process.on('SIGINT', () => { console.log('\n👋 Stopped'); process.exit(0); });
