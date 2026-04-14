@echo off
echo ========================================
echo   Start TopCMC Bot
echo ========================================
echo.
cd /d "C:\Users\admin\deep-research-coin"
start "TopCMC Bot" node telegram-bot.js
echo ✅ Bot started!
timeout /t 2 >nul
