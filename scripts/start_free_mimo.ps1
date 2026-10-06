$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  throw "Ollama is not installed. Run .\scripts\setup_free_llm.ps1 first."
}

try {
  Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3 | Out-Null
} catch {
  $ollama = Get-Command ollama -ErrorAction SilentlyContinue
  Start-Process -FilePath $ollama.Source -ArgumentList "serve" -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

Write-Host "Starting MiMoCode with LOCAL / FREE inference..." -ForegroundColor Cyan
$env:MIMOCODE_HOME = Join-Path $root ".dev-home"

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
      $match = Get-ChildItem -Path (Split-Path $candidate -Parent) -Filter "bun.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($match) { return $match.FullName }
    }
  }

  return $null
}

$bunPath = Find-Bun

if (-not $bunPath -and (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "Bun was not found. Installing Bun with winget..." -ForegroundColor Yellow
  winget install --id Oven-sh.Bun -e --accept-package-agreements --accept-source-agreements
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  $bunPath = Find-Bun
}

if (-not $bunPath) {
  throw "Bun is not installed or could not be located. Install Bun for Windows, restart PowerShell, and run this script again."
}

Write-Host "Using Bun: $bunPath" -ForegroundColor DarkGray
& $bunPath run dev
exit $LASTEXITCODE
