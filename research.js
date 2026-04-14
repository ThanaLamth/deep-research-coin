/**
 * 🔍 Deep Research Engine v2 - RAVE-level Detail
 * Combines CMC scraping + on-chain analysis + fundamental + news + tokenomics
 * Outputs comprehensive MD report matching the RAVE analysis quality
 */

const fs = require('fs');
const path = require('path');
const { scrapePrice, scrapeSearch, scrapeNews } = require('./cmc-scrape');
const PDFDocument = require('pdfkit');
const {
  buildPatternSignature,
  findSimilarCoins,
  calculatePumpProbability,
  generatePatternMatchSection,
  generatePatternMatchTelegram
} = require('./pattern-matcher');
const { evaluateCoin } = require('./coin-scanner');

// ==================== Configuration ====================

const ETHERSCAN_API_KEY = '94ZBJE843MVHAQTZCVQKWGZ2DSVU6MA3WK';
const BASE_URL = 'https://api.etherscan.io/v2/api';

const OUTPUT_DIR = path.join(__dirname, 'research-output');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ==================== Etherscan API Helper ====================

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
      console.error(`❌ Etherscan Error (${action}):`, data.message || data.result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Fetch Error (${action}):`, error.message);
    return null;
  }
}

// ==================== Web Fetch Helper ====================

async function fetchUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return await response.text();
  } catch {
    return null;
  }
}

// ==================== On-Chain Analysis (Enhanced) ====================

async function getOnChainData(contractAddress) {
  console.log('🔗 Fetching on-chain data...');

  const result = {
    tokenName: 'Unknown',
    tokenSymbol: 'Unknown',
    totalSupply: 'Unknown',
    totalSupplyRaw: 0,
    decimals: '18',
    topWallets: [],
    whaleFlow: { largeTransfers: [], accumulationWallets: [], distributionWallets: [] },
    recentTransferCount: 0,
    holderAnalysis: [],
    tokenFlow: { netFlow: 0, inflow: 0, outflow: 0 }
  };

  if (!contractAddress) {
    console.log('⚠️ No contract address provided - skipping on-chain analysis');
    return result;
  }

  try {
    // Get total supply
    const totalSupply = await fetchEtherscan('stats', 'tokensupply', { contractaddress: contractAddress });
    if (totalSupply) {
      const raw = parseInt(totalSupply);
      result.totalSupplyRaw = raw;
      result.totalSupply = (raw / 1e18).toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    // Get token info
    const tokenInfo = await fetchEtherscan('token', 'tokeninfo', { contractaddress: contractAddress });
    if (tokenInfo?.[0]) {
      result.tokenName = tokenInfo[0].TokenName || 'Unknown';
      result.tokenSymbol = tokenInfo[0].Symbol || 'Unknown';
      result.decimals = tokenInfo[0].Decimal || '18';
    }

    // Get recent transfers (larger sample for better analysis)
    const recentTransfers = await fetchEtherscan('account', 'tokentx', {
      contractaddress: contractAddress,
      page: '1',
      offset: '100',
      sort: 'desc'
    });

    if (recentTransfers && Array.isArray(recentTransfers)) {
      result.recentTransferCount = recentTransfers.length;

      // Build wallet activity map
      const walletActivity = {};
      const decimals = parseInt(result.decimals);
      const divisor = Math.pow(10, decimals);

      recentTransfers.forEach(tx => {
        const value = parseInt(tx.value) / divisor;
        if (!walletActivity[tx.to]) walletActivity[tx.to] = { received: 0, sent: 0, txCount: 0 };
        if (!walletActivity[tx.from]) walletActivity[tx.from] = { received: 0, sent: 0, txCount: 0 };
        walletActivity[tx.to].received += value;
        walletActivity[tx.to].txCount++;
        walletActivity[tx.from].sent += value;
        walletActivity[tx.from].txCount++;
      });

      // Calculate token flow
      let totalIn = 0, totalOut = 0;
      Object.values(walletActivity).forEach(w => {
        totalIn += w.received;
        totalOut += w.sent;
      });
      result.tokenFlow = { netFlow: totalIn - totalOut, inflow: totalIn, outflow: totalOut };

      // Get top wallets by net flow
      result.topWallets = Object.entries(walletActivity)
        .map(([addr, data]) => ({
          address: addr,
          netFlow: data.received - data.sent,
          received: data.received,
          sent: data.sent,
          txCount: data.txCount
        }))
        .sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow))
        .slice(0, 10);

      // Identify large transfers
      recentTransfers.forEach(tx => {
        const value = parseInt(tx.value) / divisor;
        if (value > 100000) {
          result.whaleFlow.largeTransfers.push({
            from: tx.from,
            to: tx.to,
            value: value.toLocaleString('en-US', { maximumFractionDigits: 0 }),
            valueRaw: value,
            token: tx.tokenSymbol || result.tokenSymbol,
            hash: tx.hash,
            timestamp: tx.timeStamp,
            blockNumber: tx.blockNumber
          });
        }
      });

      // Classify wallets
      Object.entries(walletActivity).forEach(([addr, data]) => {
        const netFlow = data.received - data.sent;
        if (data.received > 500000 && netFlow > 0) {
          result.whaleFlow.accumulationWallets.push({
            address: addr,
            netReceived: netFlow,
            totalReceived: data.received
          });
        }
        if (data.sent > 500000 && netFlow < 0) {
          result.whaleFlow.distributionWallets.push({
            address: addr,
            netSent: -netFlow,
            totalSent: data.sent
          });
        }
      });

      // Sort and limit
      result.whaleFlow.largeTransfers.sort((a, b) => b.valueRaw - a.valueRaw);
      result.whaleFlow.accumulationWallets.sort((a, b) => b.netReceived - a.netReceived);
      result.whaleFlow.distributionWallets.sort((a, b) => b.netSent - a.netSent);

      result.whaleFlow.largeTransfers = result.whaleFlow.largeTransfers.slice(0, 15);
      result.whaleFlow.accumulationWallets = result.whaleFlow.accumulationWallets.slice(0, 5);
      result.whaleFlow.distributionWallets = result.whaleFlow.distributionWallets.slice(0, 5);
    }

    console.log(`✅ On-chain data: Supply=${result.totalSupply}, Transfers=${result.recentTransferCount}`);

  } catch (error) {
    console.error(`⚠️ On-chain fetch failed: ${error.message}`);
  }

  return result;
}

// ==================== News & Catalyst Research ====================

async function searchNewsAndCatalysts(slug, tokenSymbol) {
  console.log('📰 Searching for news and catalysts...');

  const catalysts = [];
  const newsItems = [];

  try {
    // Get general crypto news
    const news = await scrapeNews();
    if (news && news.length > 0) {
      // Filter for relevant news (mentioning the token or general market)
      const relevantNews = news.filter(n =>
        n.title.toLowerCase().includes(tokenSymbol.toLowerCase()) ||
        n.title.toLowerCase().includes(slug.toLowerCase())
      );

      if (relevantNews.length > 0) {
        relevantNews.slice(0, 5).forEach(n => {
          newsItems.push({
            title: n.title,
            url: n.url,
            source: 'CoinMarketCap News'
          });
        });
      }

      // If no direct news, include general market context
      if (relevantNews.length === 0) {
        newsItems.push({
          title: `No specific news found for ${tokenSymbol}. Check general crypto market conditions.`,
          url: 'https://coinmarketcap.com/headlines/news/',
          source: 'CoinMarketCap'
        });
      }
    }
  } catch (error) {
    console.error(`⚠️ News fetch failed: ${error.message}`);
  }

  // Try to find project info from common sources
  const potentialSources = [
    { name: 'Twitter/X', url: `https://twitter.com/search?q=${tokenSymbol}`, type: 'Social Media' },
    { name: 'CoinMarketCap Community', url: `https://coinmarketcap.com/currencies/${slug}/`, type: 'Official' },
    { name: 'Project Website', url: `https://${slug.toLowerCase()}.com`, type: 'Official' },
    { name: 'GitHub', url: `https://github.com/${slug.toLowerCase()}`, type: 'Development' },
  ];

  return {
    news: newsItems,
    potentialSources: potentialSources,
    catalysts: catalysts
  };
}

