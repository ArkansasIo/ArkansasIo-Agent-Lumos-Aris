$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Lumos Aris Windows packaging preflight..."

$projectPath = (Get-Location).Path
if ($projectPath.Length -gt 80) {
  Write-Warning "Repository path is $($projectPath.Length) characters. Windows native addon builds are more reliable from a short path such as C:\LumosAris."
}

$bunVersion = (& bun --version).Trim()
Write-Host "Bun: $bunVersion"
Write-Host "Repository package manager: bun@1.3.11"

Write-Host "Installing/verifying Lumos Aris workspace dependencies with the Windows-compatible hoisted linker..."
bun install --linker hoisted
if ($LASTEXITCODE -ne 0) { throw "Bun dependency installation failed." }

$nativeStore = Join-Path $Root "node_modules\.bun"
if (Test-Path $nativeStore) {
  Write-Warning "Bun isolated dependency store is still present. Native lifecycle builds may hit MAX_PATH. Delete node_modules and rerun this script if tree-sitter fails with MSB3491."
}

powershell -ExecutionPolicy Bypass -File .\scripts\prepare_lumos_aris_api_runtime.ps1
if ($LASTEXITCODE -ne 0) { throw "API runtime preparation failed." }

Write-Host "Building Lumos Aris Windows desktop installer..."
bun run --cwd packages/desktop package:win
if ($LASTEXITCODE -ne 0) { throw "Lumos Aris Windows packaging failed." }

Write-Host "Lumos Aris Windows package created under packages\desktop\dist"
