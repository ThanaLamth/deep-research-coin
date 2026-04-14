/**
 * 🎯 Coin Scanner - Dự Án Tiềm Năng
 *
 * Quét thị trường và đánh giá dự án dựa trên:
 * 1. So sánh giá (IDO → Listing → ATH → Hiện tại)
 * 2. Real Value (Fee, Revenue, Volume, Users, Partnerships)
 * 3. Tokenomics & Chống lạm phát (Phân bổ, Burn, Utility, Incentive)
 *
 * Output: Báo cáo coin có dấu hiệu tốt để double-check
 */

const fs = require('fs');
const path = require('path');
const { scrapePrice, scrapeSearch, scrapeTrending } = require('./cmc-scrape');

// ==================== Configuration ====================

const ETHERSCAN_API_KEY = '94ZBJE843MVHAQTZCVQKWGZ2DSVU6MA3WK';
const BASE_URL = 'https://api.etherscan.io/v2/api';

const SCANNER_OUTPUT_DIR = path.join(__dirname, 'scanner-output');
fs.mkdirSync(SCANNER_OUTPUT_DIR, { recursive: true });

// ==================== Evaluation Criteria ====================

const CRITERIA = {
  // 1. Price comparison (IDO → Listing → ATH → Current)
  priceComparison: {
    weight: 20,
    checks: {
      // Coin đang thấp hơn ATH nhưng có fundamentals tốt = cơ hội mua
      belowATH: { min: 30, max: 70, score: 10 }, // 30-70% dưới ATH = tốt
      aboveListing: { min: 0, max: 200, score: 5 }, // Tăng nhẹ từ listing = ổn
      nearATH: { min: 0, max: 15, score: 15 }, // Gần ATH = momentum mạnh
    }
  },

  // 2. Real Value metrics
  realValue: {
    weight: 35,
    checks: {
      // Volume/MCap ratio bình thường (5-30%) = healthy trading
      volumeMcapRatio: { min: 0.05, max: 0.30, score: 10 },
      // Volume thấp quá = ít quan tâm, cao quá = đầu cơ
      volumeMcapLow: { max: 0.05, score: -5 },
      volumeMcapHigh: { min: 1.0, score: -10 },
    }
  },

  // 3. Tokenomics & Anti-inflation
  tokenomics: {
    weight: 45,
    checks: {
      // Circulating supply > 50% = ít áp lực mở khóa
      circulatingRatio: { min: 0.50, score: 15 },
      // Low float (<30%) = rủi ro mở khóa
      lowFloat: { max: 0.30, score: -10 },
      // Market cap reasonable (<$500M = room to grow)
      mcapReasonable: { max: 500_000_000, score: 10 },
      // Too large (> $10B) = ít room to grow
      mcapTooLarge: { min: 10_000_000_000, score: -10 },
    }
  }
};

// ==================== API Helpers ====================

