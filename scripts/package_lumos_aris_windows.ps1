$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Installing/verifying Lumos Aris workspace dependencies..."
bun install
if ($LASTEXITCODE -ne 0) { throw "Bun dependency installation failed." }

powershell -ExecutionPolicy Bypass -File .\scripts\prepare_lumos_aris_api_runtime.ps1
if ($LASTEXITCODE -ne 0) { throw "API runtime preparation failed." }

Write-Host "Building Lumos Aris Windows desktop installer..."
bun run --cwd packages/desktop package:win
if ($LASTEXITCODE -ne 0) { throw "Lumos Aris Windows packaging failed." }

Write-Host "Lumos Aris Windows package created under packages\desktop\dist"
