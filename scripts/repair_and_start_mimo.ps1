$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Find-Bun {
  $command = Get-Command bun -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  $candidates = @(
    (Join-Path $env:USERPROFILE ".bun\bin\bun.exe"),
    (Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages\Oven-sh.Bun_*\bun.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\bun\bun.exe")
  )

  foreach ($candidate in $candidates) {
    if ($candidate -notlike "*_*" -and (Test-Path $candidate)) { return $candidate }
    if ($candidate -like "*_*") {
      $parent = Split-Path $candidate -Parent
      if (Test-Path $parent) {
        $match = Get-ChildItem -Path $parent -Filter "bun.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($match) { return $match.FullName }
      }
    }
  }
  return $null
}

$bunPath = Find-Bun
if (-not $bunPath) {
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "Bun was not found. Installing Bun..." -ForegroundColor Yellow
    winget install --id Oven-sh.Bun -e --accept-package-agreements --accept-source-agreements
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
    $bunPath = Find-Bun
  }
}
if (-not $bunPath) { throw "Bun is required but could not be located." }

if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  throw "Ollama is not installed. Run .\scripts\setup_free_llm.ps1 first."
}

Write-Host "Checking Ollama..." -ForegroundColor Cyan
try {
  Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3 | Out-Null
} catch {
  $ollama = Get-Command ollama -ErrorAction SilentlyContinue
  if (-not $ollama) { throw "Ollama is not available." }
  Start-Process -FilePath $ollama.Source -ArgumentList "serve" -WindowStyle Hidden
  Start-Sleep -Seconds 3
  Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 5 | Out-Null
}

Write-Host "Installing/verifying Bun workspace dependencies..." -ForegroundColor Cyan
& $bunPath install
if ($LASTEXITCODE -ne 0) {
  throw "bun install failed with exit code $LASTEXITCODE. Fix the install error before starting MiMoCode."
}

$required = @(
  "node_modules\@mimo-ai\shared",
  "node_modules\@mimo-ai\sdk",
  "node_modules\@effect\opentelemetry",
  "node_modules\effect"
)
$missing = $required | Where-Object { -not (Test-Path (Join-Path $root $_)) }
if ($missing.Count -gt 0) {
  throw "Workspace dependencies are still missing after bun install: $($missing -join ', ')"
}

$env:MIMOCODE_HOME = Join-Path $root ".dev-home"
Write-Host "Starting MiMoCode directly on Windows..." -ForegroundColor Green
& $bunPath run --cwd packages/opencode --conditions=browser src/index.ts
exit $LASTEXITCODE
