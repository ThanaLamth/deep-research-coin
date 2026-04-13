const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

const CAPTCHA_API_KEY = '17271398436cab4753f00ca664404976';

// Use 2Captcha's unofficial captcha bypass for Cloudflare
async function bypassCloudflareWith2Captcha(url, proxyUrl) {
  // 2Captcha offers a bypass service for Cloudflare
  const res = await fetch(`https://2captcha.com/in.php?key=${CAPTCHA_API_KEY}&method=hcaptcha&sitekey=0x4AAAAAAA&proxy=${encodeURIComponent(proxyUrl)}&proxytype=HTTP&pageurl=${encodeURIComponent(url)}&json=1`);
  return res.json();
}

// Alternative: Use cookies from a real browser session
async function getCloudflareCookies() {
  // Try to access the page and wait for CF challenge to auto-resolve
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36');
    
    // Add realistic headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    // Anti-detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { 
        get: () => [
          { name: 'Chrome PDF Plugin' },
          { name: 'Chrome PDF Viewer' },
          { name: 'Native Client' }
        ] 
      });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 12 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    });

    return { browser, page };
  } catch (err) {
    console.error('Setup error:', err.message);
    return { browser: null, page: null };
  }
}

async function waitForCloudflareResolve(page, url, maxWait = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const title = await page.title();
    if (!title.includes('Just a moment') && !title.includes('Security')) {
      console.log('✅ Cloudflare challenge resolved!');
      return true;
    }
    
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    if (bodyText.includes('Verify you are human') && bodyText.includes('success')) {
      await new Promise(r => setTimeout(r, 2000));
      return true;
    }
    
    await new Promise(r => setTimeout(r, 2000));
    console.log(`  Waiting for CF challenge... (${Math.round((Date.now() - startTime) / 1000)}s)`);
  }
  
  return false;
}

// Main
(async () => {
  const screenshots = [
    {
      url: 'https://coinmarketcap.com/currencies/ravedao/',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\coinmarketcap-price.png',
      width: 1440,
      height: 900
    },
    {
      url: 'https://etherscan.io/token/0x17205fab260a7a6383a81452cE6315A39370Db97',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\etherscan-total-supply.png',
      width: 1440,
      height: 900
    },
    {
      url: 'https://etherscan.io/address/0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\etherscan-whale-wallet.png',
      width: 1440,
      height: 900
    },
    {
      url: 'https://etherscan.io/address/0x566b30470d7ad97419a48900dc869bd7148736b8',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\etherscan-aggregator.png',
      width: 1440,
      height: 900
    },
    {
      url: 'https://etherscan.io/token/0x17205fab260a7a6383a81452cE6315A39370Db97?a=0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\etherscan-whale-transfers.png',
      width: 1440,
      height: 1000
    },
    {
      url: 'https://www.coingecko.com/en/coins/ravedao',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\coingecko-chart.png',
      width: 1440,
      height: 900
    }
  ];

  for (const shot of screenshots) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📸 Capturing: ${shot.url}`);
    console.log('='.repeat(60));

    const { browser, page } = await getCloudflareCookies();
    if (!browser || !page) continue;

    try {
      await page.setViewport({ width: shot.width, height: shot.height });
      
      // Navigate
      await page.goto(shot.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Wait for Cloudflare challenge to resolve
      const resolved = await waitForCloudflareResolve(page, shot.url, 45000);
      
      if (!resolved) {
        console.log('⚠️ Challenge did not auto-resolve, taking screenshot anyway');
      } else {
        // Wait for page to fully load after challenge
        await new Promise(r => setTimeout(r, 5000));
        try {
          await page.waitForSelector('body', { timeout: 5000 });
        } catch (e) {}
      }

      // Final check
      const title = await page.title();
      console.log(`📄 Final title: ${title}`);

      // Take screenshot
      await page.screenshot({ path: shot.path, fullPage: false });
      console.log(`✅ Saved: ${shot.path}`);
      
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    } finally {
      await browser.close();
    }
  }

  console.log('\n🎉 All screenshots done!');
})();
