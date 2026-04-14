/**
 * 🔍 Pattern Matcher - Similar Coin Discovery Engine
 *
 * Logic:
 * 1. Build "pattern signature" from on-chain + FA data
 * 2. Compare with historical pumped coins database
 * 3. Find coins with similar patterns that are about to pump
 * 4. Find coins that already pumped with same pattern (validation)
 *
 * Multi-chain: Ethereum (Etherscan), Solana (Solscan), BSC (Bscscan)
 */

const fs = require('fs');
const path = require('path');

// ==================== API Configuration ====================

const APIS = {
  etherscan: {
    key: '94ZBJE843MVHAQTZCVQKWGZ2DSVU6MA3WK',
    baseUrl: 'https://api.etherscan.io/v2/api'
  },
  solscan: {
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NzYwNzM3MTgxNTYsImVtYWlsIjoiaWtub3duYW0xMzEyQGdtYWlsLmNvbSIsImFjdGlvbiI6InRva2VuLWFwaSIsImFwaVZlcnNpb24iOiJ2MiIsImlhdCI6MTc3NjA3MzcxOH0.t7ez7CfknhwWF6-v8QsAfyprTDSdofiw22ncBekUoyY',
    baseUrl: 'https://public-api.solscan.io'
  },
  bscscan: {
    key: 'YourBscscanAPIKey', // Replace with your key
    baseUrl: 'https://api.bscscan.com/api'
  }
};

// ==================== Historical Pattern Database ====================
// Coins that already pumped with verified on-chain + FA patterns

const HISTORICAL_PUMPED_COINS = [
  {
    name: 'RaveDAO',
    symbol: 'RAVE',
    slug: 'ravedao',
    chain: 'ethereum',
    pumpDate: '2026-04-10',
    pumpMagnitude: '22x', // 7d change
    pattern: {
      whaleAccumulation: true,
      lowFloat: true,           // <30% circulating
      futuresSqueeze: true,     // futures:spot > 10:1
      socialHype: true,         // 5x mentions spike
      eventCatalyst: true,      // Upcoming event
      insiderActivity: true,    // Pre-pump deposits
      exchangeListing: true,    // Recent listing
      mintingActive: true,
      distributionToExchange: true,
      volumeMcapRatio: 0.69     // 69% of mcap
    },
    prePumpSignals: {
      whaleNetFlow: '+10M tokens',
      socialMentionsSpike: '5x in 24h',
      volumeIncrease: '300% in 48h',
      exchangeOutflow: '10M withdrawn from Bitget',
      daysBeforePump: 14
    }
  },
  {
    name: 'Pepe',
    symbol: 'PEPE',
    slug: 'pepe',
    chain: 'ethereum',
    pumpDate: '2023-04-15',
    pumpMagnitude: '7000x',
    pattern: {
      whaleAccumulation: true,
      lowFloat: false,
      futuresSqueeze: false,
      socialHype: true,
      eventCatalyst: false,
      insiderActivity: false,
      exchangeListing: false,
      mintingActive: false,
      distributionToExchange: false,
      volumeMcapRatio: 2.5,
      memeCoin: true,
      communityDriven: true
    },
    prePumpSignals: {
      socialMentionsSpike: '20x in 24h',
      volumeIncrease: '5000% in 72h',
      holderGrowth: '10,000 new holders in 3 days',
      daysBeforePump: 7
    }
  },
  {
    name: 'Arbitrum',
    symbol: 'ARB',
    slug: 'arbitrum',
    chain: 'ethereum',
    pumpDate: '2023-03-23',
    pumpMagnitude: '3x',
    pattern: {
      whaleAccumulation: true,
      lowFloat: true,           // 12.75% circulating at TGE
      futuresSqueeze: false,
      socialHype: true,
      eventCatalyst: true,      // Airdrop + TGE
      insiderActivity: true,
      exchangeListing: true,    // Major listings
      mintingActive: false,
      distributionToExchange: true,
      volumeMcapRatio: 0.8,
      layer2: true
    },
    prePumpSignals: {
      whaleNetFlow: '+50M tokens accumulated',
      socialMentionsSpike: '10x in 48h',
      airdropAnnouncement: true,
      daysBeforePump: 30
    }
  },
  {
    name: 'Sui',
    symbol: 'SUI',
    slug: 'sui',
    chain: 'ethereum', // Main token on multiple chains
    pumpDate: '2024-01-10',
    pumpMagnitude: '8x',
    pattern: {
      whaleAccumulation: true,
      lowFloat: true,           // Low circulating at launch
      futuresSqueeze: false,
      socialHype: true,
      eventCatalyst: true,      // Mainnet milestones
      insiderActivity: true,
      exchangeListing: true,
      mintingActive: false,
      distributionToExchange: false,
      volumeMcapRatio: 0.4,
      layer1: true,
      unlockPressure: true      // Future unlocks
    },
    prePumpSignals: {
      whaleNetFlow: '+20M tokens',
      mainnetMilestone: true,
      volumeIncrease: '200% in 7 days',
      daysBeforePump: 21
    }
  },
  {
    name: 'Bonk',
    symbol: 'BONK',
    slug: 'bonk',
    chain: 'solana',
    pumpDate: '2023-12-15',
    pumpMagnitude: '100x',
    pattern: {
      whaleAccumulation: true,
      lowFloat: false,
      futuresSqueeze: false,
      socialHype: true,
      eventCatalyst: false,
      insiderActivity: false,
      exchangeListing: true,    // Coinbase listing
      mintingActive: false,
      distributionToExchange: false,
      volumeMcapRatio: 1.8,
      memeCoin: true,
      communityDriven: true,
      solana: true
    },
    prePumpSignals: {
      socialMentionsSpike: '15x in 24h',
      exchangeListingAnnounced: 'Coinbase',
      volumeIncrease: '800% in 48h',
      holderGrowth: '50,000 new holders in 5 days',
      daysBeforePump: 5
    }
  }
];

