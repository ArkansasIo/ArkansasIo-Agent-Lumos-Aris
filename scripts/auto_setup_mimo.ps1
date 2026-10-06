param(
  [ValidateSet("0.5b","1.5b","3b","7b","14b","32b")]
  [string]$Size = "7b",
  [switch]$SkipModelPull,
  [switch]$SkipStart
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Find-Bun {
  $command = Get-Command bun -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  $paths = @(
    (Join-Path $env:USERPROFILE ".bun\bin\bun.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\bun\bun.exe")
  )
  foreach ($path in $paths) {
    if (Test-Path $path) { return $path }
  }
  $wingetRoot = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
  if (Test-Path $wingetRoot) {
    $match = Get-ChildItem $wingetRoot -Filter bun.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($match) { return $match.FullName }
  }
  return $null
}

function Find-Ollama {
  $command = Get-Command ollama -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  $paths = @(
    "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe",
    "$env:ProgramFiles\Ollama\ollama.exe"
  )
  foreach ($path in $paths) {
    if (Test-Path $path) { return $path }
  }
  return $null
}

Write-Host "=== MiMoCode Automatic Windows Setup ===" -ForegroundColor Cyan
Write-Host "Repository: $root"
Write-Host "Model: qwen2.5-coder:$Size"
Write-Host ""

$bun = Find-Bun
if (-not $bun -and (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Bun..." -ForegroundColor Yellow
  winget install --id Oven-sh.Bun -e --accept-package-agreements --accept-source-agreements
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
  $bun = Find-Bun
}
if (-not $bun) { throw "Bun was not found. Install Bun and rerun this script." }

Write-Host "Bun: $bun" -ForegroundColor Green
& $bun --version
if ($LASTEXITCODE -ne 0) { throw "Bun could not be executed." }

$ollama = Find-Ollama
if (-not $ollama -and (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Ollama..." -ForegroundColor Yellow
  winget install --id Ollama.Ollama -e --accept-package-agreements --accept-source-agreements
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
  $ollama = Find-Ollama
}
if (-not $ollama) { throw "Ollama was not found. Install Ollama and rerun this script." }

Write-Host "Ollama: $ollama" -ForegroundColor Green
try {
  Invoke-RestMethod "http://127.0.0.1:11434/api/tags" -TimeoutSec 3 | Out-Null
} catch {
  Write-Host "Starting Ollama server..." -ForegroundColor Yellow
  Start-Process -FilePath $ollama -ArgumentList "serve" -WindowStyle Hidden
  Start-Sleep -Seconds 4
  Invoke-RestMethod "http://127.0.0.1:11434/api/tags" -TimeoutSec 5 | Out-Null
}

Write-Host "Installing workspace dependencies..." -ForegroundColor Cyan
& $bun install --force
if ($LASTEXITCODE -ne 0) { throw "bun install --force failed." }

Write-Host "Generating local model configuration..." -ForegroundColor Cyan
& $bun run --cwd packages/opencode fix-node-pty
if ($LASTEXITCODE -ne 0) { throw "node-pty repair failed." }

& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "scripts\setup_free_llm.ps1") -Size $Size
if ($LASTEXITCODE -ne 0) { throw "Local LLM setup failed." }

if (-not $SkipModelPull) {
  Write-Host "Pulling qwen2.5-coder:$Size..." -ForegroundColor Cyan
  & $ollama pull "qwen2.5-coder:$Size"
  if ($LASTEXITCODE -ne 0) { throw "Ollama model pull failed." }
}

Write-Host "Validating workspace module resolution..." -ForegroundColor Cyan
& $bun --cwd packages/opencode typecheck
if ($LASTEXITCODE -ne 0) { throw "MiMoCode typecheck failed." }

Write-Host ""
Write-Host "MiMoCode setup completed successfully." -ForegroundColor Green

if (-not $SkipStart) {
  & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "scripts\repair_and_start_mimo.ps1")
  exit $LASTEXITCODE
}
