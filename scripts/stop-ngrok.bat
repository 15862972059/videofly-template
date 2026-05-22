@echo off
taskkill /IM ngrok.exe /F >nul 2>nul
if errorlevel 1 (
  echo ngrok is not running.
  exit /b 0
)

echo ngrok stopped.