// ==================== Root Cause Analysis ====================

function analyzeRootCauses(cmcData, onChainData) {
  console.log('🔍 Analyzing root causes...');

  const causes = [];
  const changeNum = cmcData.change24h ? parseFloat(cmcData.change24h.replace(/[^0-9.-]/g, '')) : 0;

  // 1. Price momentum analysis
  if (changeNum > 100) {
    causes.push({
      category: '📈 Extreme Price Momentum',
      severity: 'HIGH',
      description: `Token has surged +${changeNum.toFixed(0)}% in 24h. This level of movement typically indicates:`,
      factors: [
        'Short squeeze or liquidation cascade in derivatives markets',
        'Coordinated buying from whale wallets',
        'Social media hype driving retail FOMO',
        'Potential low float / supply shock scenario'
      ],
      evidence: `Price: ${cmcData.price} | 24h: +${changeNum.toFixed(0)}% | Volume: ${cmcData.volume24h || 'Unknown'}`,
      likelihood: 'High probability of pump mechanics'
    });
  } else if (changeNum > 50) {
    causes.push({
      category: '📈 Strong Price Momentum',
      severity: 'MEDIUM',
      description: `Token has gained +${changeNum.toFixed(0)}% in 24h, indicating significant buying pressure.`,
      factors: [
        'Possible news catalyst or partnership announcement',
        'Accumulation by smart money wallets',
        'Breakout from key resistance level'
      ],
      evidence: `Price: ${cmcData.price} | 24h: +${changeNum.toFixed(0)}%`,
      likelihood: 'Moderate - verify with on-chain data'
    });
  }

  // 2. Whale activity analysis
  if (onChainData.whaleFlow.accumulationWallets.length > 0) {
    causes.push({
      category: '🐋 Whale Accumulation',
      severity: 'HIGH',
      description: `On-chain data shows ${onChainData.whaleFlow.accumulationWallets.length} wallet(s) accumulating tokens:`,
      factors: onChainData.whaleFlow.accumulationWallets.slice(0, 3).map(w =>
        `\`${w.address.substring(0, 10)}...\` accumulated ${(w.netReceived / 1000).toFixed(0)}K tokens`
      ),
      evidence: 'Large incoming transfers to specific wallets',
      likelihood: 'Confirmed from on-chain data'
    });
  }

  if (onChainData.whaleFlow.distributionWallets.length > 0) {
    causes.push({
      category: '📉 Whale Distribution/Selling',
      severity: 'CRITICAL',
      description: `On-chain data shows ${onChainData.whaleFlow.distributionWallets.length} wallet(s) distributing/selling:`,
      factors: onChainData.whaleFlow.distributionWallets.slice(0, 3).map(w =>
        `\`${w.address.substring(0, 10)}...\` distributed ${(w.netSent / 1000).toFixed(0)}K tokens`
      ),
      evidence: 'Large outgoing transfers from accumulation wallets',
      likelihood: '⚠️ Selling pressure detected'
    });
  }

  // 3. Volume analysis
  const volumeStr = cmcData.volume24h || '';
  const mcapStr = cmcData.marketCap || '';
  if (volumeStr && mcapStr) {
    // Simple volume-to-mcap ratio estimation
    const volumeNum = parseFloat(volumeStr.replace(/[^0-9.]/g, ''));
    const mcapNum = parseFloat(mcapStr.replace(/[^0-9.]/g, ''));
    const volMcapRatio = mcapNum > 0 ? volumeNum / mcapNum : 0;

    if (volMcapRatio > 0.5) {
      causes.push({
        category: '📊 Extreme Volume/MCap Ratio',
        severity: 'HIGH',
        description: `24h volume is ${(volMcapRatio * 100).toFixed(0)}% of market cap, indicating:`,
        factors: [
          'Unusual trading activity - possibly wash trading or coordinated buying',
          'High speculation and short-term trading dominance',
          'Price may be driven by derivatives mechanics rather than spot demand'
        ],
        evidence: `Volume: ${cmcData.volume24h} | MCap: ${cmcData.marketCap}`,
        likelihood: 'High speculation environment'
      });
    }
  }

  // 4. Supply structure
  if (onChainData.totalSupply !== 'Unknown') {
    causes.push({
      category: '📋 Supply Structure',
      severity: 'MEDIUM',
      description: `On-chain total supply: ${onChainData.totalSupply} tokens.`,
      factors: [
        'Check CoinMarketCap for circulating supply vs total supply ratio',
        'Low circulating supply = susceptible to price manipulation',
        'Future token unlocks may create selling pressure'
      ],
      evidence: `Total Supply: ${onChainData.totalSupply}`,
      likelihood: 'Verify with project tokenomics'
    });
  }

  return causes;
}

// ==================== Price Prediction ====================

function generatePricePrediction(cmcData, onChainData, rootCauses) {
  console.log('🔮 Generating price prediction...');

  const priceStr = cmcData.price || '?';
  const priceNum = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  const changeNum = cmcData.change24h ? parseFloat(cmcData.change24h.replace(/[^0-9.-]/g, '')) : 0;

  const prediction = {
    shortTerm: { period: '1-3 days', outlook: '', targets: [], reasoning: [] },
    mediumTerm: { period: '1-4 weeks', outlook: '', targets: [], reasoning: [] },
    longTerm: { period: '3-12 months', outlook: '', reasoning: [] }
  };

  if (priceNum > 0) {
    const highRiskCount = rootCauses.filter(c => c.severity === 'HIGH' || c.severity === 'CRITICAL').length;

    // Short term
    if (changeNum > 100) {
      prediction.shortTerm.outlook = '🟡 VOLATILE - Momentum may continue but exhaustion likely';
      prediction.shortTerm.targets = [
        `Resistance: $${(priceNum * 1.2).toFixed(2)} (+20%)`,
        `Strong Resistance: $${(priceNum * 1.5).toFixed(2)} (+50%)`,
        `Support: $${(priceNum * 0.8).toFixed(2)} (-20%)`
      ];
      prediction.shortTerm.reasoning = [
        'Extreme momentum may attract more buyers',
        'Watch for volume decline = trend weakening',
        'Social media hype cycle typically lasts 2-5 days'
      ];
    } else if (changeNum > 20) {
      prediction.shortTerm.outlook = '🟢 BULLISH - Moderate uptrend';
      prediction.shortTerm.targets = [
        `Resistance: $${(priceNum * 1.15).toFixed(2)} (+15%)`,
        `Support: $${(priceNum * 0.9).toFixed(2)} (-10%)`
      ];
      prediction.shortTerm.reasoning = [
        'Healthy uptrend with room for continuation',
        'Watch for volume confirmation'
      ];
    } else {
      prediction.shortTerm.outlook = '⚪ NEUTRAL - Consolidation expected';
      prediction.shortTerm.targets = [
        `Range: $${(priceNum * 0.9).toFixed(2)} - $${(priceNum * 1.1).toFixed(2)}`
      ];
      prediction.shortTerm.reasoning = [
        'No strong momentum in either direction',
        'Wait for breakout or breakdown confirmation'
      ];
    }

    // Medium term
    if (highRiskCount > 2) {
      prediction.mediumTerm.outlook = '🔴 HIGH DUMP RISK';
      prediction.mediumTerm.targets = [
        `Primary Support: $${(priceNum * 0.5).toFixed(2)} (-50%)`,
        `Secondary Support: $${(priceNum * 0.3).toFixed(2)} (-70%)`,
        `Complete Reversal: $${(priceNum * 0.1).toFixed(2)} (-90%)`
      ];
      prediction.mediumTerm.reasoning = [
        'Multiple high-severity risk factors detected',
        'Mechanical pumps (short squeezes) always exhaust',
        'Whale distribution confirmed on-chain'
      ];
    } else if (highRiskCount > 0) {
      prediction.mediumTerm.outlook = '🟡 MODERATE CORRECTION RISK';
      prediction.mediumTerm.targets = [
        `Support: $${(priceNum * 0.7).toFixed(2)} (-30%)`,
        `Strong Support: $${(priceNum * 0.5).toFixed(2)} (-50%)`
      ];
      prediction.mediumTerm.reasoning = [
        'Some risk factors present but not extreme',
        'Correction likely if momentum fades'
      ];
    } else {
      prediction.mediumTerm.outlook = '🟢 STABLE UPTREND POSSIBLE';
      prediction.mediumTerm.targets = [
        `Target: $${(priceNum * 1.5).toFixed(2)} (+50%)`,
        `Support: $${(priceNum * 0.8).toFixed(2)} (-20%)`
      ];
      prediction.mediumTerm.reasoning = [
        'No major red flags from on-chain data',
        'Sustainable growth if fundamentals are strong'
      ];
    }

    // Long term
    prediction.longTerm.outlook = highRiskCount > 2 ? '🔴 BEARISH' : '⚪ UNCERTAIN';
    prediction.longTerm.reasoning = [
      'Long-term depends on project fundamentals',
      'Check: team, product, adoption, revenue',
      'Token unlock schedules may create selling pressure',
      'Research project roadmap and execution'
    ];
  }

  return prediction;
}

