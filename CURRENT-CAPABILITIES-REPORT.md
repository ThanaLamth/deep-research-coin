# Bao Cao Nhanh: He thong `deep-research-coin` hien dang lam duoc gi

## 1. Muc tieu he thong

He thong hien tai dung de nghien cuu coin/token theo huong ban tu dong, ket hop:

- du lieu thi truong tu CoinMarketCap
- xac minh on-chain qua Etherscan
- phan tich risk / catalyst / pattern
- xuat bao cao dang Markdown, PDF
- van hanh qua Telegram bot

## 2. Nhung gi he thong dang lam duoc

### 2.1. Deep research cho 1 coin

- Nhan dau vao la `slug` CoinMarketCap, vi du `bitcoin`, `ravedao`
- Co the nhan them `contract address` de bat phan tich on-chain sau hon
- Tu dong tao:
  - market overview
  - on-chain summary
  - catalyst / news scan
  - root-cause analysis
  - risk assessment
  - recommendation
  - pattern matching / similar coin analysis
  - viability score

### 2.2. Xuat bao cao

- Xuat file `.md`
- Xuat file `.pdf`
- Luu trong thu muc `research-output/`

### 2.3. Phan tich on-chain

- Lay `total supply`
- Lay `token info`
- Lay `recent ERC20 transfers`
- Phat hien:
  - whale accumulation
  - whale distribution
  - large transfer
  - net inflow / outflow
- Phan nay hien dung **Etherscan API v2**

### 2.4. Quet du lieu thi truong

- Lay gia coin tu CoinMarketCap
- Lay trending coins
- Lay top gainers / losers
- Lay headline news
- Tim coin theo query
- Phan nay hien dung **browser scraping bang Puppeteer**, khong can CMC API key

### 2.5. Coin scanner

- Cham diem du an theo:
  - vi tri gia hien tai so voi ATH
  - volume / market cap
  - circulating ratio / float risk
  - whale behavior
- Tra ra grade kieu:
  - A: tiem nang cao
  - B: kha
  - C: trung binh / rui ro cao

### 2.6. Whale tracker

- Theo doi vi lon
- Kiem tra ETH balance
- Kiem tra token balance
- Kiem tra transfer history
- Phat hien:
  - smart money behavior
  - accumulation
  - rapid distribution
  - suspicious large transfer

### 2.7. Telegram bot

Bot hien ho tro cac lenh:

- `/price <slug>`
- `/trending`
- `/gainers`
- `/news`
- `/search <query>`
- `/research <slug> [contract]`
- `/hand <request>`
- `/handresearch <coin>`
- `/stop`
- `/status`
- `/about`

Y nghia:

- `/research`: chay engine local co san
- `/handresearch`: giao research thu cong cho Codex, co web search live, co the cap nhat file trong workspace
- `/stop`: dung job Codex dang chay

## 3. API / dich vu dang dung

- **CoinMarketCap**: scraping qua Puppeteer
- **Etherscan API v2**: on-chain data
- **Telegram Bot API**: dieu khien qua chat
- **Codex CLI**: phuc vu `/hand` va `/handresearch`

## 4. Bien moi truong / cau hinh hien co

- `TELEGRAM_BOT_TOKEN`
- `ALLOWED_TELEGRAM_USER_IDS`
- `ALLOWED_TELEGRAM_CHAT_IDS`
- `CODEX_WORKDIR`
- `CODEX_HANDRESEARCH_WORKDIR`
- `CODEX_TIMEOUT_MS`
- `CODEX_HANDRESEARCH_TIMEOUT_MS`
- `ETHERSCAN_API_KEY`

## 5. Ket qua van hanh thuc te

Hien he thong da:

- chay duoc local research engine
- tao duoc bao cao Markdown/PDF
- chay duoc Telegram bot
- chay duoc `/handresearch`
- doc/ghi truc tiep trong workspace project
- cho phep chay research khong timeout neu cau hinh `CODEX_HANDRESEARCH_TIMEOUT_MS=0`

## 6. Gioi han hien tai

- On-chain sau chi tot khi co `contract address` ro rang
- Mot so phan market/news van la scraping, nen phu thuoc UI cua CoinMarketCap
- `whale-tracker.js` con hardcode Etherscan key, chua dong bo hoan toan voi `.env`
- Chua phai multi-chain native; hien logic chinh van xoay quanh Etherscan / Ethereum-style flow

## 7. Tom tat mot cau

Day la mot he thong research coin ban tu dong da chay duoc end-to-end: lay du lieu thi truong, xac minh on-chain, cham diem du an, tao bao cao, va dieu khien qua Telegram bot.
