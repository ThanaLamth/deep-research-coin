const puppeteer = require('puppeteer');

const CAPTCHA_API_KEY = '17271398436cab4753f00ca664404976';
const BASE_URL = 'https://2captcha.com';

// 2Captcha API helpers
async function createTask(type, params) {
  const url = `${BASE_URL}/in.php`;
  const formData = new URLSearchParams({
    key: CAPTCHA_API_KEY,
    method: type,
    json: 1,
    ...params
  });

  const res = await fetch(`${url}?${formData}`);
  return res.json();
}

async function getResult(taskId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    
    const res = await fetch(`${BASE_URL}/res.php?key=${CAPTCHA_API_KEY}&action=get&id=${taskId}&json=1`);
    const data = await res.json();
    
    if (data.status === 1 && data.request) {
      return data.request;
    }
    
    if (data.request === 'CAPCHA_NOT_READY') {
      console.log(`  Attempt ${i + 1}/${maxAttempts}: Waiting...`);
      continue;
    }
    
    console.log(`  Result: ${JSON.stringify(data)}`);
    return null;
  }
  return null;
}

// Solve Cloudflare Turnstile
async function solveTurnstile(page, sitekey, url) {
  console.log('🔄 Solving Cloudflare Turnstile...');
  
  const task = await createTask('turnstile', {
    sitekey: sitekey,
    pageurl: url
  });
  
  console.log('Task created:', JSON.stringify(task));
  
  if (task.status !== 1) {
    console.log('Failed to create task:', task.request);
    return null;
  }
  
  const token = await getResult(task.request);
  return token;
}

// Solve hCaptcha
async function solveHCaptcha(page, sitekey, url) {
  console.log('🔄 Solving hCaptcha...');
  
  const task = await createTask('hcaptcha', {
    sitekey: sitekey,
    pageurl: url
  });
  
  console.log('Task created:', JSON.stringify(task));
  
  if (task.status !== 1) {
    console.log('Failed to create task:', task.request);
    return null;
  }
  
  const token = await getResult(task.request);
  return token;
}

// Solve reCAPTCHA v2
async function solveRecaptchaV2(page, sitekey, url) {
  console.log('🔄 Solving reCAPTCHA v2...');
  
  const task = await createTask('userrecaptcha', {
    googlekey: sitekey,
    pageurl: url
  });
  
  console.log('Task created:', JSON.stringify(task));
  
  if (task.status !== 1) {
    console.log('Failed to create task:', task.request);
    return null;
  }
  
  const token = await getResult(task.request);
  return token;
}

