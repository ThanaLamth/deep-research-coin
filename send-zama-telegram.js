/**
 * Quick script to convert ZAMA MD analysis to PDF and send to Telegram
 */
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const PDFDocument = require('pdfkit');

require('dotenv').config();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const mdContent = fs.readFileSync('research-output/zama-manual-analysis.md', 'utf-8');

// Parse markdown to structured data
function parseMD(md) {
  const sections = [];
  const lines = md.split('\n');
  let currentSection = null;
  let currentSubsection = null;
  let currentContent = [];

  function flushContent() {
    if (currentSection && currentContent.length > 0) {
      currentSection.content = currentContent.join('\n');
      sections.push(currentSection);
    }
    currentSection = null;
    currentContent = [];
  }

  lines.forEach(line => {
    if (line.startsWith('# ')) {
      flushContent();
      currentSection = { type: 'title', text: line.replace('# ', '').trim() };
      currentContent = [];
    } else if (line.startsWith('## ')) {
      if (currentSection) {
        currentSection.content = currentContent.join('\n');
        sections.push(currentSection);
      }
      currentSection = { type: 'section', title: line.replace('## ', '').trim() };
      currentContent = [];
    } else if (line.startsWith('### ')) {
      currentContent.push(line);
    } else if (line.startsWith('|') || line.startsWith('-')) {
      currentContent.push(line);
    } else if (line.trim()) {
      currentContent.push(line);
    }
  });

  flushContent();
  return sections;
}

