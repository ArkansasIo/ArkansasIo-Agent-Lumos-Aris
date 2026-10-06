$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) { throw "Bun was not found. Install Bun or add it to PATH." }
bun install
if ($LASTEXITCODE -ne 0) { throw "bun install failed" }
bun run --cwd packages/api build:win
if ($LASTEXITCODE -ne 0) { throw "API EXE build failed" }
$Exe = Join-Path $Root "packages\api\dist\lumos-aris-api.exe"
if (-not (Test-Path $Exe)) { throw "Expected executable was not produced: $Exe" }
Write-Host "API EXE created: $Exe"
