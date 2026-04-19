# Báo Cáo Nhanh: Hệ thống `deep-research-coin` hiện đang làm được gì

## 1. Mục tiêu hệ thống

Hệ thống hiện tại dùng để nghiên cứu coin/token theo hướng bán tự động, kết hợp:

- dữ liệu thị trường từ CoinMarketCap
- xác minh on-chain runtime chính qua Etherscan
- có phần chuẩn bị mở rộng sang Solscan và Bscscan trong `pattern-matcher.js`, nhưng chưa hoàn thiện thành flow research end-to-end
- phân tích risk / catalyst / pattern
- xuất báo cáo dạng Markdown, PDF
- vận hành qua Telegram bot

## 2. Những gì hệ thống đang làm được

### 2.1. Deep research cho 1 coin

- Nhận đầu vào là `slug` CoinMarketCap, ví dụ `bitcoin`, `ravedao`
- Có thể nhận thêm `contract address` để bật phân tích on-chain sâu hơn
- Tự động tạo:
  - market overview
  - on-chain summary
  - catalyst / news scan
  - root-cause analysis
  - risk assessment
  - recommendation
  - pattern matching / similar coin analysis
  - viability score

### 2.2. Xuất báo cáo

- Xuất file `.md`
- Xuất file `.pdf`
- Lưu trong thư mục `research-output/`

### 2.3. Phân tích on-chain

- Lấy `total supply`
- Lấy `token info`
- Lấy `recent ERC20 transfers`
- Phát hiện:
  - whale accumulation
  - whale distribution
  - large transfer
  - net inflow / outflow
- Flow runtime chính hiện dùng **Etherscan API v2**

### 2.4. Quét dữ liệu thị trường

- Lấy giá coin từ CoinMarketCap
- Lấy trending coins
- Lấy top gainers / losers
- Lấy headline news
- Tìm coin theo query
- Phần này hiện dùng **browser scraping bằng Puppeteer**, không cần CMC API key

### 2.5. Coin scanner

- Chấm điểm dự án theo:
  - vị trí giá hiện tại so với ATH
  - volume / market cap
  - circulating ratio / float risk
  - whale behavior
- Trả ra grade kiểu:
  - A: tiềm năng cao
  - B: khá
  - C: trung bình / rủi ro cao

### 2.6. Whale tracker

- Theo dõi ví lớn
- Kiểm tra ETH balance
- Kiểm tra token balance
- Kiểm tra transfer history
- Phát hiện:
  - smart money behavior
  - accumulation
  - rapid distribution
  - suspicious large transfer

### 2.7. Telegram bot

Bot hiện hỗ trợ các lệnh:

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

Ý nghĩa:

- `/research`: chạy engine local có sẵn
- `/handresearch`: giao research thủ công cho Codex, có web search live, có thể cập nhật file trong workspace
- `/stop`: dừng job Codex đang chạy

## 3. API / dịch vụ đang dùng

- **CoinMarketCap**: scraping qua Puppeteer
- **Etherscan API v2**: on-chain data đang chạy thật trong `research.js`, `coin-scanner.js`, `whale-tracker.js`
- **Solscan**: đã có helper/API config trong `pattern-matcher.js`, nhưng chưa tích hợp hoàn chỉnh vào research runtime
- **Bscscan**: đã có helper/API config trong `pattern-matcher.js`, nhưng chưa tích hợp hoàn chỉnh vào research runtime
- **Telegram Bot API**: điều khiển qua chat
- **Codex CLI**: phục vụ `/hand` và `/handresearch`

## 4. Biến môi trường / cấu hình hiện có

- `TELEGRAM_BOT_TOKEN`
- `ALLOWED_TELEGRAM_USER_IDS`
- `ALLOWED_TELEGRAM_CHAT_IDS`
- `CODEX_WORKDIR`
- `CODEX_HANDRESEARCH_WORKDIR`
- `CODEX_TIMEOUT_MS`
- `CODEX_HANDRESEARCH_TIMEOUT_MS`
- `ETHERSCAN_API_KEY`
- `SOLSCAN_API_KEY` và `BSCSCAN_API_KEY` hiện chưa được chuẩn hóa vào `.env` runtime chính

## 5. Kết quả vận hành thực tế

Hiện hệ thống đã:

- chạy được local research engine
- tạo được báo cáo Markdown/PDF
- chạy được Telegram bot
- chạy được `/handresearch`
- đọc/ghi trực tiếp trong workspace project
- cho phép chạy research không timeout nếu cấu hình `CODEX_HANDRESEARCH_TIMEOUT_MS=0`

## 6. Giới hạn hiện tại

- On-chain sâu chỉ tốt khi có `contract address` rõ ràng
- Một số phần market/news vẫn là scraping, nên phụ thuộc UI của CoinMarketCap
- `whale-tracker.js` còn hardcode Etherscan key, chưa đồng bộ hoàn toàn với `.env`
- `pattern-matcher.js` đã có chuẩn bị cho Solscan/Bscscan, nhưng phần scan Solana/BSC vẫn còn placeholder, chưa thành flow end-to-end
- Chưa phải multi-chain native; runtime chính hiện vẫn xoay quanh Etherscan / Ethereum-style flow

## 7. Tóm tắt một câu

Đây là một hệ thống research coin bán tự động đã chạy được end-to-end cho flow chính trên EVM/Etherscan: lấy dữ liệu thị trường, xác minh on-chain, chấm điểm dự án, tạo báo cáo, và điều khiển qua Telegram bot; đồng thời đã có phần chuẩn bị ban đầu cho Solscan/Bscscan nhưng chưa hoàn thiện.
