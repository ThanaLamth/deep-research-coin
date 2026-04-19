@echo off
echo ========================================
echo   Restart TopCMC Bot (Safe Mode)
echo   (Won't kill Qwen Code)
echo ========================================
echo.

REM Find and kill only the telegram-bot.js process
echo [1/2] Killing old bot process...
for /f "tokens=2" %%i in ('wmic process where "name='node.exe'" get CommandLine^,ProcessId ^| findstr "telegram-bot"') do (
    echo Killing PID: %%i
    taskkill /F /PID %%i >nul 2>&1
)
echo.

REM Start the bot
echo [2/2] Starting Telegram bot...
cd /d "C:\Users\admin\deep-research-coin"
start "TopCMC Bot" node telegram-bot.js

echo.
echo ✅ Bot restarted!
echo 📱 Bot is running in background
echo 💡 To stop: Task Manager ^> Details ^> find node.exe running telegram-bot.js
timeout /t 3 >nul
