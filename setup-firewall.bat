@echo off
chcp 65001 > nul
title Travel Planner - スマホ接続ファイアウォール許可設定

openfiles >nul 2>&1
if %errorlevel% NEQ 0 (
    echo 管理者権限に昇格して実行します...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================================
echo  Travel Planner: スマホ接続用ポート(5173)の開放
echo ========================================================
echo.
echo ファイアウォール規則を追加しています...
netsh advfirewall firewall delete rule name="Vite Travel Planner (Port 5173)" > nul 2>&1
netsh advfirewall firewall add rule name="Vite Travel Planner (Port 5173)" dir=in action=allow protocol=TCP localport=5173

echo.
echo ========================================================
echo  【設定完了】ポート 5173 の受信を許可しました！
echo  これで同じWi-Fiにいるスマホから正常に開けるようになります。
echo ========================================================
echo.
pause