// Inject token and submit
async function injectToken(page, token, type = 'turnstile') {
  console.log('💉 Injecting token into page...');
  
  await page.evaluate((tok, t) => {
    if (t === 'turnstile') {
      // Find all turnstile callbacks
      const iframes = document.querySelectorAll('iframe[src*="challenges.cloudflare.com"]');
      iframes.forEach(iframe => {
        try {
          const callbackName = new URL(iframe.src).searchParams.get('callback') || 'turnstileCallback';
          window[callbackName]?.(tok);
        } catch (e) {}
      });
      
      // Try common callback patterns
      ['turnstile-callback', 'onSuccess', 'callback', 'data-callback'].forEach(name => {
        const el = document.querySelector(`[data-callback="${name}"]`);
        if (el) el.dispatchEvent(new Event('click'));
      });
      
      // Set hidden input
      const inputs = document.querySelectorAll('input[type="hidden"]');
      inputs.forEach(input => {
        if (input.name.includes('cf') || input.name.includes('turnstile')) {
          input.value = tok;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      console.log('Turnstile token injected');
    } else if (t === 'hcaptcha') {
      const textarea = document.querySelector('textarea[name="h-captcha-response"]');
      if (textarea) {
        textarea.value = tok;
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (t === 'recaptcha') {
      const textarea = document.querySelector('textarea[name="g-recaptcha-response"]');
      if (textarea) {
        textarea.value = tok;
      }
    }
  }, token, type);
  
  await new Promise(r => setTimeout(r, 3000));
}

// Main screenshot function
async function captureScreenshot(url, path, width, height) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    
    // Anti-detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      // Override permissions
      Notification = { permission: 'denied' };
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📸 Capturing: ${url}`);
    console.log('='.repeat(60));
    
    // Navigate
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (err) {
      console.log(`Navigation issue: ${err.message}`);
    }

    // Wait for page to settle
    await new Promise(r => setTimeout(r, 5000));

    // Check page state
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || '');
    
    console.log(`📄 Title: ${title}`);
    console.log(`📝 Body preview: ${bodyText.substring(0, 200)}...`);

    // Detect captcha type
    const captchaInfo = await page.evaluate(() => {
      const bodyTextLocal = document.body?.innerText || '';
      
      // Check for Turnstile
      const turnstile = document.querySelector('iframe[src*="challenges.cloudflare.com"]');
      const turnstileKey = turnstile ? new URL(turnstile.src).searchParams.get('sitekey') : null;
      
      // Check for hCaptcha
      const hcaptcha = document.querySelector('iframe[src*="hcaptcha.com"]');
      const hcaptchaKey = hcaptcha ? new URL(hcaptcha.src).searchParams.get('sitekey') : null;
      
      // Check for reCAPTCHA
      const recaptcha = document.querySelector('iframe[src*="google.com/recaptcha"]');
      const recaptchaKey = recaptcha ? new URL(recaptcha.src).searchParams.get('k') : null;
      
      // Also check data attributes
      const turnstileData = document.querySelector('[data-sitekey]');
      
      return {
        isBlocked: bodyTextLocal.includes('captcha') || 
                   bodyTextLocal.includes('verify you are human') ||
                   bodyTextLocal.includes('security service') ||
                   bodyTextLocal.includes('Just a moment') ||
                   title.includes('Security') ||
                   title.includes('Just a moment'),
        turnstile: turnstileKey || turnstileData?.dataset?.sitekey,
        hcaptcha: hcaptchaKey,
        recaptcha: recaptchaKey
      };
    });

    console.log('🔍 Captcha detection:', JSON.stringify(captchaInfo, null, 2));

    if (captchaInfo.isBlocked) {
      let token = null;
      let type = null;

      if (captchaInfo.turnstile) {
        console.log(`\n🎯 Found Turnstile sitekey: ${captchaInfo.turnstile}`);
        token = await solveTurnstile(page, captchaInfo.turnstile, url);
        type = 'turnstile';
      } else if (captchaInfo.hcaptcha) {
        console.log(`\n🎯 Found hCaptcha sitekey: ${captchaInfo.hcaptcha}`);
        token = await solveHCaptcha(page, captchaInfo.hcaptcha, url);
        type = 'hcaptcha';
      } else if (captchaInfo.recaptcha) {
        console.log(`\n🎯 Found reCAPTCHA sitekey: ${captchaInfo.recaptcha}`);
        token = await solveRecaptchaV2(page, captchaInfo.recaptcha, url);
        type = 'recaptcha';
      } else {
        console.log('\n⚠️ No captcha sitekey found, waiting for auto-resolve...');
        await new Promise(r => setTimeout(r, 20000));
      }

      if (token) {
        console.log('✅ Got token:', token.substring(0, 50) + '...');
        await injectToken(page, token, type);
        await new Promise(r => setTimeout(r, 5000));
      }

      // Check result
      const bodyAfter = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || '');
      console.log(`📝 After solve: ${bodyAfter.substring(0, 150)}...`);
    }

    // Take screenshot
    await page.screenshot({ path, fullPage: false });
    console.log(`\n✅ Saved: ${path}`);
    
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
  } finally {
    await browser.close();
  }
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
    await captureScreenshot(shot.url, shot.path, shot.width, shot.height);
  }

  console.log('\n🎉 All screenshots done!');
})();
