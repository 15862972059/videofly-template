param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

$ngrokExe = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
if (-not (Test-Path $ngrokExe)) {
  $ngrokCommand = Get-Command ngrok -ErrorAction SilentlyContinue
  if ($ngrokCommand) {
    $ngrokExe = $ngrokCommand.Source
  } else {
    throw "ngrok.exe not found. Please install ngrok first."
  }
}

Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force

$logFile = Join-Path $env:TEMP "ngrok-$Port.log"
$errorFile = Join-Path $env:TEMP "ngrok-$Port.err.log"
Remove-Item $logFile -ErrorAction SilentlyContinue
Remove-Item $errorFile -ErrorAction SilentlyContinue

foreach ($proxyVar in @("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy")) {
  Remove-Item "Env:$proxyVar" -ErrorAction SilentlyContinue
}

Start-Process `
  -FilePath $ngrokExe `
  -ArgumentList @("http", "$Port", "--log", "stdout", "--log-format", "json") `
  -RedirectStandardOutput $logFile `
  -RedirectStandardError $errorFile `
  -WindowStyle Minimized | Out-Null

$tunnels = $null
$publicUrl = $null
for ($attempt = 0; $attempt -lt 20; $attempt++) {
  Start-Sleep -Seconds 1
  try {
    $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels"
    $publicUrl = $tunnels.tunnels |
      Where-Object { $_.proto -eq "https" } |
      Select-Object -First 1 -ExpandProperty public_url
    if ($publicUrl) {
      break
    }
  } catch {
    # Keep polling until ngrok is ready.
  }
}

if (-not $tunnels) {
  Write-Output "[ngrok] failed to start tunnel. Check logs:"
  Write-Output $logFile
  if (Test-Path $logFile) {
    Get-Content $logFile
  }
  if (Test-Path $errorFile) {
    Get-Content $errorFile
  }
  exit 1
}

if (-not $publicUrl) {
  Write-Output "[ngrok] failed to start tunnel. Check log:"
  Write-Output $logFile
  if (Test-Path $logFile) {
    Get-Content $logFile
  }
  if (Test-Path $errorFile) {
    Get-Content $errorFile
  }
  exit 1
}

Write-Output ""
Write-Output "ngrok is running for local port $Port"
Write-Output "Public URL: $publicUrl"
Write-Output "Webhook URL: $publicUrl/api/auth/creem/webhook"
Write-Output "Inspector: http://127.0.0.1:4040"
Write-Output "Log file: $logFile"