// Generate PDF from markdown content
function generateZAMAPDF(content, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    
    doc.pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);

    // Cover page
    doc.fillColor('#1a1a2e');
    doc.fontSize(28).font('Helvetica-Bold').text('Deep Research Analysis', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(22).fillColor('#4a90e2').text('ZAMA (Zama Protocol)', { align: 'center' });
    doc.fontSize(14).fillColor('#666').text('April 14, 2026', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(11).fillColor('#333').text('Confidential Asset Protocol using Fully Homomorphic Encryption (FHE)', { align: 'center' });
    doc.text('Cross-chain Confidentiality Layer for Ethereum, BSC, and Solana', { align: 'center' });
    
    // Key metrics box
    doc.moveDown(1);
    doc.rect(100, doc.y, doc.page.width - 200, 100).fillAndStroke('#f8f9fa', '#4a90e2');
    doc.fillColor('#1a1a2e');
    doc.fontSize(12).font('Helvetica-Bold').text('KEY METRICS', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text('Price: $0.02973', { align: 'center' });
    doc.text('24h Change: +14.74%', { align: 'center' });
    doc.text('Market Cap: $65.42M', { align: 'center' });
    doc.text('24h Volume: $105.82M (161.76% of MCAP)', { align: 'center' });
    doc.text('FDV: $327.1M | Circulating: 20% (2.2B / 11B)', { align: 'center' });
    
    doc.moveDown(2);
    doc.addPage();

    // Helper functions
    function addSection(title) {
      doc.moveDown(0.3);
      doc.fontSize(14).fillColor('#1a1a2e').font('Helvetica-Bold').text(title);
      doc.moveDown(0.2);
      doc.lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#4a90e2');
      doc.moveDown(0.3);
      doc.fillColor('#333');
    }

    function addSubsection(title) {
      doc.moveDown(0.2);
      doc.fontSize(11).fillColor('#2c3e50').font('Helvetica-Bold').text(title);
      doc.moveDown(0.2);
      doc.fillColor('#333');
    }

    function addBody(text) {
      doc.fontSize(10).font('Helvetica').text(text, { align: 'justify' });
      doc.moveDown(0.2);
    }

    function addBullet(text) {
      doc.fontSize(10).font('Helvetica').text(`• ${text}`, { indent: 15, hangingIndent: 15 });
    }

    function checkPageBreak(needed = 80) {
      if (doc.y + needed > doc.page.height - 50) {
        doc.addPage();
      }
    }

    function addTable(lines) {
      // Simple table rendering
      lines.forEach(line => {
        if (line.startsWith('|')) {
          const cells = line.split('|').filter(c => c.trim());
          if (cells.length > 0) {
            checkPageBreak(20);
            const y = doc.y;
            const colWidth = (doc.page.width - 100) / cells.length;
            cells.forEach((cell, i) => {
              doc.fontSize(8).font('Helvetica').text(cell.trim(), 50 + i * colWidth, y, { width: colWidth - 5 });
            });
            doc.moveDown(0.5);
          }
        } else {
          addBody(line);
        }
      });
    }

    // Process content
    const lines = content.split('\n');
    let inTable = false;
    let tableLines = [];

    function flushTable() {
      if (tableLines.length > 0) {
        addTable(tableLines);
        tableLines = [];
      }
    }

    lines.forEach(line => {
      if (line.startsWith('## ') && !line.startsWith('###')) {
        flushTable();
        checkPageBreak(50);
        addSection(line.replace('## ', '').trim());
      } else if (line.startsWith('### ')) {
        flushTable();
        addSubsection(line.replace('### ', '').trim());
      } else if (line.startsWith('|')) {
        tableLines.push(line);
      } else if (line.startsWith('- **') || line.startsWith('- ')) {
        flushTable();
        const text = line.replace(/^- /, '').replace(/\*\*/g, '').replace(/`/g, '');
        addBullet(text);
      } else if (line.trim() && !line.startsWith('---') && !line.startsWith('# ')) {
        flushTable();
        const text = line.replace(/\*\*/g, '').replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        if (text.trim()) addBody(text);
      }
    });

    flushTable();

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#999').text(
      'Disclaimer: This is not financial advice. Cryptocurrency is highly volatile. Always do your own research (DYOR).',
      { align: 'center' }
    );
    doc.text('Analysis conducted by AI Research Assistant - April 14, 2026', { align: 'center' });

    doc.end();
  });
}

// Generate PDF
const pdfPath = path.join(__dirname, 'research-output', 'zama-analysis-manual.pdf');

console.log('Generating ZAMA PDF report...');
generateZAMAPDF(mdContent, pdfPath).then(() => {
  console.log(`✅ PDF saved: ${pdfPath}`);
  console.log(`📄 Size: ${(fs.statSync(pdfPath).size / 1024).toFixed(0)} KB`);

  // Send to Telegram
  const bot = new TelegramBot(BOT_TOKEN, { polling: false });
  
  // Get chat ID from recent messages or use your chat ID
  const chatId = -1003958337967; // Your "Test Research CMC" group

  console.log('Sending to Telegram...');
  bot.sendDocument(chatId, pdfPath, {
    caption: `📄 *ZAMA Deep Research Report*\n\n` +
      `💰 Price: $0.02973 (+14.74%)\n` +
      `📊 MCAP: $65.42M | FDV: $327.1M\n` +
      `🔥 Vol/MCap: 161.76% (CRITICAL)\n` +
      `🔒 Circulating: 20% (Low Float)\n\n` +
      `📋 Sections:\n` +
      `• Market Data Overview\n` +
      `• Tokenomics Breakdown (8 allocations)\n` +
      `• Root Causes (6 detailed)\n` +
      `• Fundamental Analysis\n` +
      `• Price Prediction (Short/Med/Long)\n` +
      `• Risk Assessment (10 factors)\n` +
      `• Conclusion & Recommendations\n` +
      `• 9 Research Sources\n\n` +
      `⚠️ Risk/Reward: MODERATE TO HIGH 🟡`,
    parse_mode: 'Markdown'
  }).then(() => {
    console.log('✅ Sent to Telegram!');
    bot.stopPolling();
  }).catch(err => {
    console.error('❌ Error sending to Telegram:', err.message);
    bot.stopPolling();
  });
}).catch(err => {
  console.error('❌ Error generating PDF:', err);
});
