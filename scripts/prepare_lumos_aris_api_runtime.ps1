$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) { throw "Bun was not found." }
bun run --cwd packages/api build:win
if ($LASTEXITCODE -ne 0) { throw "API EXE build failed." }
$source = Join-Path $Root "packages\api\dist\lumos-aris-api.exe"
$targetDir = Join-Path $Root "packages\desktop\api-runtime"
$target = Join-Path $targetDir "lumos-aris-api.exe"
if (-not (Test-Path $source)) { throw "API executable was not produced: $source" }
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
Copy-Item -Force $source $target
Write-Host "Prepared: $target"
