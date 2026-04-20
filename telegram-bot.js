/**
 * 🤖 @topcmc_bot - TopCMC Telegram Assistant Bot
 * Powered by CoinMarketCap browser scraping (no API key needed)
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
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
const ALLOWED_HAND_USER_IDS = parseIdSet(process.env.ALLOWED_TELEGRAM_USER_IDS);
const ALLOWED_HAND_CHAT_IDS = parseIdSet(process.env.ALLOWED_TELEGRAM_CHAT_IDS);
const CODEX_WORKDIR = process.env.CODEX_WORKDIR || '/home/qwen';
const CODEX_HANDRESEARCH_WORKDIR = process.env.CODEX_HANDRESEARCH_WORKDIR || '/home/qwen/deep-research-coin';
const CODEX_TIMEOUT_MS = parseTimeoutMs(process.env.CODEX_TIMEOUT_MS, 180000);
const CODEX_HANDRESEARCH_TIMEOUT_MS = parseTimeoutMs(process.env.CODEX_HANDRESEARCH_TIMEOUT_MS, 900000);
const HAND_OUTPUT_LIMIT = 3500;
let activeHandJob = null;

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not found');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function parseIdSet(value) {
  return new Set(
    String(value || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  );
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseTimeoutMs(value, fallback) {
  const normalized = String(value || '').trim();
  if (!normalized) return fallback;

  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isInteger(parsed)) return fallback;
  if (parsed <= 0) return null;
  return parsed;
}

function isHandConfigured() {
  return ALLOWED_HAND_USER_IDS.size > 0 || ALLOWED_HAND_CHAT_IDS.size > 0;
}

function isHandAuthorized(msg) {
  const userId = String(msg.from?.id || '');
  const chatId = String(msg.chat?.id || '');
  return ALLOWED_HAND_USER_IDS.has(userId) || ALLOWED_HAND_CHAT_IDS.has(chatId);
}

function appendTail(current, chunk, maxChars = 12000) {
  const next = current + chunk.toString('utf8');
  return next.length > maxChars ? next.slice(-maxChars) : next;
}

function truncateOutput(text, maxChars = HAND_OUTPUT_LIMIT) {
  const normalized = String(text || '').trim();
  if (!normalized) return '';
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars - 32).trimEnd()}\n\n[output truncated]`;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoverChange(change, direction) {
  const normalized = String(change || '').trim();
  if (!normalized || normalized === '?') return '?';

  const unsigned = normalized.replace(/^[+-]\s*/, '').trim();
  const sign = direction === 'down' ? '-' : '+';
  return `${sign}${unsigned}`;
}

function formatTimeoutLabel(timeoutMs) {
  return timeoutMs ? `${Math.round(timeoutMs / 1000)}s` : 'disabled';
}

function formatCodexResult(result, options = {}) {
  const {
    timedOutMessage = 'Codex timed out before producing a final summary.',
    emptyMessage = 'No final response returned.',
  } = options;

  if (result.lastMessage) {
    return truncateOutput(result.lastMessage);
  }

  if (result.timedOut) {
    return timedOutMessage;
  }

  if (result.stderrTail) {
    return truncateOutput(result.stderrTail);
  }

  if (result.stdoutTail) {
    return truncateOutput(result.stdoutTail);
  }

  return emptyMessage;
}

async function runCodexTask(prompt, options = {}) {
  const {
    search = false,
    timeoutMs = CODEX_TIMEOUT_MS,
    jobState = null,
    workdir = CODEX_WORKDIR,
  } = options;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-hand-'));
  const outputFile = path.join(tempDir, 'last-message.txt');
  const args = [];

  if (search) {
    args.push('--search');
  }

  args.push(
    'exec',
    '--skip-git-repo-check',
    '--dangerously-bypass-approvals-and-sandbox',
    '--color', 'never',
    '-C', workdir,
    '-o', outputFile,
    prompt,
  );

  return await new Promise((resolve, reject) => {
    let stdoutTail = '';
    let stderrTail = '';
    let settled = false;
    let timeoutId = null;
    const child = spawn('codex', args, {
      cwd: workdir,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (jobState) {
      jobState.child = child;
    }

    const finalize = (result) => {
      if (settled) return;
      settled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      try {
        result.lastMessage = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : '';
      } catch {
        result.lastMessage = '';
      }

      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {}

      resolve({
        ...result,
        stdoutTail,
        stderrTail,
      });
    };

    child.stdout.on('data', (chunk) => {
      stdoutTail = appendTail(stdoutTail, chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderrTail = appendTail(stderrTail, chunk);
    });

    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {}
      reject(error);
    });

    child.on('close', (code, signal) => {
      finalize({ code, signal, timedOut: false });
    });

    if (timeoutMs) {
      timeoutId = setTimeout(() => {
        if (settled) return;
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 3000).unref();
        finalize({ code: null, signal: 'SIGTERM', timedOut: true });
      }, timeoutMs);
    }
  });
}

