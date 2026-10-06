$ErrorActionPreference = "Stop"

$OriginalRoot = Split-Path -Parent $PSScriptRoot
$BuildDrive = $null
$Root = $OriginalRoot

function Test-CommandAvailable([string]$Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-FreeSubstDrive {
  foreach ($letter in @("Z","Y","X","W","V","U","T","S")) {
    $drive = $letter + ":"
    if (-not (Test-Path "$drive\")) { return $drive }
  }
  throw "No free drive letter is available for the temporary Windows build mapping."
}

try {
  Write-Host "Lumos Aris Windows packaging preflight..."

  if (-not $IsWindows -and $env:OS -ne "Windows_NT") { throw "Windows packaging must run on Windows." }
  if (-not (Test-CommandAvailable "bun")) { throw "Bun is required. Install Bun and reopen PowerShell." }

  $hasSpace = $OriginalRoot -match "\s"
  if ($hasSpace) {
    Write-Warning "Repository path contains spaces: $OriginalRoot"
    Write-Warning "Native node-gyp modules such as msgpackr-extract and tree-sitter are unreliable in paths containing spaces."
    Write-Host "Creating a temporary drive mapping so the native build sees a space-free path..."
    $BuildDrive = Get-FreeSubstDrive
    & subst $BuildDrive $OriginalRoot
    if ($LASTEXITCODE -ne 0) { throw "Unable to create temporary drive mapping $BuildDrive for $OriginalRoot" }
    $Root = "$BuildDrive\"
    Write-Host "Native build root: $Root"
  }

  Set-Location $Root

  if ($Root.Length -gt 80) { Write-Warning "Build root is $($Root.Length) characters. C:\LumosAris is the recommended permanent location." }

  $longPaths = (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -ErrorAction SilentlyContinue).LongPathsEnabled
  if ($longPaths -ne 1) { Write-Warning "Windows LongPathsEnabled is not enabled. The temporary drive mapping reduces path depth, but enabling long paths is recommended." }

  $bunVersion = (& bun --version).Trim()
  Write-Host "Bun: $bunVersion"
  Write-Host "Repository package manager: bun@1.3.11"
  if ($bunVersion -ne "1.3.11") { Write-Warning "This checkout declares bun@1.3.11 but $bunVersion is installed. Packaging may still work, but use Bun 1.3.11 for the most reproducible build." }

  if (Test-CommandAvailable "node") { Write-Host "Node: $((& node --version).Trim())" }
  if (Test-CommandAvailable "python") { Write-Host "Python: $((& python --version 2>&1).ToString().Trim())" }

  Write-Host "Installing/verifying Lumos Aris workspace dependencies with the Windows-compatible hoisted linker..."
  bun install --linker hoisted
  if ($LASTEXITCODE -ne 0) { throw "Bun dependency installation failed." }

  $nativeStore = Join-Path $Root "node_modules\.bun"
  if (Test-Path $nativeStore) { Write-Warning "Bun isolated dependency store is still present. Native lifecycle builds may hit MAX_PATH." }

  powershell -ExecutionPolicy Bypass -File .\scripts\prepare_lumos_aris_api_runtime.ps1
  if ($LASTEXITCODE -ne 0) { throw "API runtime preparation failed." }

  Write-Host "Building Lumos Aris Windows desktop installer..."
  bun run --cwd packages/desktop package:win
  if ($LASTEXITCODE -ne 0) { throw "Lumos Aris Windows packaging failed." }

  Write-Host ""
  Write-Host "Lumos Aris Windows package created under packages\desktop\dist"
}
finally {
  if ($BuildDrive) {
    Set-Location $OriginalRoot
    & subst $BuildDrive /d | Out-Null
    Write-Host "Removed temporary build mapping $BuildDrive"
  }
}