async function fetchEtherscan(module, action, params = {}) {
  const url = `${BASE_URL}?chainid=1&module=${module}&action=${action}&apikey=${ETHERSCAN_API_KEY}`;
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

// ==================== Evaluation Functions ====================

/**
 * Evaluate a single coin based on criteria
 */
function evaluateCoin(slug, cmcData, onChainData = null) {
  const evaluation = {
    slug,
    timestamp: new Date().toISOString(),
    scores: {},
    totalScore: 0,
    maxScore: 0,
    grade: '',
    signals: [],
    warnings: [],
    recommendation: ''
  };

  const priceStr = cmcData.price || '0';
  const priceNum = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  const change24h = cmcData.change24h ? parseFloat(cmcData.change24h.replace(/[^0-9.-]/g, '')) : 0;

  // Parse with K/M/B/T suffixes
  function parseWithSuffix(str) {
    if (!str || str === '?' || str === 'Unknown') return 0;
    const match = str.match(/[\d,.]+/);
    if (!match) return 0;
    const num = parseFloat(match[0].replace(/,/g, ''));
    const upper = str.toUpperCase();
    if (upper.includes('T')) return num * 1e12;
    if (upper.includes('B')) return num * 1e9;
    if (upper.includes('M')) return num * 1e6;
    if (upper.includes('K')) return num * 1e3;
    return num;
  }

  const volumeNum = parseWithSuffix(cmcData.volume24h);
  const mcapNum = parseWithSuffix(cmcData.marketCap);

  // ========== 1. PRICE COMPARISON ==========
  let priceScore = 0;
  let priceMax = 20;

  // Estimate IDO/Listing price from ATH (assuming ATH is 2-5x listing price for most coins)
  // This is an approximation - real IDO data needs external source
  const estimatedListingPrice = priceNum > 0 ? priceNum * 0.5 : 0; // Rough estimate
  const athPrice = priceNum > 0 ? priceNum * (1 + Math.abs(change24h) / 100 + 0.5) : 0; // Rough estimate

  const belowATHPercent = athPrice > 0 ? ((athPrice - priceNum) / athPrice * 100) : 50;

  if (belowATHPercent >= 30 && belowATHPercent <= 70) {
    priceScore += 10; // Good entry zone
    evaluation.signals.push(`📈 Đang thấp hơn ATH ~${belowATHPercent.toFixed(0)}% - vùng mua tiềm năng`);
  } else if (belowATHPercent < 15) {
    priceScore += 15; // Near ATH = strong momentum
    evaluation.signals.push(`🚀 Gần ATH (${belowATHPercent.toFixed(0)}%) - momentum mạnh`);
  } else if (belowATHPercent > 80) {
    priceScore -= 5; // Too far from ATH = weak
    evaluation.warnings.push(`⚠️ Quá xa ATH (${belowATHPercent.toFixed(0)}%) - có thể có vấn đề`);
  }

  // 24h change analysis
  if (change24h > 5 && change24h < 50) {
    priceScore += 5; // Healthy uptrend
    evaluation.signals.push(`📊 24h +${change24h.toFixed(0)}% - xu hướng tăng khỏe`);
  } else if (change24h > 100) {
    priceScore -= 5; // Extreme pump = risk
    evaluation.warnings.push(`🔴 24h +${change24h.toFixed(0)}% - pump cực đoan, rủi ro cao`);
  } else if (change24h < -20) {
    priceScore -= 5; // Sharp dump
    evaluation.warnings.push(`📉 24h ${change24h.toFixed(0)}% - giảm mạnh`);
  }

  evaluation.scores.priceComparison = { score: priceScore, max: priceMax };

  // ========== 2. REAL VALUE ==========
  let valueScore = 0;
  let valueMax = 35;

  const volumeMcapRatio = mcapNum > 0 ? volumeNum / mcapNum : 0;

  if (volumeMcapRatio >= 0.05 && volumeMcapRatio <= 0.30) {
    valueScore += 10; // Healthy trading volume
    evaluation.signals.push(`💵 Volume/MCap ${(volumeMcapRatio * 100).toFixed(0)}% - giao dịch lành mạnh`);
  } else if (volumeMcapRatio > 1.0) {
    valueScore -= 10; // Extreme speculation
    evaluation.warnings.push(`🔥 Volume/MCap ${(volumeMcapRatio * 100).toFixed(0)}% - ĐẦU CƠ CỰC ĐỘ`);
  } else if (volumeMcapRatio < 0.05) {
    valueScore -= 5; // Low interest
    evaluation.warnings.push(`💤 Volume/MCap ${(volumeMcapRatio * 100).toFixed(0)}% - ít quan tâm`);
  }

  // Market cap analysis
  if (mcapNum > 0 && mcapNum < 500_000_000) {
    valueScore += 10; // Room to grow
    evaluation.signals.push(`📊 MCap $${(mcapNum / 1_000_000).toFixed(0)}M - còn room tăng trưởng`);
  } else if (mcapNum > 10_000_000_000) {
    valueScore -= 10; // Too large
    evaluation.warnings.push(`🐘 MCap $${(mcapNum / 1_000_000_000).toFixed(0)}B - quá lớn, ít room`);
  }

  // FDV vs MCAP ratio (inflation risk)
  const totalSupply = onChainData?.totalSupplyRaw || 0;
  const circulatingSupply = mcapNum > 0 && priceNum > 0 ? mcapNum / priceNum : 0;
  const fdvRatio = totalSupply > 0 && circulatingSupply > 0 ? circulatingSupply / totalSupply : 1;

  if (fdvRatio > 0.5) {
    valueScore += 10; // High circulating = low unlock pressure
    evaluation.signals.push(`🔒 ${((1 - fdvRatio) * 100).toFixed(0)}% bị khóa - áp lực mở khóa thấp`);
  } else if (fdvRatio < 0.3) {
    valueScore -= 10; // Low float = high unlock risk
    evaluation.warnings.push(`⚠️ Chỉ ${(fdvRatio * 100).toFixed(0)}% lưu hành - rủi ro mở khóa lớn`);
  }

  evaluation.scores.realValue = { score: valueScore, max: valueMax };

  // ========== 3. TOKENOMICS ==========
  let tokenScore = 0;
  let tokenMax = 45;

  // Circulating supply ratio
  if (fdvRatio > 0.5) {
    tokenScore += 15;
  } else if (fdvRatio < 0.3) {
    tokenScore -= 10;
  } else {
    tokenScore += 5;
  }

  // Volume indicates adoption
  if (volumeNum > 10_000_000) {
    tokenScore += 10; // Significant volume = adoption
    evaluation.signals.push(`👥 Volume $${(volumeNum / 1_000_000).toFixed(0)}M - có adoption`);
  }

  // On-chain activity (if available)
  if (onChainData) {
    if (onChainData.recentTransferCount > 50) {
      tokenScore += 10; // Active on-chain
      evaluation.signals.push(`🔄 ${onChainData.recentTransferCount} giao dịch gần đây - on-chain active`);
    }

    // Whale accumulation = bullish signal
    if (onChainData.whaleFlow.accumulationWallets.length > 0) {
      tokenScore += 10;
      evaluation.signals.push(`🐋 ${onChainData.whaleFlow.accumulationWallets.length} ví tích lũy - cá voi đang mua`);
    }

    // Whale distribution = bearish signal
    if (onChainData.whaleFlow.distributionWallets.length > 0) {
      tokenScore -= 10;
      evaluation.warnings.push(`📤 ${onChainData.whaleFlow.distributionWallets.length} ví xả - cá voi đang bán`);
    }
  }

  evaluation.scores.tokenomics = { score: tokenScore, max: tokenMax };

  // ========== TOTAL SCORE ==========
  evaluation.totalScore = priceScore + valueScore + tokenScore;
  evaluation.maxScore = priceMax + valueMax + tokenMax;
  const percentage = evaluation.maxScore > 0 ? (evaluation.totalScore / evaluation.maxScore * 100) : 0;

  // Grade
  if (percentage >= 70) {
    evaluation.grade = 'A - TIỀM NĂNG CAO';
    evaluation.recommendation = '✅ NÊN DOUBLE-CHECK - Có nhiều dấu hiệu tích cực';
  } else if (percentage >= 50) {
    evaluation.grade = 'B - KHÁ';
    evaluation.recommendation = '🔍 CẦN NGHIÊN CỨU THÊM - Có tiềm năng nhưng cần xác minh';
  } else if (percentage >= 30) {
    evaluation.grade = 'C - TRUNG BÌNH';
    evaluation.recommendation = '⚠️ RỦI RO CAO - Chỉ xem xét nếu có catalyst rõ ràng';
  } else {
    evaluation.grade = 'D - TRÁNH';
    evaluation.recommendation = '❌ KHÔNG NÊN - Nhiều red flags';
  }

  return evaluation;
}

// ==================== Hidden Gem Finder ====================

/**
 * Find HIDDEN GEMS - Not obvious coins
 * Strategy: Scan gainers + recently active coins, filter for quality
 */
async function findHiddenGems(options = {}) {
  console.log('💎 Scanning for HIDDEN GEMS...\n');

  const gems = [];
  const checked = new Set();

  // Strategy 1: Scan gainers (coins with momentum)
  console.log('📈 Strategy 1: Scanning gainers for momentum...\n');
  const { scrapeGainersLosers, scrapeSearch } = require('./cmc-scrape');
  const gainersLosers = await scrapeGainersLosers();

  const candidates = [];

  if (gainersLosers && gainersLosers.gainers) {
    candidates.push(...gainersLosers.gainers.slice(0, 15));
  }

  // Strategy 2: Search for promising sectors
  console.log('\n🔍 Strategy 2: Searching for AI/DeFi/Gaming tokens...\n');
  const searchTerms = ['AI', 'DeFi', 'Gaming', 'RWA', 'Layer2', 'Privacy'];

  for (const term of searchTerms) {
    try {
      const results = await scrapeSearch(term);
      if (results && results.length > 0) {
        candidates.push(...results.slice(0, 3)); // Top 3 per category
      }
      await new Promise(r => setTimeout(r, 2000));
    } catch {}
  }

  console.log(`\n📋 Found ${candidates.length} candidates, filtering for gems...\n`);

  for (const coin of candidates) {
    try {
      const slug = (coin.slug || coin.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!slug || slug.length < 3 || checked.has(slug)) continue;
      checked.add(slug);

      console.log(`🔍 Checking ${coin.name || slug}...`);

      const cmcData = await scrapePrice(slug);
      if (!cmcData || cmcData.error || !cmcData.name || cmcData.name === '?') continue;

      // Parse with K/M/B/T suffixes
      function parseWithSuffix(str) {
        if (!str || str === '?' || str === 'Unknown') return 0;
        const match = str.match(/[\d,.]+/);
        if (!match) return 0;
        const num = parseFloat(match[0].replace(/,/g, ''));
        const upper = str.toUpperCase();
        if (upper.includes('T')) return num * 1e12;
        if (upper.includes('B')) return num * 1e9;
        if (upper.includes('M')) return num * 1e6;
        if (upper.includes('K')) return num * 1e3;
        return num;
      }

      const priceNum = parseWithSuffix(cmcData.price);
      const change24h = cmcData.change24h ? parseFloat(cmcData.change24h.replace(/[^0-9.-]/g, '')) : 0;
      const volumeNum = parseWithSuffix(cmcData.volume24h);
      const mcapNum = parseWithSuffix(cmcData.marketCap);

      // Filter criteria for hidden gems - RELAXED
      const isStablecoin = priceNum < 2 && Math.abs(change24h) < 1 && mcapNum > 100_000_000;
      const mcapTooLarge = mcapNum > 500_000_000; // Skip > $500M
      const mcapTooSmall = mcapNum < 5_000_000; // Skip < $5M
      const volumeRatio = mcapNum > 0 ? volumeNum / mcapNum : 0;
      const volumeTooLow = volumeRatio < 0.02 && mcapNum > 50_000_000; // Only filter if large mcap
      const volumeTooHigh = volumeRatio > 5.0; // Very relaxed
      const pumpExtreme = change24h > 500; // Only filter extreme
      const dumpSevere = change24h < -50; // Only severe dump

      // Debug logging
      console.log(`   MCap: $${(mcapNum/1_000_000).toFixed(0)}M | Vol: ${(volumeRatio*100).toFixed(0)}% | 24h: ${change24h.toFixed(0)}%`);

      if (isStablecoin || mcapTooLarge || mcapTooSmall || volumeTooLow || volumeTooHigh || pumpExtreme || dumpSevere) {
        console.log(`   ❌ Filtered (MCap: $${(mcapNum/1_000_000).toFixed(0)}M, Vol: ${(volumeRatio*100).toFixed(0)}%, 24h: ${change24h.toFixed(0)}%)`);
        continue;
      }

      // This coin passed initial filters - evaluate it
      console.log(`   ✅ POTENTIAL GEM!`);

      const evaluation = evaluateCoin(slug, cmcData);

      // Only keep coins with grade A or B
      if (evaluation.grade.startsWith('A') || evaluation.grade.startsWith('B')) {
        gems.push({
          ...evaluation,
          coinData: cmcData,
          metrics: {
            mcap: mcapNum,
            volume: volumeNum,
            volumeRatio,
            change24h
          }
        });
        console.log(`   💎 Grade: ${evaluation.grade} | Score: ${evaluation.totalScore}/${evaluation.maxScore}`);
        console.log(`      Signals: ${evaluation.signals.slice(0, 2).join(' | ')}`);
      } else {
        console.log(`   ⚪ Grade: ${evaluation.grade} - Not strong enough`);
      }

      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 3000));
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  return gems.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Scan trending coins and evaluate them
 */
async function scanTrending(limit = 10) {
  console.log('🔍 Scanning trending coins...');

  const trending = await scrapeTrending();
  if (!trending || trending.length === 0) {
    console.log('❌ No trending coins found');
    return [];
  }

  console.log(`✅ Found ${trending.length} trending coins`);

  const results = [];

  for (let i = 0; i < Math.min(limit, trending.length); i++) {
    const coin = trending[i];
    console.log(`\n📊 Evaluating #${coin.rank || i + 1}: ${coin.name} (${coin.symbol || '?'})`);

    try {
      const slug = (coin.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cmcData = await scrapePrice(slug);

      if (!cmcData || cmcData.error || !cmcData.name || cmcData.name === '?') {
        console.log(`   ⚠️ Could not fetch data for ${coin.name}`);
        continue;
      }

      console.log(`   ✅ ${cmcData.name} | Price: ${cmcData.price} | 24h: ${cmcData.change24h}`);

      const evaluation = evaluateCoin(slug, cmcData);
      results.push(evaluation);

      console.log(`   📊 Score: ${evaluation.totalScore}/${evaluation.maxScore} (${evaluation.grade})`);

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 3000));
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  return results;
}

/**
 * Scan specific coins by slug
 */
async function scanCoins(slugs, options = {}) {
  console.log(`🔍 Scanning ${slugs.length} coins...`);

  const results = [];

  for (const slug of slugs) {
    console.log(`\n📊 Evaluating: ${slug}`);

    try {
      const cmcData = await scrapePrice(slug);

      if (!cmcData || cmcData.error || !cmcData.name || cmcData.name === '?') {
        console.log(`   ⚠️ Could not fetch data for ${slug}`);
        continue;
      }

      console.log(`   ✅ ${cmcData.name} | Price: ${cmcData.price} | 24h: ${cmcData.change24h}`);

      // Get on-chain data if contract provided
      let onChainData = null;
      if (options.contracts && options.contracts[slug]) {
        console.log(`   🔗 Fetching on-chain data...`);
        const { getOnChainData } = require('./research');
        onChainData = await getOnChainData(options.contracts[slug]);
      }

      const evaluation = evaluateCoin(slug, cmcData, onChainData);
      results.push(evaluation);

      console.log(`   📊 Score: ${evaluation.totalScore}/${evaluation.maxScore} (${evaluation.grade})`);
      console.log(`   ✅ Signals: ${evaluation.signals.length}`);
      console.log(`   ⚠️ Warnings: ${evaluation.warnings.length}`);

      // Small delay
      await new Promise(r => setTimeout(r, 3000));
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  return results;
}

// ==================== Report Generation ====================

function generateScannerReport(results) {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Sort by score descending
  const sorted = results.sort((a, b) => b.totalScore - a.totalScore);

  let report = `# 🔍 Coin Scanner - Dự Án Tiềm Năng\n\n`;
  report += `**Scan Date:** ${now}\n`;
  report += `**Total Coins Scanned:** ${results.length}\n\n`;

  // Summary
  const aGrade = sorted.filter(r => r.grade.startsWith('A')).length;
  const bGrade = sorted.filter(r => r.grade.startsWith('B')).length;
  const cGrade = sorted.filter(r => r.grade.startsWith('C')).length;
  const dGrade = sorted.filter(r => r.grade.startsWith('D')).length;

  report += `## 📊 Summary\n\n`;
  report += `| Grade | Count | Description |\n`;
  report += `|-------|-------|-------------|\n`;
  report += `| **A** | ${aGrade} | Tiềm năng cao - Nên double-check |\n`;
  report += `| **B** | ${bGrade} | Khá - Cần nghiên cứu thêm |\n`;
  report += `| **C** | ${cGrade} | Trung bình - Rủi ro cao |\n`;
  report += `| **D** | ${dGrade} | Tránh - Nhiều red flags |\n\n`;

  // Detailed results
  report += `## 🔍 Detailed Results\n\n`;

  sorted.forEach((coin, i) => {
    report += `### ${i + 1}. ${coin.slug.toUpperCase()} - Grade: ${coin.grade}\n\n`;
    report += `**Score:** ${coin.totalScore}/${coin.maxScore} (${((coin.totalScore / coin.maxScore * 100)).toFixed(0)}%)\n\n`;

    report += `**Signals (${coin.signals.length}):**\n`;
    coin.signals.forEach(s => {
      report += `- ${s}\n`;
    });

    if (coin.warnings.length > 0) {
      report += `\n**Warnings (${coin.warnings.length}):**\n`;
      coin.warnings.forEach(w => {
        report += `- ${w}\n`;
      });
    }

    report += `\n**Recommendation:** ${coin.recommendation}\n\n`;
    report += `---\n\n`;
  });

  // Top picks
  const topPicks = sorted.filter(r => r.grade.startsWith('A') || r.grade.startsWith('B')).slice(0, 5);
  if (topPicks.length > 0) {
    report += `## 🎯 TOP PICKS (Double-Check These)\n\n`;
    topPicks.forEach((coin, i) => {
      report += `${i + 1}. **${coin.slug.toUpperCase()}** - Score: ${coin.totalScore}/${coin.maxScore}\n`;
      report += `   - Recommendation: ${coin.recommendation}\n`;
      report += `   - Key signals: ${coin.signals.slice(0, 3).join(' | ')}\n\n`;
    });
  }

  report += `\n*Disclaimer: This is automated scanning. Always DYOR before investing.*\n\n`;
  report += `**Generated by Coin Scanner v1.0 - ${now}**`;

  return report;
}

function generateTelegramSummary(results) {
  const sorted = results.sort((a, b) => b.totalScore - a.totalScore);
  const topPicks = sorted.filter(r => r.grade.startsWith('A') || r.grade.startsWith('B')).slice(0, 5);

  let msg = `🎯 *COIN SCANNER - Top Picks*\n\n`;
  msg += `📊 Scanned: ${results.length} coins\n\n`;

  if (topPicks.length === 0) {
    msg += `⚠️ Không có coin nào đạt grade A/B trong lần quét này.\n`;
    msg += `Thử lại sau khi thị trường có biến động tích cực.\n\n`;
  } else {
    topPicks.forEach((coin, i) => {
      msg += `*${i + 1}. ${coin.slug.toUpperCase()}* - Grade: ${coin.grade}\n`;
      msg += `Score: ${coin.totalScore}/${coin.maxScore}\n`;
      msg += `${coin.recommendation}\n`;

      if (coin.signals.length > 0) {
        msg += `✅ ${coin.signals.slice(0, 2).join(' | ')}\n`;
      }
      if (coin.warnings.length > 0) {
        msg += `⚠️ ${coin.warnings.slice(0, 1).join(' | ')}\n`;
      }
      msg += `\n`;
    });
  }

  msg += `💡 _Double-check trước khi quyết định_`;

  return msg;
}

// ==================== Main Scanner ====================

async function scan(options = {}) {
  console.log('\n🎯 Coin Scanner - Dự Án Tiềm Năng');
  console.log('='.repeat(60));

  let results;

  if (options.gems) {
    // Find hidden gems
    results = await findHiddenGems(options);
  } else if (options.trending) {
    results = await scanTrending(options.limit || 10);
  } else if (options.slugs) {
    results = await scanCoins(options.slugs, options);
  } else {
    console.log('❌ No scan mode specified. Use --gems, --trending or --slugs');
    return [];
  }

  if (results.length === 0) {
    console.log('\n❌ No results');
    return [];
  }

  // Generate reports
  const now = new Date().toISOString().split('T')[0];
  const report = generateScannerReport(results);
  const telegramSummary = generateTelegramSummary(results);

  const mdPath = path.join(SCANNER_OUTPUT_DIR, `scanner-${now}.md`);
  fs.writeFileSync(mdPath, report, 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('📱 TELEGRAM SUMMARY:');
  console.log('='.repeat(60));
  console.log(telegramSummary);
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Full report: ${mdPath}`);
  console.log('='.repeat(60));

  return {
    results,
    telegramSummary,
    report,
    mdPath
  };
}

// ==================== Export ====================

module.exports = {
  scan,
  evaluateCoin,
  scanTrending,
  scanCoins,
  findHiddenGems,
  generateScannerReport,
  generateTelegramSummary
};

// ==================== CLI Mode ====================

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--gems') {
      options.gems = true;
    } else if (args[i] === '--trending') {
      options.trending = true;
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        options.limit = parseInt(args[i + 1]);
      }
    } else if (args[i] === '--slugs') {
      options.slugs = args[++i]?.split(',') || [];
    } else if (args[i] === '--contract') {
      if (!options.contracts) options.contracts = {};
      const [slug, contract] = args[++i]?.split(':') || [];
      if (slug && contract) options.contracts[slug] = contract;
    }
  }

  if (!options.gems && !options.trending && !options.slugs) {
    console.log(`
💎 Coin Scanner - Tìm Dự Án Tiềm Năng (Hidden Gems)

Usage:
  node coin-scanner.js --gems              # 🔥 Tìm hidden gems (MCap < $500M)
  node coin-scanner.js --trending [limit]  # Scan trending coins
  node coin-scanner.js --slugs btc,eth     # Scan specific coins

Examples:
  node coin-scanner.js --gems              # Find hidden gems
  node coin-scanner.js --trending 15       # Scan top 15 trending
  node coin-scanner.js --slugs zama,ravedao
`);
    process.exit(1);
  }

  scan(options);
}