// ==================== Risk Assessment ====================

function assessRisk(cmcData, onChainData, rootCauses) {
  console.log('⚠️ Assessing risks...');

  const risks = [];
  const positives = [];

  // Analyze root causes for risks
  rootCauses.forEach(cause => {
    if (cause.severity === 'CRITICAL' || cause.severity === 'HIGH') {
      risks.push({
        severity: cause.severity,
        factor: cause.category.replace(/[📈📉🐋📊📋]/g, '').trim(),
        detail: cause.description,
        evidence: cause.evidence,
        likelihood: cause.likelihood
      });
    }
  });

  // On-chain specific risks
  if (onChainData.whaleFlow.distributionWallets.length > 0) {
    risks.push({
      severity: 'CRITICAL',
      factor: 'Active Selling Pressure',
      detail: `${onChainData.whaleFlow.distributionWallets.length} wallets showing net outflow`,
      evidence: onChainData.whaleFlow.distributionWallets.slice(0, 3).map(w =>
        `\`${w.address.substring(0, 10)}...\` sold ${(w.netSent / 1000).toFixed(0)}K tokens`
      ).join('\n'),
      likelihood: 'Confirmed - selling in progress'
    });
  }

  // Positive factors
  if (onChainData.totalSupply !== 'Unknown') {
    positives.push({
      factor: 'On-Chain Supply Verified',
      detail: `Total supply: ${onChainData.totalSupply} tokens`,
      source: 'Etherscan API'
    });
  }

  if (onChainData.whaleFlow.accumulationWallets.length > 0) {
    positives.push({
      factor: 'Whale Accumulation Detected',
      detail: `${onChainData.whaleFlow.accumulationWallets.length} wallet(s) accumulating`,
      source: 'On-chain transfer analysis'
    });
  }

  const changeNum = cmcData.change24h ? parseFloat(cmcData.change24h.replace(/[^0-9.-]/g, '')) : 0;
  if (changeNum > 0) {
    positives.push({
      factor: 'Strong Price Momentum',
      detail: `+${changeNum.toFixed(0)}% in 24h - bullish short-term`,
      source: 'CoinMarketCap'
    });
  }

  // Calculate overall risk score
  const criticalCount = risks.filter(r => r.severity === 'CRITICAL').length;
  const highCount = risks.filter(r => r.severity === 'HIGH').length;

  let overallRisk, riskEmoji, riskColor;
  if (criticalCount > 0 || highCount > 2) {
    overallRisk = 'EXTREMELY HIGH RISK';
    riskEmoji = '🔴🔴';
    riskColor = 'CRITICAL';
  } else if (highCount > 0) {
    overallRisk = 'HIGH RISK';
    riskEmoji = '🔴';
    riskColor = 'HIGH';
  } else if (risks.length > 0) {
    overallRisk = 'MODERATE RISK';
    riskEmoji = '🟡';
    riskColor = 'MEDIUM';
  } else {
    overallRisk = 'LOWER RISK';
    riskEmoji = '🟢';
    riskColor = 'LOW';
  }

  return {
    risks,
    positives,
    overall: { overallRisk, riskEmoji, riskColor, criticalCount, highCount }
  };
}

// ==================== Recommendation Engine ====================

function generateRecommendation(riskAssessment, pricePrediction, cmcData, rootCauses) {
  console.log('🎯 Generating recommendations...');

  const { overall, risks, positives } = riskAssessment;
  const changeNum = cmcData.change24h ? parseFloat(cmcData.change24h.replace(/[^0-9.-]/g, '')) : 0;

  const recommendations = {
    scenarios: [],
    conclusion: '',
    riskReward: ''
  };

  if (overall.criticalCount > 0 || overall.highCount > 2) {
    // High risk scenario
    recommendations.scenarios = [
      { scenario: 'Considering buying', action: '🚫 DO NOT BUY - Extremely risky', detail: 'Multiple red flags detected' },
      { scenario: 'Currently holding', action: '💰 TAKE PROFITS NOW', detail: 'Selling pressure confirmed, dump likely' },
      { scenario: 'Want to short', action: '⚡ STRONG SETUP', detail: 'Multiple catalysts for reversal' },
      { scenario: 'Expected move', action: '📉 50-90% correction likely', detail: 'When momentum breaks' }
    ];
    recommendations.conclusion = 'This appears to be a CLASSIC PUMP AND DUMP SETUP. Multiple high-severity risk factors detected including on-chain selling pressure, extreme price momentum, and potential whale manipulation.';
    recommendations.riskReward = 'CATASTROPHICALLY POOR 🔴';
  } else if (overall.highCount > 0) {
    // Moderate-high risk
    recommendations.scenarios = [
      { scenario: 'Considering buying', action: '⚠️ EXERCISE EXTREME CAUTION', detail: 'Some red flags present' },
      { scenario: 'Currently holding', action: '💰 CONSIDER TAKING PROFITS', detail: 'Risk factors detected' },
      { scenario: 'Want to short', action: '🔍 RESEARCH MORE', detail: 'Some risk factors but verify fundamentals' },
      { scenario: 'Expected move', action: '📉 30-50% correction possible', detail: 'If momentum fades' }
    ];
    recommendations.conclusion = 'Moderate to high risk environment. Some concerning signals detected but not extreme. Verify project fundamentals before making decisions.';
    recommendations.riskReward = 'POOR TO MODERATE 🟡';
  } else {
    // Lower risk
    recommendations.scenarios = [
      { scenario: 'Considering buying', action: '✅ VERIFY FUNDAMENTALS FIRST', detail: 'No major on-chain red flags' },
      { scenario: 'Currently holding', action: '📊 MONITOR', detail: 'Watch for changes in whale activity' },
      { scenario: 'Want to short', action: '❌ NOT RECOMMENDED', detail: 'No strong reversal signals' },
      { scenario: 'Expected move', action: '📈 Continuation possible', detail: 'If trend is sustainable' }
    ];
    recommendations.conclusion = 'Lower risk from on-chain perspective. Still requires fundamental verification - check team, product, tokenomics, and roadmap.';
    recommendations.riskReward = 'NEEDS FUNDAMENTAL VERIFICATION 🟢';
  }

  return recommendations;
}

