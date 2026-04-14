/**
 * 🔍 Whale Tracker - On-Chain Intelligence Tool
 * 
 * Proactively tracks whale wallets, detects smart money patterns,
 * and identifies accumulation/distribution before price movements.
 * 
 * Similar to Lookonchain/Arkham Intelligence but self-hosted.
 * 
 * Usage:
 *   node whale-tracker.js                    # Track predefined whale list
 *   node whale-tracker.js --token 0x...      # Track specific token
 *   node whale-tracker.js --watch 0x...      # Watch specific wallet
 *   node whale-tracker.js --alert 100000     # Alert on transfers > $100K
 */

const ETHERSCAN_API_KEY = '94ZBJE843MVHAQTZCVQKWGZ2DSVU6MA3WK';
const BASE_URL = 'https://api.etherscan.io/v2/api';

// ==================== Configuration ====================

const CONFIG = {
  // ETH price in USD (can be fetched from API)
  ethPriceUSD: 3000,
  
  // Whale classification thresholds
  thresholds: {
    megaWhale: 10000,      // > 10,000 ETH
    whale: 1000,           // > 1,000 ETH
    largeHolder: 100,      // > 100 ETH
    smartMoney: 50         // > 50 ETH with activity
  },

  // Transfer alert threshold (USD)
  alertThresholdUSD: 100000,

  // Known exchange/wallet labels
  knownWallets: {
    '0x0d0707963952f2fba59dd06f2b425ace40b492fe': { label: 'Unknown Whale', risk: 'HIGH' },
    '0x8a5221f95c8af2d249bc1a7f075b31336ee5032f': { label: 'Distributor/Minter', risk: 'MEDIUM' },
    '0x566b30470d7ad97419a48900dc869bd7148736b8': { label: 'Aggregator Hot Wallet', risk: 'MEDIUM' },
    // Add known exchange wallets here
    '0x28c6c06298d514db089934071355e5743bf21d60': { label: 'Binance Hot Wallet', risk: 'LOW' },
    '0x21a31ee1afc51d94c2efccaa2092ad1028285549': { label: 'Binance Cold Wallet', risk: 'LOW' },
  }
};

// ==================== API Helper Functions ====================

