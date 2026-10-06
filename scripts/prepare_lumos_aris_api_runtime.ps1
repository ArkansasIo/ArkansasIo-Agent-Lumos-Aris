$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) { throw "Bun was not found." }

function Stop-LumosArisApiProcesses {
  $names = @("lumos-aris-api", "bun")
  $targetSuffixes = @("packages\api\dist\lumos-aris-api.exe", "packages\desktop\api-runtime\lumos-aris-api.exe")
  $processes = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue
  foreach ($process in $processes) {
    $commandLine = [string]$process.CommandLine
    $matchesTarget = $false
    foreach ($suffix in $targetSuffixes) {
      if ($commandLine -like "*$suffix*") { $matchesTarget = $true; break }
    }
    if ($matchesTarget -and $process.ProcessId -ne $PID) {
      Write-Host "Stopping Lumos Aris API process PID $($process.ProcessId) before replacing the executable..."
      Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
  }
  Start-Sleep -Milliseconds 500
}

bun run --cwd packages/api build:win
if ($LASTEXITCODE -ne 0) { throw "API EXE build failed." }

$source = Join-Path $Root "packages\api\dist\lumos-aris-api.exe"
$targetDir = Join-Path $Root "packages\desktop\api-runtime"
$target = Join-Path $targetDir "lumos-aris-api.exe"
if (-not (Test-Path $source)) { throw "API executable was not produced: $source" }
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

Stop-LumosArisApiProcesses

$staged = Join-Path $targetDir ("lumos-aris-api." + [guid]::NewGuid().ToString("N") + ".tmp.exe")
Copy-Item -LiteralPath $source -Destination $staged -Force

try {
  if (Test-Path $target) {
    try { Remove-Item -LiteralPath $target -Force -ErrorAction Stop }
    catch {
      throw "The existing API executable is locked by another process or security software: $target. Close Lumos Aris/Electron and retry. Original error: $($_.Exception.Message)"
    }
  }
  Move-Item -LiteralPath $staged -Destination $target -Force
  Write-Host "Prepared: $target"
}
finally {
  if (Test-Path $staged) { Remove-Item -LiteralPath $staged -Force -ErrorAction SilentlyContinue }
}