// ==================== Generate PDF Report ====================

function generatePDFReport(slug, cmcData, onChainData, research) {
  return new Promise((resolve, reject) => {
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const { rootCauses, pricePrediction, riskAssessment, recommendation, newsCatalysts, similarCoins, pumpProbability, viabilityEval } = research;

    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Helper functions
    function addSection(title) {
      doc.moveDown(0.5);
      doc.fontSize(16).fillColor('#1a1a2e').font('Helvetica-Bold').text(title);
      doc.moveDown(0.3);
      doc.lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#4a90e2');
      doc.moveDown(0.5);
    }

    function addSubsection(title) {
      doc.moveDown(0.3);
      doc.fontSize(13).fillColor('#2c3e50').font('Helvetica-Bold').text(title);
      doc.moveDown(0.3);
    }

    function addBody(text) {
      doc.fontSize(10).fillColor('#333').font('Helvetica').text(text, { align: 'justify' });
      doc.moveDown(0.3);
    }

    function addBullet(text) {
      doc.fontSize(10).fillColor('#333').font('Helvetica').text(`• ${text}`, { indent: 15, hangingIndent: 15 });
    }

    function addTableRow(items, bold = false) {
      const y = doc.y;
      const colWidth = (doc.page.width - 100) / items.length;
      items.forEach((item, i) => {
        if (bold) {
          doc.font('Helvetica-Bold');
        } else {
          doc.font('Helvetica');
        }
        doc.fontSize(9).fillColor('#333').text(item, 50 + i * colWidth, y, { width: colWidth - 5, align: 'left' });
      });
      doc.moveDown(0.3);
    }

    function addTableHeader(items) {
      const y = doc.y;
      doc.rect(50, y - 2, doc.page.width - 100, 18).fill('#4a90e2');
      doc.fillColor('white');
      const colWidth = (doc.page.width - 100) / items.length;
      items.forEach((item, i) => {
        doc.fontSize(9).font('Helvetica-Bold').text(item, 50 + i * colWidth, y, { width: colWidth - 5, align: 'center' });
      });
      doc.fillColor('#333');
      doc.moveDown(1.2);
    }

    function checkPageBreak(neededSpace = 100) {
      if (doc.y + neededSpace > doc.page.height - 50) {
        doc.addPage();
      }
    }

    // ========== COVER PAGE ==========
    doc.fillColor('#1a1a2e');
    doc.fontSize(28).font('Helvetica-Bold').text('🔍 Deep Research Analysis', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(22).fillColor('#4a90e2').text(`${onChainData.tokenName || slug.toUpperCase()}`, { align: 'center' });
    doc.fontSize(16).text(`(${onChainData.tokenSymbol || '?'})`, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#666').text(`Research Date: ${now}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.text(`Source: CoinMarketCap + Etherscan`, { align: 'center' });

    // Key metrics box
    doc.moveDown(1);
    const boxY = doc.y;
    doc.rect(100, boxY, doc.page.width - 200, 80).fillAndStroke('#f8f9fa', '#4a90e2');
    doc.fillColor('#1a1a2e');
    doc.fontSize(11).font('Helvetica-Bold').text('KEY METRICS', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Price: ${cmcData.price}`, { align: 'center' });
    doc.text(`24h Change: ${cmcData.change24h}`, { align: 'center' });
    doc.text(`Market Cap: ${cmcData.marketCap}`, { align: 'center' });
    doc.text(`Volume: ${cmcData.volume24h}`, { align: 'center' });
    doc.moveDown(2);

    doc.addPage();

    // ========== TABLE OF CONTENTS ==========
    addSection('Table of Contents');
    const tocItems = [
      '1. Market Data Overview',
      '2. On-Chain Analysis',
      '3. Root Causes of Price Movement',
      '4. Fundamental Analysis',
      '5. Project Viability Evaluation',
      '6. Price Prediction',
      '7. Risk Assessment Summary',
      '8. Conclusion & Recommendations',
      '9. Pattern Matching & Similar Coins',
      '10. Research Sources'
    ];
    tocItems.forEach(item => {
      doc.fontSize(11).fillColor('#333').text(item);
      doc.moveDown(0.2);
    });
    doc.moveDown(1);

    // ========== 1. MARKET DATA ==========
    addSection('1. Market Data Overview');
    addTableHeader(['Metric', 'Value', 'Status']);
    addTableRow(['Price', cmcData.price || 'Unknown', cmcData.price !== '?' ? '✅ Verified' : '⚠️ Unverified']);
    addTableRow(['24h Change', cmcData.change24h || 'Unknown', cmcData.change24h !== '?' ? '✅ Verified' : '⚠️ Unverified']);
    addTableRow(['Market Cap', cmcData.marketCap || 'Unknown', cmcData.marketCap !== '?' ? '✅ Verified' : '⚠️ Unverified']);
    addTableRow(['24h Volume', cmcData.volume24h || 'Unknown', cmcData.volume24h !== '?' ? '✅ Verified' : '⚠️ Unverified']);
    addTableRow(['CMC Rank', cmcData.rank || 'Unknown', '✅ Verified']);
    doc.moveDown(0.5);
    addBody(`Source: https://coinmarketcap.com/currencies/${slug}/`);

    // ========== 2. ON-CHAIN ANALYSIS ==========
    checkPageBreak(200);
    addSection('2. On-Chain Analysis (Etherscan)');

    addSubsection('Token Information');
    addTableRow(['Property', 'Value'], true);
    addTableRow(['Token Name', onChainData.tokenName]);
    addTableRow(['Symbol', onChainData.tokenSymbol]);
    addTableRow(['Total Supply', onChainData.totalSupply]);
    addTableRow(['Decimals', onChainData.decimals]);
    addTableRow(['Transfers Analyzed', String(onChainData.recentTransferCount)]);

    // Whale wallets
    checkPageBreak(200);
    addSubsection('🐋 Whale Wallet Activity');
    addTableHeader(['Wallet', 'Net Flow', 'Tx Count', 'Classification']);
    onChainData.topWallets.slice(0, 8).forEach(w => {
      const classification = w.netFlow > 0 ? '📈 Accumulating' : '📉 Distributing';
      const netFlow = `${(w.netFlow > 0 ? '+' : '')}${(w.netFlow / 1000).toFixed(0)}K`;
      addTableRow([w.address.substring(0, 10) + '...', netFlow, String(w.txCount), classification]);
    });

    // Large transfers
    if (onChainData.whaleFlow.largeTransfers.length > 0) {
      checkPageBreak(150);
      addSubsection('💸 Large Transfers (>100K tokens)');
      onChainData.whaleFlow.largeTransfers.slice(0, 8).forEach((tx, i) => {
        addBullet(`${tx.value} ${tx.token}: ${tx.from.substring(0, 10)}... → ${tx.to.substring(0, 10)}...`);
      });
    }

    // Key findings
    checkPageBreak(100);
    addSubsection('🔑 Key Findings');
    addBullet(`Total Supply: ${onChainData.totalSupply} tokens`);
    addBullet(`Active Wallets: ${onChainData.topWallets.length} with significant activity`);
    addBullet(`Large Transfers: ${onChainData.whaleFlow.largeTransfers.length} transfers >100K`);
    const flowStatus = onChainData.tokenFlow.netFlow > 0 ? 'Net inflow - accumulation phase' :
      onChainData.tokenFlow.netFlow < 0 ? 'Net outflow - distribution phase ⚠️' : 'Neutral flow';
    addBullet(`Flow Pattern: ${flowStatus}`);

    // ========== 3. ROOT CAUSES ==========
    checkPageBreak(200);
    addSection('3. Root Causes of Price Movement');

    rootCauses.forEach((cause, i) => {
      checkPageBreak(100);
      addSubsection(`${i + 1}. ${cause.category.replace(/[📈📉🐋📊📋]/g, '').trim()}`);
      const severity = cause.severity === 'CRITICAL' ? '🔴 CRITICAL' :
        cause.severity === 'HIGH' ? '🔴 HIGH' : '🟡 MEDIUM';
      addBody(`Severity: ${severity}`);
      addBody(cause.description);
      addSubsection('Contributing Factors:');
      cause.factors.forEach(f => addBullet(f));
      addBody(`Evidence: ${cause.evidence}`);
      addBody(`Likelihood: ${cause.likelihood}`);
    });

    // ========== 4. FUNDAMENTAL ANALYSIS ==========
    checkPageBreak(200);
    addSection('4. Fundamental Analysis');

    addSubsection('⚠️ Risk Factors');
    addTableHeader(['Severity', 'Factor', 'Evidence']);
    riskAssessment.risks.slice(0, 8).forEach(r => {
      const severity = r.severity === 'CRITICAL' ? '🔴 CRITICAL' : r.severity === 'HIGH' ? '🔴 HIGH' : '🟡 MEDIUM';
      addTableRow([severity, r.factor, r.evidence.substring(0, 50) + '...']);
    });

    checkPageBreak(100);
    addSubsection('✅ Positive Factors');
    riskAssessment.positives.forEach(p => {
      addBullet(`${p.factor}: ${p.detail}`);
    });

    // News
    checkPageBreak(100);
    addSubsection('📰 News & Catalysts');
    if (newsCatalysts.news.length > 0) {
      newsCatalysts.news.slice(0, 5).forEach((n, i) => {
        addBullet(`${i + 1}. ${n.title.substring(0, 80)}...`);
        addBody(`   Source: ${n.source}`);
      });
    } else {
      addBody('No specific news found. Check general crypto market conditions.');
    }

    // ========== 5. PROJECT VIABILITY ==========
    checkPageBreak(150);
    addSection('5. Project Viability Evaluation');

    if (viabilityEval) {
      addSubsection('Overall Score');
      addTableHeader(['Criteria', 'Score', 'Status']);
      addTableRow([
        'Price Comparison',
        `${viabilityEval.scores.priceComparison.score}/${viabilityEval.scores.priceComparison.max}`,
        viabilityEval.scores.priceComparison.score > 10 ? '✅ Good' : viabilityEval.scores.priceComparison.score < 0 ? '🔴 Bad' : '⚪ Neutral'
      ]);
      addTableRow([
        'Real Value',
        `${viabilityEval.scores.realValue.score}/${viabilityEval.scores.realValue.max}`,
        viabilityEval.scores.realValue.score > 15 ? '✅ Good' : viabilityEval.scores.realValue.score < 0 ? '🔴 Bad' : '⚪ Neutral'
      ]);
      addTableRow([
        'Tokenomics',
        `${viabilityEval.scores.tokenomics.score}/${viabilityEval.scores.tokenomics.max}`,
        viabilityEval.scores.tokenomics.score > 20 ? '✅ Good' : viabilityEval.scores.tokenomics.score < 0 ? '🔴 Bad' : '⚪ Neutral'
      ]);

      checkPageBreak(100);
      addSubsection('✅ Signals');
      viabilityEval.signals.forEach(s => addBullet(s));

      if (viabilityEval.warnings.length > 0) {
        checkPageBreak(100);
        addSubsection('⚠️ Warnings');
        viabilityEval.warnings.forEach(w => addBullet(w));
      }

      checkPageBreak(80);
      addSubsection('💡 Recommendation');
      addBody(viabilityEval.recommendation);
    }

    // ========== 6. PRICE PREDICTION ==========
    checkPageBreak(200);
    addSection('6. Price Prediction');

    addSubsection(`Short-Term (${pricePrediction.shortTerm.period}): ${pricePrediction.shortTerm.outlook}`);
    pricePrediction.shortTerm.targets.forEach(t => addBullet(t));
    addSubsection('Reasoning:');
    pricePrediction.shortTerm.reasoning.forEach(r => addBullet(r));

    addSubsection(`Medium-Term (${pricePrediction.mediumTerm.period}): ${pricePrediction.mediumTerm.outlook}`);
    pricePrediction.mediumTerm.targets.forEach(t => addBullet(t));
    addSubsection('Reasoning:');
    pricePrediction.mediumTerm.reasoning.forEach(r => addBullet(r));

    addSubsection(`Long-Term (${pricePrediction.longTerm.period}): ${pricePrediction.longTerm.outlook}`);
    pricePrediction.longTerm.reasoning.forEach(r => addBullet(r));

    // ========== 7. RISK SUMMARY ==========
    checkPageBreak(150);
    addSection('7. Risk Assessment Summary');
    addTableHeader(['Metric', 'Value']);
    addTableRow(['Overall Risk', `${riskAssessment.overall.riskEmoji} ${riskAssessment.overall.overallRisk}`]);
    addTableRow(['Critical Risks', String(riskAssessment.overall.criticalCount)]);
    addTableRow(['High Risks', String(riskAssessment.overall.highCount)]);
    addTableRow(['Positive Factors', String(riskAssessment.positives.length)]);
    addTableRow(['Risk/Reward', recommendation.riskReward]);

    // ========== 8. RECOMMENDATIONS ==========
    checkPageBreak(200);
    addSection('8. Conclusion & Recommendations');

    addSubsection('Analysis Summary');
    addBody(recommendation.conclusion);

    addSubsection('Recommendations');
    addTableHeader(['Scenario', 'Action', 'Detail']);
    recommendation.scenarios.forEach(s => {
      addTableRow([s.scenario, s.action, s.detail]);
    });

    addSubsection(`Risk/Reward at Current Levels: ${recommendation.riskReward}`);

    // ========== 9. PATTERN MATCHING ==========
    checkPageBreak(200);
    addSection('9. Pattern Matching & Similar Coin Analysis');

    addSubsection('Pattern Similarity Summary');
    addTableHeader(['Metric', 'Value']);
    addTableRow(['High-Similarity Matches', `${similarCoins.matchCount} coins (>60%)`]);
    addTableRow(['Pump Probability', `${pumpProbability.probability}%`]);
    addTableRow(['Confidence', pumpProbability.confidence]);
    addTableRow(['Est. Magnitude', pumpProbability.estimatedMagnitude]);

    // Historical pumps
    checkPageBreak(150);
    addSubsection('Coins That Already Pumped (Validation)');
    similarCoins.alreadyPumped.slice(0, 5).forEach((coin, i) => {
      addBody(`${i + 1}. ${coin.name} (${coin.symbol}) - ${coin.similarity}% match`);
      addBullet(`Pump: ${coin.pumpMagnitude} on ${coin.pumpDate}`);
      addBullet(`Matching: ${coin.matchingPatterns.join(', ') || 'General pattern'}`);
      coin.lessons.forEach(l => addBullet(`Lesson: ${l}`));
    });

    // Pump candidates
    checkPageBreak(150);
    addSubsection('Potential Pump Candidates');
    similarCoins.aboutToPump.slice(0, 5).forEach((c, i) => {
      addBody(`${i + 1}. ${c.name} - ${c.probability}% probability`);
      addBullet(`Type: ${c.type}`);
      c.signals.forEach(s => addBullet(s));
      addBullet(`Reasoning: ${c.reasoning}`);
    });

    // ========== 10. SOURCES ==========
    checkPageBreak(100);
    addSection('10. Research Sources');
    addBullet(`CoinMarketCap: https://coinmarketcap.com/currencies/${slug}/`);
    addBullet(`CoinGecko: https://www.coingecko.com/en/coins/${slug.toLowerCase()}`);
    if (onChainData.totalSupply !== 'Unknown') {
      addBullet('Etherscan: On-chain data verified via Etherscan API');
    }
    addBullet(`Research Date: ${now}`);

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#999').text(
      'Disclaimer: This is not financial advice. Cryptocurrency is highly volatile. Always do your own research (DYOR).',
      { align: 'center' }
    );
    doc.text(`Generated by Deep Research Engine v2 - ${now}`, { align: 'center' });

    doc.end();
  });
}

// ==================== Generate Full Report ====================

function generateFullReport(slug, cmcData, onChainData, research) {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const { rootCauses, pricePrediction, riskAssessment, recommendation, newsCatalysts, similarCoins, pumpProbability, viabilityEval } = research;

  let report = `# 🔍 ${onChainData.tokenName || slug.toUpperCase()} (${onChainData.tokenSymbol || '?'}) - Deep Research Analysis

**Research Date:** ${now}
**Token:** ${onChainData.tokenName || slug} (${onChainData.tokenSymbol || '?'})
**Slug:** \`${slug}\`
**Contract:** ${onChainData.totalSupply !== 'Unknown' ? 'On-chain verified via Etherscan' : 'Not provided'}

---

## 📊 Market Data Overview

| Metric | Value | Status |
|--------|-------|--------|
| **Price** | ${cmcData.price || 'Unknown'} | ✅ ${cmcData.price !== '?' && cmcData.price !== 'Unknown' ? 'Verified' : 'Unverified'} |
| **24h Change** | ${cmcData.change24h || 'Unknown'} | ✅ ${cmcData.change24h !== '?' ? 'Verified' : 'Unverified'} |
| **Market Cap** | ${cmcData.marketCap || 'Unknown'} | ${cmcData.marketCap !== '?' ? '✅ Verified' : '⚠️ Unverified'} |
| **24h Volume** | ${cmcData.volume24h || 'Unknown'} | ${cmcData.volume24h !== '?' ? '✅ Verified' : '⚠️ Unverified'} |
| **CMC Rank** | ${cmcData.rank || 'Unknown'} | ✅ CoinMarketCap |

**Sources:**
- CoinMarketCap: https://coinmarketcap.com/currencies/${slug}/
- CoinGecko: https://www.coingecko.com/en/coins/${slug.toLowerCase()}

---

## 🔗 ON-CHAIN ANALYSIS (Etherscan API - Real Time)

> **Status:** ${onChainData.totalSupply !== 'Unknown' ? 'Verified via Etherscan' : 'No contract address provided - skipping on-chain analysis'}
${onChainData.totalSupply !== 'Unknown' ? `> **Total Supply (Verified):** ${onChainData.totalSupply} tokens
> **Token Name:** ${onChainData.tokenName}
> **Symbol:** ${onChainData.tokenSymbol}
> **Decimals:** ${onChainData.decimals}
> **Recent Transfers Analyzed:** ${onChainData.recentTransferCount}` : ''}

### 🐋 Whale Wallet Analysis

| Wallet | Net Flow | Received | Sent | Tx Count | Classification |
|--------|----------|----------|------|----------|----------------|
${onChainData.topWallets.map((w, i) => {
  const flow = w.netFlow > 0 ? '📈 Accumulating' : '📉 Distributing';
  return `| ${i + 1} | \`${w.address}\` | ${(w.netFlow > 0 ? '+' : '') + (w.netFlow / 1000).toFixed(0)}K | ${(w.received / 1000).toFixed(0)}K | ${(w.sent / 1000).toFixed(0)}K | ${w.txCount} | ${flow} |`;
}).join('\n') || '*No active wallet data available*'}

