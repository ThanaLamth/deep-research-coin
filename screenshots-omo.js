const puppeteer = require('puppeteer');
const https = require('https');

const OMO_API_KEY = 'OMO_1JXIMO0WUCVSGJE8BNXPXI07IDAS8LQIQOBAWP7UD3T1AP07LHWH4IUKNHLWH21767076604';

// Helper to make fetch requests
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': OMO_API_KEY },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function getJSON(url) {
  const res = await fetch(url, {
    headers: { 'X-API-Key': OMO_API_KEY }
  });
  return res.json();
}

// OMO Captcha solver
async function solveWithOMO(pageUrl) {
  console.log('🔄 Creating OMO task for:', pageUrl);
  
  // Try Cloudflare Turnstile
  const createRes = await postJSON('https://api.omocaptcha.com/api/v1/captcha', {
    type: 'turnstile',
    website: pageUrl,
    action: 'login'
  });
  
  console.log('Create response:', JSON.stringify(createRes, null, 2));
  
  if (!createRes?.taskId && !createRes?.id) {
    console.log('Failed to create task, trying alternative...');
    // Try recaptcha
    const createRes2 = await postJSON('https://api.omocaptcha.com/api/v1/captcha', {
      type: 'recaptcha',
      website: pageUrl,
      invisible: true
    });
    console.log('Alternative response:', JSON.stringify(createRes2, null, 2));
    return createRes2;
  }
  
  return createRes;
}

async function waitForOMOResult(taskId, maxAttempts = 45) {
  console.log('⏳ Waiting for OMO result...');
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000));
    
    const result = await getJSON(`https://api.omocaptcha.com/api/v1/captcha/${taskId}`);
    
    if (i % 5 === 0) {
      console.log(`  Poll ${i + 1}/${maxAttempts}: ${result?.status || 'unknown'}`);
    }
    
    if (result?.status === 'ready') {
      console.log('✅ Captcha solved!');
      return result;
    }
    
    if (result?.status === 'failed' || result?.error) {
      console.log('❌ Captcha failed:', result);
      return null;
    }
  }
  
  console.log('⏰ Timeout waiting for result');
  return null;
}

async function bypassCloudflare(page, url) {
  try {
    // Step 1: Try to solve with OMO
    const task = await solveWithOMO(url);
    const taskId = task?.taskId || task?.id;
    
    if (!taskId) {
      console.log('No task created, trying direct approach...');
      return false;
    }
    
    const result = await waitForOMOResult(taskId);
    
    if (result?.solution?.token) {
      console.log('Got token, injecting...');
      await page.evaluate((token) => {
        // Find turnstile callback
        const callback = window?.___turnstile?.callback || 
                        window?.turnstile?.callback ||
                        (() => {});
        
        // Set hidden token field
        const hiddenInput = document.querySelector('input[name="cf_turnstile_response"]');
        if (hiddenInput) hiddenInput.value = token;
        
        // Trigger callback
        if (typeof callback === 'function') callback(token);
      }, result.solution.token);
      
      await new Promise(r => setTimeout(r, 3000));
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Bypass error:', err.message);
    return false;
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials'
    ]
  });

  const screenshots = [
    {
      url: 'https://coinmarketcap.com/currencies/ravedao/',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\coinmarketcap-price.png',
      width: 1440,
      height: 900,
      needsAuth: false
    },
    {
      url: 'https://etherscan.io/token/0x17205fab260a7a6383a81452cE6315A39370Db97',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\etherscan-total-supply.png',
      width: 1440,
      height: 900,
      needsAuth: true
    },
    {
      url: 'https://etherscan.io/address/0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\etherscan-whale-wallet.png',
      width: 1440,
      height: 900,
      needsAuth: true
    },
    {
      url: 'https://etherscan.io/address/0x566b30470d7ad97419a48900dc869bd7148736b8',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\etherscan-aggregator.png',
      width: 1440,
      height: 900,
      needsAuth: true
    },
    {
      url: 'https://etherscan.io/token/0x17205fab260a7a6383a81452cE6315A39370Db97?a=0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\etherscan-whale-transfers.png',
      width: 1440,
      height: 1000,
      needsAuth: true
    },
    {
      url: 'https://www.coingecko.com/en/coins/ravedao',
      path: 'C:\\Users\\admin\\deep-research-coin\\images\\coingecko-chart.png',
      width: 1440,
      height: 900,
      needsAuth: true
    }
  ];

  for (const shot of screenshots) {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: shot.width, height: shot.height });
      
      // Anti-detection
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        window.chrome = { runtime: {} };
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      });

      console.log(`\n${'='.repeat(60)}`);
      console.log(`📸 Capturing: ${shot.url}`);
      console.log('='.repeat(60));
      
      // Navigate with longer timeout
      try {
        await page.goto(shot.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      } catch (err) {
        console.log(`Navigation issue: ${err.message}`);
      }

      // Wait for potential redirect/challenge
      await new Promise(r => setTimeout(r, 5000));

      // Check page state
      const title = await page.title();
      const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || '');
      
      console.log(`📄 Title: ${title}`);
      console.log(`📝 Body: ${bodyText.substring(0, 150)}...`);

      // Check if blocked
      const isBlocked = bodyText.includes('captcha') || 
                        bodyText.includes('verify you are human') ||
                        bodyText.includes('security service') ||
                        bodyText.includes('Just a moment') ||
                        bodyText.includes('challenge') ||
                        title.includes('Security') ||
                        title.includes('Just a moment');

      if (isBlocked && shot.needsAuth) {
        console.log('\n🚫 Cloudflare detected, attempting OMO bypass...');
        
        const solved = await bypassCloudflare(page, shot.url);
        
        if (solved) {
          console.log('✅ Captcha bypassed!');
          await new Promise(r => setTimeout(r, 5000));
        } else {
          console.log('⚠️ OMO could not solve, trying longer wait...');
          // Sometimes Cloudflare auto-resolves
          await new Promise(r => setTimeout(r, 15000));
        }
        
        // Check again
        const bodyText2 = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || '');
        console.log(`📝 After bypass: ${bodyText2.substring(0, 150)}...`);
      }

      // Final screenshot
      await page.screenshot({ path: shot.path, fullPage: false });
      console.log(`✅ Saved: ${shot.path}`);
      
      await page.close();
    } catch (err) {
      console.error(`❌ Failed ${shot.url}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\n🎉 Done!');
})();
