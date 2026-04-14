# 🤖 Telegram Bot Setup Guide

> Your personal AI research assistant accessible via Telegram

---

## 📖 What It Does

A general-purpose Telegram bot that lets you:

- 💬 **Chat naturally** - Just type like you're talking to someone
- 🐋 **Track whales** - Get real-time whale wallet analysis
- 📊 **Scan tokens** - View top holders and tokenomics
- 💰 **Check prices** - Get live cryptocurrency prices
- 🔍 **Start research** - Initiate deep research workflows
- 📸 **Capture screenshots** - Screenshot any webpage
- 📊 **Generate reports** - Create PDF research reports
- ⚙️ **Run tools** - Execute all research tools from Telegram

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow instructions:
   - Enter bot name (e.g., "My Research Assistant")
   - Enter username (must end in "bot", e.g., "my_research_bot")
4. **Copy the bot token** (looks like: `123456789:ABCdef...`)

### Step 2: Install Dependencies

```bash
cd C:\Users\admin\deep-research-coin
npm install node-telegram-bot-api dotenv
```

### Step 3: Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Edit .env and add your bot token
```

Your `.env` file should look like:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Optional: Restrict to your Telegram account only
# Get your ID by messaging @userinfobot
ALLOWED_TELEGRAM_USER_IDS=your_telegram_user_id
```

### Step 4: Start the Bot

```bash
node telegram-bot.js
```

You should see:
```
🤖 Telegram Assistant Bot starting...
📱 Bot is now online and listening for messages
💬 Use /start to begin chatting
```

### Step 5: Chat with Your Bot

1. Open Telegram
2. Search for your bot by username
3. Send `/start` to begin
4. Try `/help` to see all commands

---

## 📱 Available Commands

### General Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Start the bot | `/start` |
| `/help` | Show all commands | `/help` |
| `/status` | Check system status | `/status` |
| `/tools` | List available tools | `/tools` |
| `/about` | About this bot | `/about` |

### Research Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/whale <address>` | Track whale wallet | `/whale 0x0d07...92fe` |
| `/scan <token>` | Scan token holders | `/scan 0x17205f...` |
| `/research <token>` | Start deep research | `/research RAVE` |
| `/price <symbol>` | Get token price | `/price BTC` |
| `/screenshot <url>` | Capture webpage | `/screenshot https://...` |

### Alert Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/alert set <amount>` | Set price alert | `/alert set 10000` |
| `/alert list` | View active alerts | `/alert list` |
| `/alert clear` | Clear all alerts | `/alert clear` |

---

## 💬 Chat Mode

You don't always need commands - just chat naturally:

```
You: "Hey, what can you do?"
Bot: "👋 Hello! I can help with research, whale tracking, prices, and more!"

You: "Track this whale: 0x0d0707963952f2fba59dd06f2b425ace40b492fe"
Bot: "🔍 Tracking whale wallet... [shows analysis]"

You: "What's the price of Ethereum?"
Bot: "💰 ETH Price: $2,950 📈 +5.2% in 24h"
```

---

## 🔒 Security

### Restrict Access (Recommended)

By default, anyone can use your bot. To restrict to yourself only:

1. Message **@userinfobot** on Telegram
2. Copy your user ID (e.g., `123456789`)
3. Add to `.env`:
   ```env
   ALLOWED_TELEGRAM_USER_IDS=123456789
   ```

Multiple users (comma-separated):
```env
ALLOWED_TELEGRAM_USER_IDS=123456789,987654321
```

### Keep Token Secret

- **NEVER** commit your `.env` file to Git
- `.env` is already in `.gitignore`
- If token leaks, revoke via @BotFather and get new one

---

## 🎯 Usage Examples

### Example 1: Track RAVE Whales

```
You: /whale 0x0d0707963952f2fba59dd06f2b425ace40b492fe

Bot: 🔍 Tracking whale wallet: 0x0d07...92fe

Bot: 🐋 WHALE ANALYSIS REPORT
============================================================

📍 Wallet: 0x0d0707963952f2fba59dd06f2b425ace40b492fe
💰 Balance: 13,489 ETH (~$40,467,000)
📊 Classification: 🐋🐋 MEGA WHALE
⚠️ Risk Level: HIGH

📈 Activity Pattern:
   Flow: DISTRIBUTING
   Total In: 50,000 RAVE
   Total Out: 45,000 RAVE

🚨 Alerts (2):
   1. [CRITICAL] 8 outgoing transfers in 6.5 hours
   2. [HIGH] Large transfer: 9,054 RAVE
```

### Example 2: Check Token Price

```
You: /price BTC

Bot: 💰 BTC Price

Price: $63,250
24h Change: 📈 +2.5%
Market Cap: $1,240,000,000,000

Last updated: 2026-04-14 10:30 AM
```

### Example 3: Scan Token Holders