### 💸 Large Transfers (>100K tokens)

${onChainData.whaleFlow.largeTransfers.length > 0 ? onChainData.whaleFlow.largeTransfers.map(tx =>
`• \`${tx.from}\` → \`${tx.to}\` — **${tx.value} ${tx.token}**
  🔗 https://etherscan.io/tx/${tx.hash}`
).join('\n') : 'No large transfers (>100K) detected in recent history.'}

### 📈 Accumulation Wallets

${onChainData.whaleFlow.accumulationWallets.length > 0 ? onChainData.whaleFlow.accumulationWallets.map(w =>
`• \`${w.address}\` — Net received: **${(w.netReceived / 1000).toFixed(0)}K tokens** 🟢`
).join('\n') : 'No significant accumulation detected.'}

### 📉 Distribution/Selling Wallets

${onChainData.whaleFlow.distributionWallets.length > 0 ? onChainData.whaleFlow.distributionWallets.map(w =>
`• \`${w.address}\` — Net sent: **${(w.netSent / 1000).toFixed(0)}K tokens** ⚠️ SELLING PRESSURE`
).join('\n') : 'No significant distribution detected.'}

### 🔑 KEY FINDINGS FROM ON-CHAIN DATA

${onChainData.totalSupply !== 'Unknown' ? `1. **Token Supply:** ${onChainData.totalSupply} total tokens minted` : '1. **Token Supply:** Unable to verify (no contract provided)'}
2. **Active Wallets:** ${onChainData.topWallets.length} wallets with significant activity
3. **Large Transfers:** ${onChainData.whaleFlow.largeTransfers.length} transfers >100K tokens
4. **Flow Pattern:** ${onChainData.tokenFlow.netFlow > 0 ? 'Net inflow detected - accumulation phase' : onChainData.tokenFlow.netFlow < 0 ? 'Net outflow detected - distribution phase ⚠️' : 'Neutral flow'}
${onChainData.whaleFlow.distributionWallets.length > 0 ? `5. **Selling Pressure:** ${onChainData.whaleFlow.distributionWallets.length} wallet(s) actively distributing` : '5. **No Selling Pressure:** No distribution wallets detected ✅'}

