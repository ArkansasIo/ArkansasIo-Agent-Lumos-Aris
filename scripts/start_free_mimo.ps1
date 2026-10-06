$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  throw "Ollama is not installed. Run .\scripts\setup_free_llm.ps1 first."
}

try {
  Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3 | Out-Null
} catch {
  Start-Process -FilePath (Get-Command ollama).Source -ArgumentList "serve" -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

Write-Host "Starting MiMoCode with LOCAL / FREE inference..." -ForegroundColor Cyan
$env:MIMOCODE_HOME = Join-Path $root ".dev-home"
& bun run dev
exit $LASTEXITCODE