async function runCodexHand(prompt) {
  const jobState = activeHandJob;
  return await runCodexTask(prompt, {
    search: false,
    timeoutMs: CODEX_TIMEOUT_MS,
    jobState,
    workdir: CODEX_WORKDIR,
  });
}

async function runCodexHandResearch(query) {
  const prompt = [
    `Research ${query} manually in ${CODEX_HANDRESEARCH_WORKDIR}.`,
    'Use live web search and current sources.',
    'Include on-chain analysis when the contract address is known or can be discovered with reasonable confidence, similar in spirit to the RAVE case.',
    `Use the transferred local files in ${CODEX_HANDRESEARCH_WORKDIR} as working context, not any cached or old copy.`,
    'If useful, create or update output files directly in that workspace.',
    'Return a Telegram-safe final answer with:',
    '1. project identification',
    '2. market/fundamental summary',
    '3. on-chain findings',
    '4. risks / invalidation',
    '5. files created or updated and exact paths',
    'Keep the final answer concise but actionable.',
  ].join('\n');

  return await runCodexTask(prompt, {
    search: true,
    timeoutMs: CODEX_HANDRESEARCH_TIMEOUT_MS,
    jobState: activeHandJob,
    workdir: CODEX_HANDRESEARCH_WORKDIR,
  });
}

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
/hand <request> — Run Codex from Telegram (allowlist only)
/handresearch <coin> — Manual Codex research with on-chain
/stop — Stop the current /hand or /handresearch job

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

*Agent:*
/hand <request> — Send a task to Codex
  e.g. /hand check /home/qwen/cmc-chart-capture and summarize run command
  (Restricted by allowlist)
/handresearch <coin> — Manual research via Codex
  e.g. /handresearch bitcoin
  (Uses web search and includes on-chain when possible)
/stop — Stop the current Codex task
  (Restricted by allowlist)

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

    let text = '<b>📊 Gainers &amp; Losers</b>\n\n';

    if (data.gainers.length > 0) {
      text += '<b>🟢 Top Gainers</b>\n';
      data.gainers.forEach((g, index) => {
        const label = escapeHtml(g.name);
        const change = escapeHtml(formatMoverChange(g.change24h, 'up'));
        const line = g.url
          ? `${index + 1}. <a href="${escapeHtml(g.url)}">${label}</a> <b>${change}</b>\n`
          : `${index + 1}. ${label} <b>${change}</b>\n`;
        text += line;
      });
      text += '\n';
    }

    if (data.losers.length > 0) {
      text += '<b>🔴 Top Losers</b>\n';
      data.losers.forEach((l, index) => {
        const label = escapeHtml(l.name);
        const change = escapeHtml(formatMoverChange(l.change24h, 'down'));
        const line = l.url
          ? `${index + 1}. <a href="${escapeHtml(l.url)}">${label}</a> <b>${change}</b>\n`
          : `${index + 1}. ${label} <b>${change}</b>\n`;
        text += line;
      });
      text += '\n';
    }

    text += '<i>source: CoinMarketCap</i>';

    await bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });

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

// ==================== /hand ====================