async function fetchEtherscan(module, action, params = {}) {
  const url = `${BASE_URL}?chainid=1&module=${module}&action=${action}&apikey=${ETHERSCAN_API_KEY}`;
  const queryParams = new URLSearchParams(params).toString();
  const fullUrl = queryParams ? `${url}&${queryParams}` : url;

  try {
    const response = await fetch(fullUrl);
    const data = await response.json();

    if (data.status === '1' || data.status === 1) {
      return data.result;
    } else {
      console.error(`❌ API Error (${action}):`, data.message || data.result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Fetch Error (${action}):`, error.message);
    return null;
  }
}

// ==================== Core Analysis Functions ====================

/**
 * Get ETH balance for a wallet
 */
async function getETHBalance(address) {
  const result = await fetchEtherscan('account', 'balance', { address });
  if (!result) return null;

  const balanceETH = parseInt(result) / 1e18;
  const balanceUSD = balanceETH * CONFIG.ethPriceUSD;

  return {
    address,
    balanceETH,
    balanceUSD,
    classification: classifyWhale(balanceETH)
  };
}

/**
 * Get ERC20 token balance for a wallet
 */
async function getTokenBalance(contractAddress, walletAddress) {
  const result = await fetchEtherscan('account', 'tokenbalance', {
    contractaddress: contractAddress,
    address: walletAddress
  });

  if (!result) return null;

  return {
    contractAddress,
    walletAddress,
    balance: parseInt(result)
  };
}

/**
 * Get recent ERC20 token transfers for a wallet
 */
async function getTokenTransfers(contractAddress, walletAddress, page = 1, offset = 20) {
  const transfers = await fetchEtherscan('account', 'tokentx', {
    contractaddress: contractAddress,
    address: walletAddress,
    page: page.toString(),
    offset: offset.toString(),
    sort: 'desc'
  });

  if (!transfers || !Array.isArray(transfers)) return [];

  return transfers.map(tx => ({
    blockNumber: tx.blockNumber,
    timeStamp: tx.timeStamp,
    from: tx.from,
    to: tx.to,
    value: parseInt(tx.value) / 1e18, // Adjust decimals
    contractAddress: tx.contractAddress,
    tokenName: tx.tokenName,
    tokenSymbol: tx.tokenSymbol,
    hash: tx.hash,
    direction: tx.from.toLowerCase() === walletAddress.toLowerCase() ? 'OUT' : 'IN'
  }));
}

/**
 * Get normal ETH transactions for a wallet
 */
async function getNormalTransactions(walletAddress, page = 1, offset = 10) {
  const txs = await fetchEtherscan('account', 'txlist', {
    address: walletAddress,
    page: page.toString(),
    offset: offset.toString(),
    sort: 'desc'
  });

  if (!txs || !Array.isArray(txs)) return [];

  return txs.map(tx => ({
    hash: tx.hash,
    timeStamp: tx.timeStamp,
    from: tx.from,
    to: tx.to,
    value: parseInt(tx.value) / 1e18,
    valueUSD: (parseInt(tx.value) / 1e18) * CONFIG.ethPriceUSD,
    gasUsed: tx.gasUsed,
    gasPrice: parseInt(tx.gasPrice) / 1e9
  }));
}

// ==================== Analysis & Classification ====================

/**
 * Classify wallet size based on ETH balance
 */
function classifyWhale(balanceETH) {
  const { megaWhale, whale, largeHolder, smartMoney } = CONFIG.thresholds;

  if (balanceETH >= megaWhale) return { tier: 'MEGA WHALE', emoji: '🐋🐋', risk: 'CRITICAL' };
  if (balanceETH >= whale) return { tier: 'WHALE', emoji: '🐋', risk: 'HIGH' };
  if (balanceETH >= largeHolder) return { tier: 'LARGE HOLDER', emoji: '🦈', risk: 'MEDIUM' };
  if (balanceETH >= smartMoney) return { tier: 'SMART MONEY', emoji: '🧠', risk: 'MEDIUM' };
  return { tier: 'RETAIL', emoji: '🐟', risk: 'LOW' };
}

/**
 * Analyze token flow pattern for a wallet
 */
function analyzeFlowPattern(transfers) {
  if (!transfers || transfers.length === 0) return null;

  let totalIn = 0;
  let totalOut = 0;
  let incomingCount = 0;
  let outgoingCount = 0;
  const uniqueAddresses = new Set();

  transfers.forEach(tx => {
    if (tx.direction === 'IN') {
      totalIn += tx.value;
      incomingCount++;
      uniqueAddresses.add(tx.from);
    } else {
      totalOut += tx.value;
      outgoingCount++;
      uniqueAddresses.add(tx.to);
    }
  });

  const netFlow = totalIn - totalOut;
  const flowRatio = totalOut > 0 ? totalIn / totalOut : Infinity;

  // Classify behavior
  let behavior;
  if (flowRatio > 2) {
    behavior = 'ACCUMULATING';
  } else if (flowRatio < 0.5) {
    behavior = 'DISTRIBUTING';
  } else {
    behavior = 'NEUTRAL';
  }

  return {
    totalIn,
    totalOut,
    netFlow,
    incomingCount,
    outgoingCount,
    uniqueCounterparties: uniqueAddresses.size,
    flowRatio: flowRatio === Infinity ? '∞' : flowRatio.toFixed(2),
    behavior
  };
}

/**
 * Detect suspicious patterns (pre-pump accumulation, pre-dump distribution)
 */
function detectSuspiciousActivity(transfers, threshold = 10000) {
  const alerts = [];

  // Check for large single transfers
  transfers.forEach(tx => {
    if (tx.value >= threshold) {
      alerts.push({
        type: 'LARGE_TRANSFER',
        severity: 'HIGH',
        message: `Large transfer: ${tx.value.toLocaleString()} ${tx.tokenSymbol}`,
        direction: tx.direction,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp: tx.timeStamp,
        txHash: tx.hash
      });
    }
  });

  // Check for rapid distribution (multiple outgoing in short time)
  const outgoing = transfers.filter(tx => tx.direction === 'OUT');
  if (outgoing.length > 5) {
    const timeWindow = parseInt(outgoing[0].timeStamp) - parseInt(outgoing[outgoing.length - 1].timeStamp);
    const timeWindowHours = timeWindow / 3600;

    if (timeWindowHours < 24) {
      alerts.push({
        type: 'RAPID_DISTRIBUTION',
        severity: 'CRITICAL',
        message: `⚠️ ${outgoing.length} outgoing transfers in ${timeWindowHours.toFixed(1)} hours`,
        count: outgoing.length,
        timeWindow: `${timeWindowHours.toFixed(1)} hours`
      });
    }
  }

  // Check for accumulation pattern
  const incoming = transfers.filter(tx => tx.direction === 'IN');
  if (incoming.length > 5 && outgoing.length < 2) {
    alerts.push({
      type: 'ACCUMULATION',
      severity: 'MEDIUM',
      message: `📈 Accumulating: ${incoming.length} incoming, ${outgoing.length} outgoing`,
      incomingCount: incoming.length,
      outgoingCount: outgoing.length
    });
  }

  return alerts;
}

// ==================== Report Generation ====================

/**
 * Generate comprehensive whale analysis report
 */
function generateWhaleReport(walletData, transfers, flowAnalysis, alerts) {
  const { address, balanceETH, balanceUSD, classification } = walletData;
  const knownInfo = CONFIG.knownWallets[address.toLowerCase()] || { label: 'Unknown', risk: 'UNKNOWN' };

  const report = {
    wallet: {
      address,
      label: knownInfo.label,
      balance: {
        eth: balanceETH.toLocaleString(),
        usd: `$${balanceUSD.toLocaleString()}`
      },
      classification: `${classification.emoji} ${classification.tier}`,
      risk: knownInfo.risk
    },
    activity: {
      flowPattern: flowAnalysis.behavior,
      totalIn: `${flowAnalysis.totalIn.toLocaleString()} tokens`,
      totalOut: `${flowAnalysis.totalOut.toLocaleString()} tokens`,
      netFlow: `${flowAnalysis.netFlow > 0 ? '+' : ''}${flowAnalysis.netFlow.toLocaleString()} tokens`,
      counterparties: flowAnalysis.uniqueCounterparties
    },
    alerts: alerts.map(a => ({
      severity: a.severity,
      message: a.message
    })),
    timestamp: new Date().toISOString()
  };

  return report;
}

/**
 * Print formatted analysis report to console
 */
function printReport(report) {
  console.log('\n' + '='.repeat(60));
  console.log('🐋 WHALE ANALYSIS REPORT');
  console.log('='.repeat(60));

  console.log(`\n📍 Wallet: ${report.wallet.address}`);
  console.log(`🏷️  Label: ${report.wallet.label}`);
  console.log(`💰 Balance: ${report.wallet.balance.eth} ETH (~${report.wallet.balance.usd})`);
  console.log(`📊 Classification: ${report.wallet.classification}`);
  console.log(`⚠️  Risk Level: ${report.wallet.risk}`);

  console.log(`\n📈 Activity Pattern:`);
  console.log(`   Flow: ${report.activity.flowPattern}`);
  console.log(`   Total In: ${report.activity.totalIn}`);
  console.log(`   Total Out: ${report.activity.totalOut}`);
  console.log(`   Net Flow: ${report.activity.netFlow}`);
  console.log(`   Counterparties: ${report.activity.counterparties}`);

  if (report.alerts.length > 0) {
    console.log(`\n🚨 Alerts (${report.alerts.length}):`);
    report.alerts.forEach((alert, i) => {
      console.log(`   ${i + 1}. [${alert.severity}] ${alert.message}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// ==================== Main Tracking Functions ====================

/**
 * Track a specific wallet comprehensively
 */
async function trackWallet(walletAddress, tokenContract = null) {
  console.log(`\n🔍 Tracking wallet: ${walletAddress}\n`);

  // 1. Get ETH balance
  console.log('📊 Fetching ETH balance...');
  const ethBalance = await getETHBalance(walletAddress);

  if (!ethBalance) {
    console.error('❌ Failed to fetch balance');
    return;
  }

  console.log(`   💰 ${ethBalance.balanceETH.toFixed(2)} ETH (~$${ethBalance.balanceUSD.toLocaleString()})`);
  console.log(`   📊 ${ethBalance.classification.emoji} ${ethBalance.classification.tier}`);

  // 2. Get token transfers (if token specified)
  let transfers = [];
  if (tokenContract) {
    console.log('\n🔄 Fetching token transfers...');
    transfers = await getTokenTransfers(tokenContract, walletAddress, 1, 20);
    console.log(`   📝 Found ${transfers.length} recent transfers`);
  } else {
    console.log('\n⚠️  No token contract specified, skipping token transfers');
  }

  // 3. Analyze flow pattern
  let flowAnalysis = null;
  if (transfers.length > 0) {
    console.log('\n📈 Analyzing flow pattern...');
    flowAnalysis = analyzeFlowPattern(transfers);
    console.log(`   🔄 Behavior: ${flowAnalysis.behavior}`);
    console.log(`   📊 Flow Ratio: ${flowAnalysis.flowRatio}`);
    console.log(`   ↔️ Net Flow: ${flowAnalysis.netFlow > 0 ? '+' : ''}${flowAnalysis.netFlow.toFixed(2)} tokens`);
  }

  // 4. Detect suspicious activity
  let alerts = [];
  if (transfers.length > 0) {
    console.log('\n🚨 Checking for suspicious activity...');
    alerts = detectSuspiciousActivity(transfers);
    if (alerts.length > 0) {
      console.log(`   ⚠️  ${alerts.length} alerts detected!`);
      alerts.forEach(a => console.log(`      [${a.severity}] ${a.message}`));
    } else {
      console.log('   ✅ No suspicious activity detected');
    }
  }

  // 5. Generate report
  const report = generateWhaleReport(ethBalance, transfers, flowAnalysis || { behavior: 'N/A', totalIn: 0, totalOut: 0, netFlow: 0, uniqueCounterparties: 0 }, alerts);
  printReport(report);

  return report;
}

/**
 * Scan multiple top holders for a token
 */
async function scanTokenHolders(tokenContract, topN = 20) {
  console.log(`\n🔍 Scanning top ${topN} holders for token: ${tokenContract}\n`);

  // Get token transfers to identify active wallets
  // Note: Etherscan API doesn't have direct "top holders" endpoint
  // We'll analyze from recent large transfers

  const transfers = await fetchEtherscan('account', 'tokentx', {
    contractaddress: tokenContract,
    page: '1',
    offset: '100',
    sort: 'desc'
  });

  if (!transfers || !Array.isArray(transfers)) {
    console.error('❌ Failed to fetch transfers');
    return;
  }

  // Aggregate balances from recent transfers
  const balanceMap = {};

  transfers.forEach(tx => {
    const value = parseInt(tx.value) / 1e18;

    if (!balanceMap[tx.to]) balanceMap[tx.to] = 0;
    balanceMap[tx.to] += value;

    if (!balanceMap[tx.from]) balanceMap[tx.from] = 0;
    balanceMap[tx.from] -= value;
  });

  // Sort by balance and get top N
  const sortedHolders = Object.entries(balanceMap)
    .filter(([_, balance]) => balance > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  console.log(`📊 Top ${topN} Active Wallets (from recent transfers):\n`);
  console.log('Rank | Wallet Address                      | Est. Balance | Classification');
  console.log('-'.repeat(80));

  for (let i = 0; i < sortedHolders.length; i++) {
    const [address, balance] = sortedHolders[i];
    const ethBalance = await getETHBalance(address);

    if (ethBalance) {
      const classification = classifyWhale(ethBalance.balanceETH);
      console.log(
        `${(i + 1).toString().padStart(4)} | ${address} | ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 }).padStart(14)} | ${classification.emoji} ${classification.tier}`
      );
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// ==================== CLI Interface ====================

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    mode: 'track', // track, scan, watch
    token: '0x17205fab260a7a6383a81452cE6315A39370Db97', // Default: RAVE
    wallet: null,
    alertThreshold: CONFIG.alertThresholdUSD
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--token':
        config.token = args[++i];
        break;
      case '--wallet':
      case '--watch':
        config.wallet = args[++i];
        break;
      case '--scan':
        config.mode = 'scan';
        config.token = args[++i] || config.token;
        break;
      case '--alert':
        config.alertThreshold = parseInt(args[++i]);
        break;
      case '--help':
        console.log(`
🐋 Whale Tracker - On-Chain Intelligence

Usage:
  node whale-tracker.js                    # Track default whales
  node whale-tracker.js --wallet 0x...     # Track specific wallet
  node whale-tracker.js --token 0x...      # Track with specific token
  node whale-tracker.js --scan 0x...       # Scan token holders
  node whale-tracker.js --alert 100000     # Set alert threshold ($100K)

Examples:
  # Track RAVE whale
  node whale-tracker.js --wallet 0x0d0707963952f2fba59dd06f2b425ace40b492fe --token 0x17205fab260a7a6383a81452cE6315A39370Db97

  # Scan RAVE token holders
  node whale-tracker.js --scan 0x17205fab260a7a6383a81452cE6315A39370Db97

  # Track whale with custom alert threshold
  node whale-tracker.js --wallet 0x... --alert 50000
`);
        process.exit(0);
    }
  }

  return config;
}

// ==================== Main Execution ====================

(async () => {
  console.log('🐋 Whale Tracker - On-Chain Intelligence Tool');
  console.log('Similar to Lookonchain/Arkham Intelligence\n');

  const config = parseArgs();

  if (config.mode === 'track') {
    if (config.wallet) {
      // Track specific wallet
      await trackWallet(config.wallet, config.token);
    } else {
      // Track predefined whales (RAVE example)
      console.log('📋 Tracking predefined whale wallets...\n');

      const whales = [
        { address: '0x0d0707963952f2fba59dd06f2b425ace40b492fe', label: 'Mega Whale (13,489 ETH)' },
        { address: '0x8a5221f95c8af2d249bc1a7f075b31336ee5032f', label: 'Distributor/Minter' },
        { address: '0x566b30470d7ad97419a48900dc869bd7148736b8', label: 'Aggregator Hot Wallet' }
      ];

      for (const whale of whales) {
        console.log(`\n🔍 Analyzing: ${whale.label}`);
        await trackWallet(whale.address, config.token);
        await new Promise(r => setTimeout(r, 2000)); // Rate limiting
      }
    }
  } else if (config.mode === 'scan') {
    // Scan token holders
    await scanTokenHolders(config.token);
  }
})();