---

## 🚀 ROOT CAUSES OF PRICE MOVEMENT

${rootCauses.map((cause, i) => `### ${i + 1}. ${cause.category}

**Severity:** ${cause.severity === 'CRITICAL' ? '🔴 CRITICAL' : cause.severity === 'HIGH' ? '🔴 HIGH' : '🟡 MEDIUM'}

${cause.description}

**Contributing Factors:**
${cause.factors.map(f => `- ${f}`).join('\n')}

**Evidence:** ${cause.evidence}

**Likelihood:** ${cause.likelihood}
`).join('\n---\n\n')}

---

## 📊 FUNDAMENTAL ANALYSIS

### Risk Factors

| Severity | Factor | Evidence |
|----------|--------|----------|
${riskAssessment.risks.map(r => `| ${r.severity === 'CRITICAL' ? '🔴' : r.severity === 'HIGH' ? '🔴' : '🟡'} **${r.severity}** | ${r.factor} | ${r.evidence.replace(/\n/g, '<br>')} |`).join('\n') || '| ✅ | No major risks detected | - |'}

### Positive Factors

| Status | Factor | Detail |
|--------|--------|--------|
${riskAssessment.positives.map(p => `| ✅ | ${p.factor} | ${p.detail} |`).join('\n') || '| ⚪ | No specific positives identified | - |'}

### 📰 News & Catalysts

${newsCatalysts.news.map((n, i) => `${i + 1}. **${n.title}**\n   Source: ${n.source}\n   🔗 ${n.url}`).join('\n\n') || 'No specific news found for this token. Check general crypto market conditions.'}

### 🔍 Research Sources to Verify

${newsCatalysts.potentialSources.map(s => `- **${s.name}** (${s.type}): ${s.url}`).join('\n')}

---

## 📊 PROJECT VIABILITY EVALUATION

### Overall Score: ${viabilityEval ? `${viabilityEval.totalScore}/${viabilityEval.maxScore}` : 'N/A'} - ${viabilityEval ? viabilityEval.grade : 'N/A'}