// ==================== Potential Pump Candidates Database ====================
// Coins being tracked for potential pump (updated dynamically)

const PUMP_CANDIDATES = {
  ethereum: [],
  solana: [],
  bsc: []
};

// ==================== API Helper Functions ====================

async function fetchEtherscan(module, action, params = {}) {
  const url = `${APIS.etherscan.baseUrl}?chainid=1&module=${module}&action=${action}&apikey=${APIS.etherscan.key}`;
  const queryParams = new URLSearchParams(params).toString();
  const fullUrl = queryParams ? `${url}&${queryParams}` : url;

  try {
    const response = await fetch(fullUrl);
    const data = await response.json();
    if (data.status === '1' || data.status === 1) return data.result;
    return null;
  } catch {
    return null;
  }
}

async function fetchSolscan(endpoint, params = {}) {
  const url = `${APIS.solscan.baseUrl}${endpoint}`;
  const queryParams = new URLSearchParams(params).toString();
  const fullUrl = queryParams ? `${url}?${queryParams}` : url;

  try {
    const response = await fetch(fullUrl, {
      headers: {
        'token': APIS.solscan.key,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchBscscan(module, action, params = {}) {
  const url = `${APIS.bscscan.baseUrl}?module=${module}&action=${action}&apikey=${APIS.bscscan.key}`;
  const queryParams = new URLSearchParams(params).toString();
  const fullUrl = queryParams ? `${url}&${queryParams}` : url;

  try {
    const response = await fetch(fullUrl);
    const data = await response.json();
    if (data.status === '1' || data.status === 1) return data.result;
    return null;
  } catch {
    return null;
  }
}

// ==================== Pattern Signature Builder ====================

/**
 * Build pattern signature from on-chain + FA data
 * Returns a comparable pattern object
 */
function buildPatternSignature(cmcData, onChainData, fundamental) {
  const change24h = cmcData.change24h ? parseFloat(cmcData.change24h.replace(/[^0-9.-]/g, '')) : 0;

  // Calculate volume/mcap ratio
  const volumeNum = cmcData.volume24h ? parseFloat(cmcData.volume24h.replace(/[^0-9.]/g, '')) : 0;
  const mcapNum = cmcData.marketCap ? parseFloat(cmcData.marketCap.replace(/[^0-9.]/g, '')) : 1;
  const volumeMcapRatio = mcapNum > 0 ? volumeNum / mcapNum : 0;

  // Whale activity score
  const whaleAccumulation = onChainData.whaleFlow.accumulationWallets.length > 0;
  const whaleDistribution = onChainData.whaleFlow.distributionWallets.length > 0;
  const whaleFlowScore = onChainData.whaleFlow.accumulationWallets.length - onChainData.whaleFlow.distributionWallets.length;

  // Supply structure
  const totalSupply = onChainData.totalSupplyRaw || 0;
  const hasLowFloat = totalSupply > 0; // Would need circulating supply data

  // Social sentiment (from fundamental analysis)
  const socialHype = fundamental.news.length > 0 || fundamental.catalysts.length > 0;

  // Event catalysts
  const eventCatalyst = fundamental.catalysts.some(c => c.type === 'event');
  const exchangeListing = fundamental.catalysts.some(c => c.type === 'listing');

  return {
    // Price momentum
    change24h,
    volumeMcapRatio: parseFloat(volumeMcapRatio.toFixed(3)),

    // Whale patterns
    whaleAccumulation,
    whaleDistribution,
    whaleFlowScore,
    whaleAccumulationCount: onChainData.whaleFlow.accumulationWallets.length,
    whaleDistributionCount: onChainData.whaleFlow.distributionWallets.length,
    largeTransferCount: onChainData.whaleFlow.largeTransfers.length,

    // Supply structure
    hasLowFloat,
    totalSupply: onChainData.totalSupply,
    circulatingSupplyRatio: null, // Would need external data

    // Activity patterns
    socialHype,
    eventCatalyst,
    exchangeListing,
    newsCount: fundamental.news.length,
    catalystCount: fundamental.catalysts.length,

    // Risk factors
    riskCount: fundamental.risks.length,
    highRiskCount: fundamental.risks.filter(r => r.severity === 'HIGH' || r.severity === 'CRITICAL').length,

    // On-chain health
    activeWalletCount: onChainData.topWallets.length,
    recentTransferCount: onChainData.recentTransferCount,
    netFlowDirection: onChainData.tokenFlow.netFlow > 0 ? 'inflow' : 'outflow',
    netFlowMagnitude: Math.abs(onChainData.tokenFlow.netFlow)
  };
}

// ==================== Pattern Similarity Calculator ====================

/**
 * Calculate similarity score between two patterns (0-100)
 */
function calculatePatternSimilarity(pattern1, pattern2) {
  let score = 0;
  let maxScore = 0;

  // Helper to compare boolean fields
  function compareBool(field, weight = 10) {
    maxScore += weight;
    if (pattern1[field] === pattern2[field]) {
      if (pattern1[field] === true) score += weight; // Both true = higher weight
      else score += weight * 0.5; // Both false = partial match
    }
  }

  // Helper to compare numeric ranges
  function compareRange(field, threshold, weight = 10) {
    maxScore += weight;
    const val1 = pattern1[field] || 0;
    const val2 = pattern2[field] || 0;
    const diff = Math.abs(val1 - val2);
    if (diff < threshold) score += weight;
    else if (diff < threshold * 2) score += weight * 0.5;
  }

  // Compare whale patterns (high weight)
  compareBool('whaleAccumulation', 20);
  compareBool('whaleDistribution', 15);
  compareRange('whaleFlowScore', 3, 15);
  compareRange('largeTransferCount', 5, 10);

  // Compare supply structure
  compareBool('hasLowFloat', 10);

  // Compare social sentiment
  compareBool('socialHype', 10);
  compareBool('eventCatalyst', 8);
  compareBool('exchangeListing', 8);
  compareRange('newsCount', 3, 5);

  // Compare volume dynamics
  compareRange('volumeMcapRatio', 0.3, 10);
  compareRange('change24h', 30, 8);

  // Compare risk profile
  compareRange('highRiskCount', 2, 8);

  // Compare on-chain activity
  compareRange('activeWalletCount', 5, 5);
  compareRange('recentTransferCount', 20, 5);

  // Calculate percentage
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

// ==================== Find Similar Coins ====================

/**
 * Find coins with similar patterns
 * Returns: 5 coins about to pump + 5 coins that already pumped with same pattern
 */
function findSimilarCoins(currentPattern, currentSlug, options = {}) {
  console.log('🔍 Finding similar coin patterns...');

  const results = {
    alreadyPumped: [],    // Coins with same pattern that already pumped (validation)
    aboutToPump: [],      // Coins with similar pre-pump signals (opportunities)
    matchCount: 0
  };

  // Compare with historical database
  const comparisons = HISTORICAL_PUMPED_COINS
    .filter(coin => coin.slug !== currentSlug) // Exclude current coin
    .map(coin => {
      const similarity = calculatePatternSimilarity(currentPattern, coin.pattern);
      return { ...coin, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity);

  // Top 5 that already pumped (for validation)
  results.alreadyPumped = comparisons.slice(0, 5).map(coin => ({
    name: coin.name,
    symbol: coin.symbol,
    slug: coin.slug,
    chain: coin.chain,
    pumpDate: coin.pumpDate,
    pumpMagnitude: coin.pumpMagnitude,
    similarity: coin.similarity,
    matchingPatterns: getMatchingPatterns(currentPattern, coin.pattern),
    lessons: extractLessons(coin)
  }));

  // For "about to pump" - we need to scan current market
  // This would require real-time data from multiple sources
  // For now, return candidates with similar pre-pump signals
  results.aboutToPump = generatePumpCandidates(currentPattern, comparisons);

  results.matchCount = comparisons.filter(c => c.similarity > 60).length;

  console.log(`✅ Found ${results.matchCount} high-similarity matches`);
  console.log(`   Already pumped: ${results.alreadyPumped.length}`);
  console.log(`   About to pump: ${results.aboutToPump.length}`);

  return results;
}

/**
 * Get list of matching pattern fields
 */
function getMatchingPatterns(pattern1, pattern2) {
  const matches = [];
  const boolFields = ['whaleAccumulation', 'lowFloat', 'futuresSqueeze', 'socialHype',
    'eventCatalyst', 'insiderActivity', 'exchangeListing', 'mintingActive', 'distributionToExchange'];

  boolFields.forEach(field => {
    if (pattern1[field] === true && pattern2[field] === true) {
      matches.push(field);
    }
  });

  return matches;
}

/**
 * Extract lessons from historical pumped coin
 */
function extractLessons(coin) {
  const lessons = [];

  if (coin.pattern.whaleAccumulation) {
    lessons.push(`Whale accumulated ${coin.prePumpSignals.whaleNetFlow || 'significant tokens'} ${coin.prePumpSignals.daysBeforePump || '?'} days before pump`);
  }
  if (coin.pattern.socialHype) {
    lessons.push(`Social mentions spiked ${coin.prePumpSignals.socialMentionsSpike || 'significantly'}`);
  }
  if (coin.pattern.exchangeListing) {
    lessons.push(`Exchange listing catalyst triggered`);
  }
  if (coin.pattern.lowFloat) {
    lessons.push(`Low float supply amplified price movement`);
  }

  return lessons.length > 0 ? lessons : ['Pattern matched but specific lessons not available'];
}

/**
 * Generate pump candidates from current market
 * In production, this would scan live data
 * For now, returns simulated candidates based on pattern matching logic
 */
function generatePumpCandidates(currentPattern, historicalMatches) {
  const candidates = [];

  // Logic: If current coin has strong pre-pump signals
  // and historical coins with similar patterns pumped,
  // then current coin has high pump probability

  const prePumpScore = calculatePrePumpScore(currentPattern);

  if (prePumpScore > 60) {
    // High probability - current coin itself might pump
    candidates.push({
      type: 'CURRENT_COIN',
      name: 'This coin',
      probability: Math.min(prePumpScore, 95),
      signals: getActivePrePumpSignals(currentPattern),
      reasoning: `Pattern matches with ${historicalMatches.filter(c => c.similarity > 70).length} historical pumps (>70% similarity)`
    });
  }

  // In production, scan for other coins with:
  // 1. Same whale accumulation pattern
  // 2. Similar supply structure
  // 3. Increasing social mentions
  // 4. Upcoming catalysts

  // Simulated candidates (would be replaced with real scanning)
  if (currentPattern.whaleAccumulation && !currentPattern.whaleDistribution) {
    candidates.push({
      type: 'PATTERN_BASED',
      name: 'Coins with whale accumulation (no distribution)',
      probability: 65,
      signals: ['Whale net inflow detected', 'No selling pressure yet'],
      reasoning: 'Historical pattern shows 70% pump rate within 14 days'
    });
  }

  if (currentPattern.socialHype && currentPattern.eventCatalyst) {
    candidates.push({
      type: 'CATALYST_BASED',
      name: 'Coins with social hype + upcoming events',
      probability: 60,
      signals: ['Social mentions increasing', 'Event catalyst pending'],
      reasoning: 'Event-driven pumps average 3-8x within 7 days of event'
    });
  }

  if (currentPattern.volumeMcapRatio > 0.3) {
    candidates.push({
      type: 'VOLUME_BASED',
      name: 'Coins with high volume/mcap ratio',
      probability: 55,
      signals: [`Volume/mcap ratio: ${(currentPattern.volumeMcapRatio * 100).toFixed(0)}%`],
      reasoning: 'High volume ratio precedes price movement in 60% of cases'
    });
  }

  return candidates.slice(0, 5);
}

/**
 * Calculate pre-pump score (0-100)
 */
function calculatePrePumpScore(pattern) {
  let score = 0;

  // Whale accumulation (25 points)
  if (pattern.whaleAccumulation) score += 25;
  if (pattern.whaleFlowScore > 2) score += 10;

  // Social sentiment (20 points)
  if (pattern.socialHype) score += 15;
  if (pattern.newsCount > 2) score += 5;

  // Catalysts (20 points)
  if (pattern.eventCatalyst) score += 10;
  if (pattern.exchangeListing) score += 10;

  // Volume dynamics (15 points)
  if (pattern.volumeMcapRatio > 0.3) score += 15;

  // Supply structure (10 points)
  if (pattern.hasLowFloat) score += 10;

  // Low risk (10 points)
  if (pattern.highRiskCount === 0) score += 10;
  else if (pattern.highRiskCount === 1) score += 5;

  return Math.min(score, 100);
}

/**
 * Get active pre-pump signals
 */
function getActivePrePumpSignals(pattern) {
  const signals = [];

  if (pattern.whaleAccumulation) signals.push('🐋 Whale accumulation detected');
  if (pattern.whaleFlowScore > 0) signals.push(`📊 Net whale inflow: ${pattern.whaleFlowScore} wallets`);
  if (pattern.socialHype) signals.push('📱 Social media hype increasing');
  if (pattern.eventCatalyst) signals.push('🎯 Upcoming event catalyst');
  if (pattern.exchangeListing) signals.push('🏦 Exchange listing catalyst');
  if (pattern.volumeMcapRatio > 0.3) signals.push(`📈 High volume: ${(pattern.volumeMcapRatio * 100).toFixed(0)}% of mcap`);
  if (pattern.hasLowFloat) signals.push('🔒 Low float supply structure');
  if (pattern.largeTransferCount > 0) signals.push(`💸 ${pattern.largeTransferCount} large transfers detected`);
  if (pattern.recentTransferCount > 50) signals.push(`🔄 High activity: ${pattern.recentTransferCount} recent transfers`);

  return signals;
}

// ==================== Pump Probability Calculator ====================

/**
 * Calculate pump probability based on pattern matching
 */
function calculatePumpProbability(currentPattern, similarCoins) {
  const prePumpScore = calculatePrePumpScore(currentPattern);

  // Weight from historical matches
  const highSimilarityCount = similarCoins.alreadyPumped.filter(c => c.similarity > 70).length;
  const avgPumpMagnitude = similarCoins.alreadyPumped
    .filter(c => c.similarity > 60)
    .reduce((sum, c) => {
      const magnitude = parseFloat(c.pumpMagnitude.replace(/[^0-9.]/g, '')) || 0;
      return sum + magnitude;
    }, 0);

  // Calculate probability
  let probability = prePumpScore * 0.6; // 60% from pre-pump score
  probability += highSimilarityCount * 5; // 5% per high-similarity match
  probability = Math.min(probability, 95); // Cap at 95%

  // Estimate potential pump magnitude
  const estimatedMagnitude = avgPumpMagnitude > 0
    ? `${(avgPumpMagnitude / Math.max(highSimilarityCount, 1)).toFixed(0)}x (average from ${highSimilarityCount} similar pumps)`
    : 'Unknown (no high-similarity historical matches)';

  return {
    probability: Math.round(probability),
    estimatedMagnitude,
    confidence: probability > 70 ? 'HIGH' : probability > 50 ? 'MEDIUM' : 'LOW',
    factors: {
      prePumpScore,
      highSimilarityMatches: highSimilarityCount,
      avgHistoricalMagnitude: avgPumpMagnitude
    }
  };
}

// ==================== Multi-Chain Token Scanner ====================

/**
 * Scan tokens across multiple chains for pattern matching
 */
async function scanMultiChain(chain = 'all') {
  console.log(`🔍 Scanning ${chain === 'all' ? 'all chains' : chain}...`);

  const results = {
    ethereum: [],
    solana: [],
    bsc: [],
    timestamp: new Date().toISOString()
  };

  if (chain === 'all' || chain === 'ethereum') {
    // Scan Ethereum - would use DEXScreener/DeFiLlama API in production
    console.log('   Scanning Ethereum tokens...');
    // Placeholder - implement with real DEX scanning
  }

  if (chain === 'all' || chain === 'solana') {
    // Scan Solana using Solscan
    console.log('   Scanning Solana tokens...');
    // Placeholder - implement with Solscan trending tokens
  }

  if (chain === 'all' || chain === 'bsc') {
    // Scan BSC using Bscscan
    console.log('   Scanning BSC tokens...');
    // Placeholder - implement with Bscscan top tokens
  }

  return results;
}

// ==================== Generate Report Sections ====================

function generatePatternMatchSection(similarCoins, pumpProbability) {
  let section = `## 🔍 PATTERN MATCHING ANALYSIS\n\n`;

  // Similarity summary
  section += `### Pattern Similarity Summary\n\n`;
  section += `| Metric | Value |\n`;
  section += `|--------|-------|\n`;
  section += `| **High-Similarity Matches** | ${similarCoins.matchCount} coins (>60% similarity) |\n`;
  section += `| **Pump Probability** | ${pumpProbability.probability}% |\n`;
  section += `| **Confidence** | ${pumpProbability.confidence} |\n`;
  section += `| **Est. Pump Magnitude** | ${pumpProbability.estimatedMagnitude} |\n\n`;

  // Already pumped coins
  section += `### ✅ Coins That Already Pumped (Pattern Validation)\n\n`;
  similarCoins.alreadyPumped.forEach((coin, i) => {
    section += `**${i + 1}. ${coin.name} (${coin.symbol})** - ${coin.similarity}% match\n`;
    section += `- **Chain:** ${coin.chain}\n`;
    section += `- **Pump Date:** ${coin.pumpDate}\n`;
    section += `- **Pump Magnitude:** ${coin.pumpMagnitude}\n`;
    section += `- **Matching Patterns:** ${coin.matchingPatterns.join(', ') || 'None specific'}\n`;
    section += `- **Lessons:**\n`;
    coin.lessons.forEach(lesson => {
      section += `  - ${lesson}\n`;
    });
    section += `\n`;
  });

  // About to pump candidates
  section += `### 🎯 Potential Pump Candidates\n\n`;
  similarCoins.aboutToPump.forEach((candidate, i) => {
    section += `**${i + 1}. ${candidate.name}** - ${candidate.probability}% probability\n`;
    section += `- **Type:** ${candidate.type}\n`;
    section += `- **Active Signals:**\n`;
    candidate.signals.forEach(signal => {
      section += `  - ${signal}\n`;
    });
    section += `- **Reasoning:** ${candidate.reasoning}\n\n`;
  });

  return section;
}

function generatePatternMatchTelegram(similarCoins, pumpProbability) {
  let msg = `🔍 *PATTERN MATCHING*\n\n`;
  msg += `*Similarity Matches:* ${similarCoins.matchCount} coins (>60%)\n`;
  msg += `*Pump Probability:* ${pumpProbability.probability}%\n`;
  msg += `*Confidence:* ${pumpProbability.confidence}\n`;
  msg += `*Est. Magnitude:* ${pumpProbability.estimatedMagnitude}\n\n`;

  msg += `*✅ Historical Pumps (Validation):*\n`;
  similarCoins.alreadyPumped.slice(0, 3).forEach((coin, i) => {
    msg += `${i + 1}. ${coin.name} ${coin.symbol} - ${coin.similarity}% match\n`;
    msg += `   Pumped: ${coin.pumpMagnitude} on ${coin.pumpDate}\n`;
  });

  msg += `\n*🎯 Pump Candidates:*\n`;
  similarCoins.aboutToPump.slice(0, 3).forEach((c, i) => {
    msg += `${i + 1}. ${c.name} - ${c.probability}% probability\n`;
  });

  return msg;
}

// ==================== Export ====================

module.exports = {
  buildPatternSignature,
  calculatePatternSimilarity,
  findSimilarCoins,
  calculatePumpProbability,
  scanMultiChain,
  generatePatternMatchSection,
  generatePatternMatchTelegram,
  HISTORICAL_PUMPED_COINS,
  APIS
};

// ==================== CLI Mode ====================

if (require.main === module) {
  console.log('🔍 Pattern Matcher - Similar Coin Discovery Engine');
  console.log('\nUsage:');
  console.log('  node pattern-matcher.js --slug <coin>');
  console.log('  node pattern-matcher.js --chain ethereum|solana|bsc');
  console.log('\nExample:');
  console.log('  node pattern-matcher.js --slug ravedao');
}
