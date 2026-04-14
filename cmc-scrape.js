#!/usr/bin/env node
/**
 * CMC Browser Scraper — Access CoinMarketCap like a normal browser
 * No API key needed, no rate limits
 * Adapted for Windows + Telegram Bot integration
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'https://coinmarketcap.com';
const CACHE_DIR = path.join(__dirname, '.cmc-cache');
const CACHE_TTL = 30_000; // 30 seconds cache

function log(type, msg) {
  const colors = { '>': '\x1b[34m', '+': '\x1b[32m', '!': '\x1b[33m', '-': '\x1b[31m' };
  console.log(`\x1b[${type === '>' ? '34' : type === '+' ? '32' : type === '!' ? '33' : '31'}m[${type}]\x1b[0m ${msg}`);
}

function cacheKey(cmd, args) {
  return `${cmd}_${(args || []).join('_')}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function cacheRead(key) {
  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (Date.now() - data.ts < CACHE_TTL) return data.result;
  } catch {}
  return null;
}

function cacheWrite(key, result) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(CACHE_DIR, `${key}.json`), JSON.stringify({ ts: Date.now(), result }));
}

function formatCompact(num) {
  if (!num && num !== 0) return '?';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return Number(num).toLocaleString('en-US');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createBrowser() {
  return await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
}

async function createPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1440, height: 900 });
  return page;
}

async function scrapePrice(slug) {
  const url = `${BASE}/currencies/${slug}/`;
  log('>', `Navigating to: ${url}`);

  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);

    const info = await page.evaluate(() => {
      // Method 1: Try __NEXT_DATA__
      const nextData = document.querySelector('#__NEXT_DATA__');
      if (nextData) {
        try {
          const data = JSON.parse(nextData.textContent);
          const coin = data?.props?.pageProps?.detailRes;
          if (coin && (coin.name || coin.symbol)) {
            const usd = coin.quote?.USD || {};
            return {
              name: coin.name || '?',
              symbol: coin.symbol || '?',
              price: usd.price ? `$${Number(usd.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '?',
              change24h: usd.percent_change_24h != null ? `${usd.percent_change_24h >= 0 ? '+' : ''}${usd.percent_change_24h.toFixed(2)}%` : '?',
              marketCap: usd.market_cap ? `$${(function(n){ if(n>=1e12) return (n/1e12).toFixed(2)+'T'; if(n>=1e9) return (n/1e9).toFixed(2)+'B'; if(n>=1e6) return (n/1e6).toFixed(2)+'M'; if(n>=1e3) return (n/1e3).toFixed(2)+'K'; return Number(n).toLocaleString('en-US'); })(usd.market_cap)}` : '?',
              volume24h: usd.volume_24h ? `$${(function(n){ if(n>=1e12) return (n/1e12).toFixed(2)+'T'; if(n>=1e9) return (n/1e9).toFixed(2)+'B'; if(n>=1e6) return (n/1e6).toFixed(2)+'M'; if(n>=1e3) return (n/1e3).toFixed(2)+'K'; return Number(n).toLocaleString('en-US'); })(usd.volume_24h)}` : '?',
              rank: coin.cmcRank ? `#${coin.cmcRank}` : '?',
              supply: coin.circulatingSupply ? `${(function(n){ if(n>=1e12) return (n/1e12).toFixed(2)+'T'; if(n>=1e9) return (n/1e9).toFixed(2)+'B'; if(n>=1e6) return (n/1e6).toFixed(2)+'M'; if(n>=1e3) return (n/1e3).toFixed(2)+'K'; return Number(n).toLocaleString('en-US'); })(coin.circulatingSupply)} ${coin.symbol}` : '?',
              description: coin.description?.substring(0, 500) || '',
            };
          }
        } catch(e) {}
      }

      // Method 2: Extract from body text
      const bodyText = document.body.innerText;
      if (!bodyText || bodyText.length < 100) return { error: 'Page did not load' };

      const info2 = {};
      const title = document.title;
      const titleMatch = title.match(/^([^,]+) price/);
      info2.name = titleMatch ? titleMatch[1].trim() : '?';
      info2.symbol = document.querySelector('meta[name="symbol"]')?.content || '?';

      const priceMatch = bodyText.match(/#\d+\n[^#\n]*?\n\$?([\d,.]+)\n[\s\S]*?([+-]?[\d.]+%?\s*\(24h\))/);
      if (priceMatch) { info2.price = `$${priceMatch[1]}`; info2.change24h = priceMatch[2].trim(); }

      const mcapMatch = bodyText.match(/Market cap\s*\n?\s*\$?([\d,.BTKM]+)/i);
      if (mcapMatch) info2.marketCap = `$${mcapMatch[1]}`;

      const volMatch = bodyText.match(/Volume\s*\(24h\)\s*\n?\s*\$?([\d,.BTKM]+)/i);
      if (volMatch) info2.volume24h = `$${volMatch[1]}`;

      const rankMatch = bodyText.match(/#(\d+)\n/);
      if (rankMatch) info2.rank = `#${rankMatch[1]}`;

      return info2;
    });

    return info;
  } finally {
    await browser.close();
  }
}

async function scrapeTrending() {
  const url = BASE;
  log('>', `Fetching trending from homepage`);

  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);

    const coins = await page.evaluate(() => {
      const coins = [];
      const rows = document.querySelectorAll('table tbody tr, [class*="TableRow"]');
      rows.forEach((row, i) => {
        if (coins.length >= 20) return;
        const cells = row.querySelectorAll('td, [role="cell"]');
        if (cells.length < 5) return;
        const nameEl = cells[2]?.querySelector('a p') || cells[2]?.querySelector('a');
        const priceEl = cells[3]?.querySelector('a') || cells[3];
        const changeEl = cells[4]?.querySelector('span') || cells[4];
        const mcapEl = cells[6] || cells[5];
        if (nameEl) {
          coins.push({
            rank: cells[0]?.textContent.trim() || (i + 1).toString(),
            name: nameEl.textContent.trim(),
            price: priceEl?.textContent.trim() || '?',
            change24h: changeEl?.textContent.trim() || '?',
            marketCap: mcapEl?.textContent.trim() || '?',
          });
        }
      });
      return coins.length > 0 ? coins : null;
    });

    return coins;
  } finally {
    await browser.close();
  }
}

async function scrapeGainersLosers() {
  const url = `${BASE}/gainers-losers/`;
  log('>', `Fetching gainers/losers`);

  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);

    const bodyText = await page.evaluate(() => document.body.innerText);

    const gainers = [];
    const losers = [];
    const topGainersIdx = bodyText.search(/Top Gainers/i);
    const topLosersIdx = bodyText.search(/Top Losers/i);
    const endIdx = bodyText.search(/Categories|Leaderboards/i);

    if (topGainersIdx === -1 || topLosersIdx === -1) return { gainers, losers };

    const gainersSection = bodyText.substring(topGainersIdx, topLosersIdx);
    const losersSection = bodyText.substring(topLosersIdx, endIdx !== -1 ? endIdx : bodyText.length);

    function parseCoins(text) {
      const coins = [];
      const re = /(\d+)\s{2,}([A-Za-z0-9 .()\-]+)\s{2,}([A-Z]{2,10})\s{2,}\$?([\d,.]+)\s{1,}([+-]?[\d.]+%)\s{1,}\$?([\d,.]+)/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        coins.push({
          rank: m[1], name: m[2].trim(), symbol: m[3],
          price: `$${m[4]}`, change24h: m[5], volume: `$${m[6]}`
        });
      }
      return coins;
    }

    const g = parseCoins(gainersSection);
    gainers.push(...g.sort((a, b) => parseFloat(b.change24h) - parseFloat(a.change24h)).slice(0, 10));

    const l = parseCoins(losersSection);
    losers.push(...l.sort((a, b) => parseFloat(a.change24h) - parseFloat(b.change24h)).slice(0, 10));

    return { gainers, losers };
  } finally {
    await browser.close();
  }
}

async function scrapeNews() {
  const url = `${BASE}/headline-news/`;
  log('>', `Fetching news`);

  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);

    const articles = await page.evaluate(() => {
      const articles = [];
      const items = document.querySelectorAll('a[href*="/news/"], [class*="NewsCard"], article a');
      items.forEach(item => {
        const titleEl = item.querySelector('h2, h3, h4, [class*="title"], p');
        const title = titleEl ? titleEl.textContent.trim() : item.textContent.trim();
        if (title && title.length > 10) {
          articles.push({ title: title.substring(0, 120), url: item.href || '#' });
        }
      });
      const seen = new Set();
      return articles.filter(a => { if (seen.has(a.title)) return false; seen.add(a.title); return true; }).slice(0, 15);
    });

    return articles;
  } finally {
    await browser.close();
  }
}

async function scrapeSearch(query) {
  log('>', `Searching: ${query}`);

  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    const url = `${BASE}/search/?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);

    const results = await page.evaluate(() => {
      const results = [];
      const nextData = document.querySelector('#__NEXT_DATA__');
      if (nextData) {
        try {
          const data = JSON.parse(nextData.textContent);
          const searchRes = data?.props?.pageProps?.searchRes;
          const coins = searchRes?.coins || searchRes?.cryptoCurrencies || [];
          coins.forEach(c => {
            results.push({
              name: c.name || c.cryptoName || '?',
              symbol: c.symbol || c.cryptoSymbol || '?',
              slug: c.slug || '',
              rank: c.cmcRank || c.rank || '?',
            });
          });
        } catch {}
      }
      if (results.length === 0) {
        const links = document.querySelectorAll('a[href*="/currencies/"]');
        const seen = new Set();
        links.forEach(a => {
          const href = a.href;
          if (seen.has(href)) return;
          seen.add(href);
          const text = a.textContent.trim();
          if (text && text.length > 2 && text.length < 40) {
            results.push({ name: text, symbol: '', slug: '', rank: '?' });
          }
        });
      }
      return results.slice(0, 15);
    });

    return results;
  } finally {
    await browser.close();
  }
}

// Export for Telegram bot
module.exports = {
  scrapePrice,
  scrapeTrending,
  scrapeGainersLosers,
  scrapeNews,
  scrapeSearch,
  cacheKey,
  cacheRead,
  cacheWrite,
  CACHE_TTL,
};

// CLI mode
if (require.main === module) {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);

  if (!cmd || cmd === 'help' || cmd === '--help') {
    console.log(`
CMC Browser Scraper - No API key needed
Usage: node cmc-scrape.js [command] [args]

Commands:
  price <slug>    Get coin price (e.g., bitcoin, ethereum)
  search <query>  Search coins (e.g., RAVE, BTC)
  trending        Get top coins from homepage
  gainers         Get gainers & losers
  news            Get latest crypto news

Examples:
  node cmc-scrape.js price bitcoin
  node cmc-scrape.js search RAVE
  node cmc-scrape.js trending
  node cmc-scrape.js gainers
  node cmc-scrape.js news
`);
    process.exit(0);
  }

  const { scrapePrice, scrapeTrending, scrapeGainersLosers, scrapeNews, scrapeSearch, cacheKey, cacheRead, cacheWrite } = require('./cmc-scrape');

  (async () => {
    // Check cache
    const key = cacheKey(cmd, args);
    const cached = cacheRead(key);
    if (cached) {
      log('+', 'Cache hit!');
      console.log(JSON.stringify(cached, null, 2));
      process.exit(0);
    }

    let result;
    switch (cmd) {
      case 'price':
        result = await scrapePrice(args[0]);
        break;
      case 'search':
        result = await scrapeSearch(args[0]);
        break;
      case 'trending':
        result = await scrapeTrending();
        break;
      case 'gainers':
        result = await scrapeGainersLosers();
        break;
      case 'news':
        result = await scrapeNews();
        break;
      default:
        log('-', `Unknown command: ${cmd}`);
        process.exit(1);
    }

    if (result) {
      cacheWrite(key, result);
      console.log(JSON.stringify(result, null, 2));
      log('+', 'Done!');
    }
  })();
}