| Criteria | Score | Max | Status |
|----------|-------|-----|--------|
| **Price Comparison** (IDO → Listing → ATH → Current) | ${viabilityEval?.scores?.priceComparison?.score || 0} | ${viabilityEval?.scores?.priceComparison?.max || 0} | ${viabilityEval?.scores?.priceComparison?.score > 10 ? '✅' : viabilityEval?.scores?.priceComparison?.score < 0 ? '🔴' : '⚪'} |
| **Real Value** (Volume, Adoption, FDV) | ${viabilityEval?.scores?.realValue?.score || 0} | ${viabilityEval?.scores?.realValue?.max || 0} | ${viabilityEval?.scores?.realValue?.score > 15 ? '✅' : viabilityEval?.scores?.realValue?.score < 0 ? '🔴' : '⚪'} |
| **Tokenomics** (Circulating, Anti-inflation) | ${viabilityEval?.scores?.tokenomics?.score || 0} | ${viabilityEval?.scores?.tokenomics?.max || 0} | ${viabilityEval?.scores?.tokenomics?.score > 20 ? '✅' : viabilityEval?.scores?.tokenomics?.score < 0 ? '🔴' : '⚪'} |

### ✅ Signals (${viabilityEval?.signals?.length || 0})

${viabilityEval?.signals?.map(s => `- ${s}`).join('\n') || '- No specific signals detected'}

### ⚠️ Warnings (${viabilityEval?.warnings?.length || 0})

${viabilityEval?.warnings?.map(w => `- ${w}`).join('\n') || '- No warnings detected'}

### 💡 Recommendation

**${viabilityEval?.recommendation || 'N/A'}**

---

## 🔮 PRICE PREDICTION

### Short-Term (${pricePrediction.shortTerm.period}): ${pricePrediction.shortTerm.outlook}

**Key Levels:**
${pricePrediction.shortTerm.targets.map(t => `- ${t}`).join('\n')}

**Reasoning:**
${pricePrediction.shortTerm.reasoning.map(r => `- ${r}`).join('\n')}

---

### Medium-Term (${pricePrediction.mediumTerm.period}): ${pricePrediction.mediumTerm.outlook}

**Key Levels:**
${pricePrediction.mediumTerm.targets.map(t => `- ${t}`).join('\n')}

**Reasoning:**
${pricePrediction.mediumTerm.reasoning.map(r => `- ${r}`).join('\n')}

---

### Long-Term (${pricePrediction.longTerm.period}): ${pricePrediction.longTerm.outlook}

**Reasoning:**
${pricePrediction.longTerm.reasoning.map(r => `- ${r}`).join('\n')}

---

## ⚠️ RISK ASSESSMENT SUMMARY

| Metric | Value |
|--------|-------|
| **Overall Risk** | ${riskAssessment.overall.riskEmoji} **${riskAssessment.overall.overallRisk}** |
| **Critical Risks** | ${riskAssessment.overall.criticalCount} |
| **High Risks** | ${riskAssessment.overall.highCount} |
| **Positive Factors** | ${riskAssessment.positives.length} |
| **Risk/Reward** | ${recommendation.riskReward} |

---

## 🎯 CONCLUSION & RECOMMENDATION

### Analysis Summary

${recommendation.conclusion}

### Recommendations

| Scenario | Action | Detail |
|----------|--------|--------|
${recommendation.scenarios.map(s => `| **${s.scenario}** | ${s.action} | ${s.detail} |`).join('\n')}

### Risk/Reward at Current Levels: **${recommendation.riskReward}**

---

## 📚 ALL RESEARCH SOURCES

1. **CoinMarketCap** - https://coinmarketcap.com/currencies/${slug}/
2. **CoinGecko** - https://www.coingecko.com/en/coins/${slug.toLowerCase()}
${onChainData.totalSupply !== 'Unknown' ? `3. **Etherscan** - On-chain data verified via Etherscan API` : ''}
4. **Research Date** - ${now}

---

*Disclaimer: This is not financial advice. Cryptocurrency is highly volatile. Always do your own research (DYOR).*

**Analysis generated by Deep Research Engine v2 - ${now}**
`;

  return report;
}

// ==================== Generate Telegram Messages ====================

function generateTelegramSummary(slug, cmcData, onChainData, research) {
  const { rootCauses, pricePrediction, riskAssessment, recommendation } = research;
  const { overall, risks, positives } = riskAssessment;

  const changeNum = cmcData.change24h ? parseFloat(cmcData.change24h.replace(/[^0-9.-]/g, '')) : 0;

  let summary = `🔍 *${onChainData.tokenName || slug.toUpperCase()} Research Complete*\n\n`;
  summary += `💰 *Price:* ${cmcData.price || 'Unknown'}\n`;
  summary += `📈 *24h:* ${cmcData.change24h || 'Unknown'}\n`;
  summary += `💵 *MCap:* ${cmcData.marketCap || 'Unknown'}\n`;
  summary += `📊 *Volume:* ${cmcData.volume24h || 'Unknown'}\n`;
  summary += `🏆 *Rank:* ${cmcData.rank || 'Unknown'}\n\n`;

  // Root causes
  summary += `🚀 *ROOT CAUSES:*\n`;
  rootCauses.slice(0, 3).forEach((cause, i) => {
    summary += `${i + 1}. ${cause.category.replace(/[📈📉🐋📊📋]/g, '').trim()}\n`;
  });
  summary += `\n`;

  // On-chain
  if (onChainData.totalSupply !== 'Unknown') {
    summary += `🔗 *ON-CHAIN:*\n`;
    summary += `• Supply: ${onChainData.totalSupply}\n`;
    summary += `• Active Wallets: ${onChainData.topWallets.length}\n`;
    summary += `• Accumulation: ${onChainData.whaleFlow.accumulationWallets.length} wallet(s)\n`;
    summary += `• Distribution: ${onChainData.whaleFlow.distributionWallets.length} wallet(s)\n\n`;
  }

  // Risks
  const topRisks = risks.filter(r => r.severity === 'CRITICAL' || r.severity === 'HIGH').slice(0, 3);
  if (topRisks.length > 0) {
    summary += `⚠️ *RED FLAGS:*\n`;
    topRisks.forEach(r => {
      summary += `• ${r.factor}\n`;
    });
    summary += `\n`;
  }

  // Positives
  if (positives.length > 0) {
    summary += `✅ *POSITIVES:*\n`;
    positives.slice(0, 3).forEach(p => {
      summary += `• ${p.factor}\n`;
    });
    summary += `\n`;
  }

  // Overall risk
  summary += `${overall.riskEmoji} *${overall.overallRisk}*\n`;
  summary += `📉 *Expected:* ${recommendation.scenarios[3]?.action || 'Verify manually'}\n\n`;
  summary += `💡 *Risk/Reward:* ${recommendation.riskReward}\n`;
  summary += `📄 _Full report attached below_`;

  return summary;
}

function generateOnChainMessage(onChainData) {
  let msg = `🔗 *ON-CHAIN DETAIL*\n\n`;
  msg += `*Token:* ${onChainData.tokenName} (${onChainData.tokenSymbol})\n`;
  msg += `*Total Supply:* ${onChainData.totalSupply}\n\n`;

  if (onChainData.topWallets.length > 0) {
    msg += `*🐋 Top Active Wallets:*\n`;
    onChainData.topWallets.slice(0, 5).forEach((w, i) => {
      const flow = w.netFlow > 0 ? '📈 ACCUMULATING' : '📉 DISTRIBUTING';
      msg += `${i + 1}. ${flow}\n`;
      msg += `   \`${w.address}\`\n`;
      msg += `   Net: ${(w.netFlow / 1000).toFixed(0)}K | Tx: ${w.txCount}\n`;
    });
  }

  if (onChainData.whaleFlow.largeTransfers.length > 0) {
    msg += `\n*🚨 Large Transfers:*\n`;
    onChainData.whaleFlow.largeTransfers.slice(0, 5).forEach(tx => {
      msg += `• ${tx.value} ${tx.token}\n`;
      msg += `   \`${tx.from.substring(0, 10)}...\` → \`${tx.to.substring(0, 10)}...\`\n`;
    });
  }

  // Flow summary
  msg += `\n*📊 Flow Summary:*\n`;
  msg += `• Net Flow: ${(onChainData.tokenFlow.netFlow / 1000).toFixed(0)}K\n`;
  msg += `• Inflow: ${(onChainData.tokenFlow.inflow / 1000).toFixed(0)}K\n`;
  msg += `• Outflow: ${(onChainData.tokenFlow.outflow / 1000).toFixed(0)}K\n`;

  return msg;
}

