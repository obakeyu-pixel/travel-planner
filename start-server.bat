@echo off
chcp 65001 > nul
title Travel Planner 起動ツール

cd /d "%~dp0"
echo ========================================================
echo   Travel Planner 開発サーバー ＆ スマホ用トンネルを起動中...
echo ========================================================
echo.

:: 1. スマホ接続用トンネルを別ウィンドウで起動
start "Travel Planner スマホ接続トンネル" cmd /k "node scripts/tunnel.mjs"

:: 2. 3秒待ってからPCの既定ブラウザで自動オープン
timeout /t 3 /nobreak > nul
start http://localhost:5173/

:: 3. Vite 開発サーバー本体を起動
cmd /k "npm run dev"
pause
