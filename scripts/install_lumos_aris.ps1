$ErrorActionPreference = "Stop"
$RepoUrl = if ($env:LUMOS_ARIS_REPO_URL) { $env:LUMOS_ARIS_REPO_URL } else { "https://github.com/ArkansasIo/ArkansasIo-Agent-Lumos-Aris.git" }
$InstallDir = if ($env:LUMOS_ARIS_HOME) { $env:LUMOS_ARIS_HOME } else { Join-Path $env:LOCALAPPDATA "LumosAris" }
$BinDir = Join-Path $env:LOCALAPPDATA "LumosAris\bin"
function Fail([string]$m) { throw "[Lumos Aris] $m" }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail "Git is required." }
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) { Fail "Bun is required. Install Bun from https://bun.sh/." }
if (Test-Path (Join-Path $InstallDir ".git")) { git -C $InstallDir pull --ff-only; if ($LASTEXITCODE -ne 0) { Fail "Git update failed." } }
else { New-Item -ItemType Directory -Force -Path (Split-Path $InstallDir) | Out-Null; git clone $RepoUrl $InstallDir; if ($LASTEXITCODE -ne 0) { Fail "Git clone failed." } }
Set-Location $InstallDir
bun install
if ($LASTEXITCODE -ne 0) { Fail "Bun dependency installation failed." }
New-Item -ItemType Directory -Force -Path $BinDir | Out-Null
$cmd = "@echo off" + [Environment]::NewLine + "set LUMOS_ARIS_HOME=$InstallDir" + [Environment]::NewLine + "bun --cwd " + [char]34 + "$InstallDir\packages\opencode" + [char]34 + " --conditions=browser src\index.ts %*" + [Environment]::NewLine
Set-Content -Path (Join-Path $BinDir "lumos-aris.cmd") -Value $cmd -Encoding ASCII
$userPath = [Environment]::GetEnvironmentVariable("Path","User")
if (-not (($userPath -split ";") -contains $BinDir)) { [Environment]::SetEnvironmentVariable("Path", (($userPath.TrimEnd(";") + ";" + $BinDir).Trim(";")), "User") }
Write-Host "[Lumos Aris] Installed. Restart PowerShell, then run: lumos-aris"