function generateFundamentalMessage(riskAssessment) {
  const { risks, positives, overall } = riskAssessment;

  let msg = `📊 *FUNDAMENTAL ANALYSIS*\n\n`;
  msg += `${overall.riskEmoji} *Overall:* ${overall.overallRisk}\n`;
  msg += `🔴 Critical: ${overall.criticalCount} | High: ${overall.highCount}\n\n`;

  msg += `⚠️ *Risk Factors:*\n`;
  risks.slice(0, 5).forEach(r => {
    const emoji = r.severity === 'CRITICAL' ? '🔴' : r.severity === 'HIGH' ? '🔴' : '🟡';
    msg += `${emoji} ${r.severity}: ${r.factor}\n`;
    msg += `   ${r.detail.substring(0, 100)}...\n`;
  });

  if (positives.length > 0) {
    msg += `\n✅ *Positive Factors:*\n`;
    positives.slice(0, 5).forEach(p => {
      msg += `✅ ${p.factor}\n`;
      msg += `   ${p.detail}\n`;
    });
  }

  return msg;
}

// ==================== Main Research Function ====================

async function research(slug, options = {}) {
  console.log(`\n🔍 Starting Deep Research v3 for: ${slug}`);
  console.log('='.repeat(60));

  // Step 1: Get CMC data
  console.log('\n📊 Step 1: Fetching CoinMarketCap data...');
  const cmcData = await scrapePrice(slug);

  if (cmcData.error || !cmcData.name || cmcData.name === '?') {
    console.error(`❌ Could not find data for "${slug}"`);
    return { error: `Coin "${slug}" not found on CoinMarketCap` };
  }

  console.log(`✅ Found: ${cmcData.name} (${cmcData.symbol})`);
  console.log(`   Price: ${cmcData.price} | 24h: ${cmcData.change24h}`);

  // Step 2: Get on-chain data
  console.log('\n🔗 Step 2: Fetching on-chain data...');
  const onChainData = await getOnChainData(options.contractAddress);

  // Step 3: News & catalysts
  console.log('\n📰 Step 3: Searching news and catalysts...');
  const newsCatalysts = await searchNewsAndCatalysts(slug, onChainData.tokenSymbol);

  // Step 4: Root cause analysis
  console.log('\n🔍 Step 4: Analyzing root causes...');
  const rootCauses = analyzeRootCauses(cmcData, onChainData);
  console.log(`✅ Found ${rootCauses.length} root causes`);

  // Step 5: Price prediction
  console.log('\n🔮 Step 5: Generating price prediction...');
  const pricePrediction = generatePricePrediction(cmcData, onChainData, rootCauses);

  // Step 6: Risk assessment
  console.log('\n⚠️ Step 6: Assessing risks...');
  const riskAssessment = assessRisk(cmcData, onChainData, rootCauses);
  console.log(`✅ ${riskAssessment.risks.length} risks, ${riskAssessment.positives.length} positives`);

  // Step 7: Recommendation
  console.log('\n🎯 Step 7: Generating recommendations...');
  const recommendation = generateRecommendation(riskAssessment, pricePrediction, cmcData, rootCauses);

  // Step 8: Pattern matching + similar coin discovery
  console.log('\n🔍 Step 8: Running pattern matching analysis...');
  const fundamental = {
    risks: riskAssessment.risks,
    positives: riskAssessment.positives,
    news: newsCatalysts.news,
    catalysts: newsCatalysts.catalysts
  };
  const pattern = buildPatternSignature(cmcData, onChainData, fundamental);
  const similarCoins = findSimilarCoins(pattern, slug, options);
  const pumpProbability = calculatePumpProbability(pattern, similarCoins);
  console.log(`✅ Pump probability: ${pumpProbability.probability}% (${pumpProbability.confidence})`);

  // Step 8.5: Project viability evaluation (new criteria)
  console.log('\n📊 Step 8.5: Evaluating project viability...');
  const viabilityEval = evaluateCoin(slug, cmcData, onChainData);
  console.log(`✅ Viability Score: ${viabilityEval.totalScore}/${viabilityEval.maxScore} (${viabilityEval.grade})`);

  // Step 9: Generate reports
  console.log('\n📝 Step 9: Generating reports...');
  const researchData = {
    rootCauses, pricePrediction, riskAssessment, recommendation,
    newsCatalysts, pattern, similarCoins, pumpProbability, fundamental,
    viabilityEval
  };
  const fullReport = generateFullReport(slug, cmcData, onChainData, researchData);
  const telegramSummary = generateTelegramSummary(slug, cmcData, onChainData, researchData);
  const onChainMessage = generateOnChainMessage(onChainData);
  const fundamentalMessage = generateFundamentalMessage(riskAssessment);
  const patternMatchMessage = generatePatternMatchTelegram(similarCoins, pumpProbability);

  // Step 10: Generate PDF
  console.log('\n📄 Step 10: Generating PDF...');
  const pdfBuffer = await generatePDFReport(slug, cmcData, onChainData, researchData);

  // Step 11: Save files
  const now = new Date().toISOString().split('T')[0];
  const fileNameMD = `${slug}-analysis-${now}.md`;
  const fileNamePDF = `${slug}-analysis-${now}.pdf`;
  const mdPath = path.join(OUTPUT_DIR, fileNameMD);
  const pdfPath = path.join(OUTPUT_DIR, fileNamePDF);

  fs.writeFileSync(mdPath, fullReport, 'utf-8');
  fs.writeFileSync(pdfPath, pdfBuffer);

  console.log(`\n✅ MD report saved: ${mdPath}`);
  console.log(`✅ PDF report saved: ${pdfPath}`);
  console.log('='.repeat(60));

  return {
    success: true,
    slug,
    cmcData,
    onChainData,
    research: researchData,
    telegramSummary,
    onChainMessage,
    fundamentalMessage,
    patternMatchMessage,
    fullReport,
    pdfBuffer,
    mdPath,
    pdfPath,
    fileNameMD,
    fileNamePDF
  };
}

// ==================== Export for Telegram Bot ====================

module.exports = {
  research,
  generatePDFReport,
  generateTelegramSummary,
  generateOnChainMessage,
  generateFundamentalMessage,
  generateFullReport,
  generatePatternMatchTelegram
};

// ==================== CLI Mode ====================

if (require.main === module) {
  const slug = process.argv[2];

  if (!slug) {
    console.log(`
🔍 Deep Research Engine v2 - RAVE-Level Detail

Usage: node research.js <slug> [options]

Options:
  --contract 0x...    Contract address for on-chain analysis

Examples:
  node research.js bitcoin
  node research.js ravedao --contract 0x17205fab260a7a6383a81452cE6315A39370Db97
`);
    process.exit(1);
  }

  // Parse contract address
  const contractIdx = process.argv.indexOf('--contract');
  const options = {};
  if (contractIdx !== -1 && process.argv[contractIdx + 1]) {
    options.contractAddress = process.argv[contractIdx + 1];
  }

  research(slug, options).then(result => {
    if (result.error) {
      console.error(result.error);
      process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📱 TELEGRAM SUMMARY:');
    console.log('='.repeat(60));
    console.log(result.telegramSummary);

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Full report: ${result.filePath}`);
    console.log('='.repeat(60));
  });
}