bot.onText(/^\/hand(?:@\w+)?(?:\s+([\s\S]+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const prompt = match?.[1]?.trim() || '';

  if (!prompt) {
    await bot.sendMessage(chatId, 'Usage: /hand <request>');
    return;
  }

  if (!isHandConfigured()) {
    await bot.sendMessage(chatId, '❌ /hand is disabled. Configure ALLOWED_TELEGRAM_USER_IDS or ALLOWED_TELEGRAM_CHAT_IDS first.');
    return;
  }

  if (!isHandAuthorized(msg)) {
    await bot.sendMessage(chatId, '⛔ You are not allowed to use /hand in this chat.');
    return;
  }

  if (activeHandJob) {
    await bot.sendMessage(chatId, `⏳ /hand is busy with another request from ${activeHandJob.owner}. Try again in a moment.`);
    return;
  }

  const owner = msg.from?.username ? `@${msg.from.username}` : String(msg.from?.id || 'unknown');
  activeHandJob = {
    owner,
    ownerId: String(msg.from?.id || ''),
    chatId: String(chatId),
    type: 'hand',
    startedAt: Date.now(),
    child: null,
    cancelRequested: false,
    cancelRequestedBy: null,
  };

  await bot.sendMessage(
    chatId,
    `🤖 /hand accepted.\n\nWorkspace: ${CODEX_WORKDIR}\nTimeout: ${formatTimeoutLabel(CODEX_TIMEOUT_MS)}\nOwner: ${owner}`
  );

  try {
    const startedAt = Date.now();
    const result = await runCodexHand(prompt);
    const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const finalText = formatCodexResult(result, {
      timedOutMessage: 'Codex reached the time limit before producing a final answer. Retry with a narrower request or increase CODEX_TIMEOUT_MS.',
    });
    const statusLine = activeHandJob?.cancelRequested
      ? `🛑 /hand stopped by ${activeHandJob.cancelRequestedBy || 'an authorized user'} after ${durationSec}s.`
      : result.timedOut
        ? `⚠️ /hand timed out after ${durationSec}s.`
        : result.code === 0
          ? `✅ /hand finished in ${durationSec}s.`
          : `❌ /hand exited with code ${result.code ?? 'unknown'} after ${durationSec}s.`;

    await bot.sendMessage(chatId, `${statusLine}\n\n${finalText}`);
  } catch (error) {
    await bot.sendMessage(chatId, `❌ /hand failed: ${error.message}`);
  } finally {
    activeHandJob = null;
  }
});

// ==================== /handresearch ====================

bot.onText(/^\/handresearch(?:@\w+)?(?:\s+([\s\S]+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match?.[1]?.trim() || '';

  if (!query) {
    await bot.sendMessage(chatId, 'Usage: /handresearch <coin>');
    return;
  }

  if (!isHandConfigured()) {
    await bot.sendMessage(chatId, '❌ /handresearch is disabled. Configure ALLOWED_TELEGRAM_USER_IDS or ALLOWED_TELEGRAM_CHAT_IDS first.');
    return;
  }

  if (!isHandAuthorized(msg)) {
    await bot.sendMessage(chatId, '⛔ You are not allowed to use /handresearch in this chat.');
    return;
  }

  if (activeHandJob) {
    await bot.sendMessage(chatId, `⏳ /handresearch is busy with another request from ${activeHandJob.owner}. Try again in a moment.`);
    return;
  }

  const owner = msg.from?.username ? `@${msg.from.username}` : String(msg.from?.id || 'unknown');
  activeHandJob = {
    owner,
    ownerId: String(msg.from?.id || ''),
    chatId: String(chatId),
    type: 'handresearch',
    startedAt: Date.now(),
    child: null,
    cancelRequested: false,
    cancelRequestedBy: null,
  };

  await bot.sendMessage(
    chatId,
    `🔎 /handresearch accepted.\n\nCoin: ${query}\nWorkspace: ${CODEX_HANDRESEARCH_WORKDIR}\nTimeout: ${formatTimeoutLabel(CODEX_HANDRESEARCH_TIMEOUT_MS)}\nOwner: ${owner}`
  );

  try {
    const startedAt = Date.now();
    const result = await runCodexHandResearch(query);
    const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const finalText = formatCodexResult(result, {
      timedOutMessage: 'Codex reached the time limit before producing a final research summary. Retry the same coin, narrow the scope, or increase CODEX_HANDRESEARCH_TIMEOUT_MS.',
    });
    const statusLine = activeHandJob?.cancelRequested
      ? `🛑 /handresearch stopped by ${activeHandJob.cancelRequestedBy || 'an authorized user'} after ${durationSec}s.`
      : result.timedOut
        ? `⚠️ /handresearch timed out after ${durationSec}s.`
        : result.code === 0
          ? `✅ /handresearch finished in ${durationSec}s.`
          : `❌ /handresearch exited with code ${result.code ?? 'unknown'} after ${durationSec}s.`;

    await bot.sendMessage(chatId, `${statusLine}\n\n${finalText}`);
  } catch (error) {
    await bot.sendMessage(chatId, `❌ /handresearch failed: ${error.message}`);
  } finally {
    activeHandJob = null;
  }
});

// ==================== /stop ====================

bot.onText(/^\/stop(?:@\w+)?$/i, async (msg) => {
  const chatId = msg.chat.id;

  if (!isHandConfigured()) {
    await bot.sendMessage(chatId, '❌ /stop is disabled. Configure ALLOWED_TELEGRAM_USER_IDS or ALLOWED_TELEGRAM_CHAT_IDS first.');
    return;
  }

  if (!isHandAuthorized(msg)) {
    await bot.sendMessage(chatId, '⛔ You are not allowed to use /stop in this chat.');
    return;
  }

  if (!activeHandJob) {
    await bot.sendMessage(chatId, 'ℹ️ No active /hand or /handresearch job is running.');
    return;
  }

  const requesterId = String(msg.from?.id || '');
  const requesterChatId = String(chatId);
  const sameOwner = requesterId && requesterId === activeHandJob.ownerId;
  const sameChat = requesterChatId && requesterChatId === activeHandJob.chatId;

  if (!sameOwner && !sameChat) {
    await bot.sendMessage(chatId, `⛔ Only ${activeHandJob.owner} or the same chat can stop this ${activeHandJob.type} job.`);
    return;
  }

  if (!activeHandJob.child || activeHandJob.child.killed) {
    await bot.sendMessage(chatId, `ℹ️ ${activeHandJob.type} is finishing already. Try again if it does not exit.`);
    return;
  }

  activeHandJob.cancelRequested = true;
  activeHandJob.cancelRequestedBy = msg.from?.username ? `@${msg.from.username}` : String(msg.from?.id || 'unknown');
  activeHandJob.child.kill('SIGTERM');

  setTimeout(() => {
    if (activeHandJob?.child && !activeHandJob.child.killed) {
      activeHandJob.child.kill('SIGKILL');
    }
  }, 3000).unref();

  await bot.sendMessage(chatId, `🛑 Stopping current /${activeHandJob.type} job started by ${activeHandJob.owner}...`);
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