```
You: /scan 0x17205fab260a7a6383a81452cE6315A39370Db97

Bot: 📊 Scanning token holders: 0x17205f...

Bot: 📊 Top 20 Active Wallets:

Rank | Wallet Address                      | Est. Balance | Classification
--------------------------------------------------------------------------------
   1 | 0x0d0707963952f2fba59dd06f2b425ace40b492fe |    500,000 | 🐋🐋 MEGA WHALE
   2 | 0x8a5221f95c8af2d249bc1a7f075b31336ee5032f |    250,000 | 🐋 WHALE
   3 | 0x566b30470d7ad97419a48900dc869bd7148736b8 |    100,000 | 🦈 LARGE HOLDER
```

### Example 4: Capture Screenshot

```
You: /screenshot https://coinmarketcap.com/currencies/ravedao/

Bot: 📸 Capturing screenshot: https://...

[Bot sends screenshot image]
```

### Example 5: Start Research

```
You: /research RAVE

Bot: 🔍 Starting deep research on: RAVE

This will take a few minutes. I'll notify you when complete.

[After processing]
Bot: ✅ Research Initiated for RAVE

Next steps:
1. Collect 10+ news sources
2. Fetch on-chain data via Etherscan API
3. Analyze whale wallets
4. Generate screenshots
5. Create Coindesk-style report
6. Export to PDF and WordPress
```

---

## 🛠️ Advanced Configuration

### Run as Background Service (Windows)

Using PM2:

```bash
npm install -g pm2

pm2 start telegram-bot.js --name "research-bot"
pm2 save
pm2 startup
```

Using nodemon (auto-restart on changes):

```bash
npm install -g nodemon

nodemon telegram-bot.js
```

### Custom Responses

Edit `telegram-bot.js` and modify the message handler to add custom conversational responses:

```javascript
// Add your own responses
if (lowerText.includes('rave')) {
  await bot.sendMessage(chatId, `
    RAVE (RaveDAO) - Current Status:
    Price: $9.23
    24h Change: +229%
    Whale Activity: HIGH (dumping confirmed)
  `);
}
```

### Add New Commands

Add new command handlers:

```javascript
bot.onText(/\/mycommand/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 'Your custom response here!');
});
```

---

## 🐛 Troubleshooting

### Bot doesn't respond

1. Check if bot is running: `node telegram-bot.js`
2. Verify token in `.env` is correct
3. Check console for error messages
4. Ensure bot has permission to read messages

### "TELEGRAM_BOT_TOKEN not found" error

- Create `.env` file in project root
- Add `TELEGRAM_BOT_TOKEN=your_token_here`
- Restart bot

### "Unauthorized" error

- Your bot token might be invalid or revoked
- Get new token from @BotFather
- Update `.env` file

### Rate limit errors

- Telegram has rate limits (30 messages/second)
- Bot automatically handles this, but excessive usage may cause issues
- Add delays if sending many messages

### Cannot access from phone

- Bot works on any Telegram client (mobile, desktop, web)
- Search for your bot's username in Telegram
- Make sure you didn't restrict access in `.env`

---

## 📊 Integration with Research Workflow

The bot integrates seamlessly with your existing research tools:

```
1. Chat with bot via Telegram
   ↓
2. Request: /whale 0x...
   ↓
3. Bot executes: whale-tracker.js
   ↓
4. Returns formatted analysis
   ↓
5. Request: /research TOKEN
   ↓
6. Bot triggers research workflow
   ↓
7. Sends PDF when complete
```

---

## 🎓 Tips & Best Practices

### ✅ Do

- Restrict bot to your user ID only (security)
- Use chat mode for quick queries
- Use commands for precise control
- Keep bot running in background (PM2)
- Monitor bot status with `/status`

### ❌ Don't

- Share bot token publicly
- Commit `.env` to Git
- Leave bot unrestricted on public server
- Send sensitive data via Telegram
- Forget to restart bot after config changes

---

## 🔮 Future Enhancements

Potential improvements:

- [ ] AI/LLM integration (GPT-4 responses)
- [ ] Image recognition (analyze charts/screenshots)
- [ ] Voice message support
- [ ] Scheduled reports (daily whale summary)
- [ ] Multi-bot system (separate bots for different tasks)
- [ ] Webhook mode (instead of polling)
- [ ] Inline queries (type @bot in any chat)
- [ ] Callback buttons (interactive menus)

---

## 📚 Resources

- **Telegram Bot API:** https://core.telegram.org/bots/api
- **BotFather Commands:** https://core.telegram.org/bots#6-botfather
- **node-telegram-bot-api:** https://github.com/yagop/node-telegram-bot-api
- **GitHub Repo:** https://github.com/ThanaLamth/deep-research-coin

---

**Last Updated:** April 14, 2026  
**Author:** Deep Research Coin  
**Version:** 1.0.0
