param(
  [ValidateSet("start","stop","restart","status","doctor")]
  [string]$Action = "status",
  [int]$Port = 47991
)
$ErrorActionPreference="Stop"
$Root = if ($env:LUMOS_ARIS_HOME) { $env:LUMOS_ARIS_HOME } else { Join-Path $env:LOCALAPPDATA "LumosAris" }
$Exe = Join-Path $Root "packages\api\dist\lumos-aris-api.exe"
$PidFile = Join-Path $Root "lumos-aris-api.pid"
function Test-Api { try { $r=Invoke-WebRequest -UseBasicParsing -Uri ("http://127.0.0.1:{0}/health" -f $Port) -TimeoutSec 3; return $r.StatusCode -eq 200 } catch { return $false } }
function Get-ApiPid { if(Test-Path $PidFile){ try { [int](Get-Content $PidFile -Raw).Trim() } catch {} } }
function Start-Api {
  if(Test-Api){ Write-Host "Lumos Aris API is already healthy."; return }
  if(!(Test-Path $Exe)){ throw "API executable not found: $Exe. Build it first with build:api:win." }
  $p=Start-Process -FilePath $Exe -WorkingDirectory (Split-Path $Exe) -PassThru -WindowStyle Hidden
  Set-Content -Path $PidFile -Value $p.Id
  Start-Sleep -Milliseconds 750
  if(!(Test-Api)){ throw "API process started but /health did not become ready." }
  Write-Host "Lumos Aris API started on 127.0.0.1:$Port (PID $($p.Id))."
}
function Stop-Api {
  $id=Get-ApiPid
  if($id){ Stop-Process -Id $id -Force -ErrorAction SilentlyContinue }
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  Write-Host "Lumos Aris API stopped."
}
switch($Action){
 "start" { Start-Api }
 "stop" { Stop-Api }
 "restart" { Stop-Api; Start-Api }
 "status" { if(Test-Api){Write-Host "HEALTHY: 127.0.0.1:$Port"}else{Write-Host "STOPPED/UNHEALTHY: 127.0.0.1:$Port"} }
 "doctor" {
   Write-Host "Root: $Root"
   Write-Host "API EXE: $(Test-Path $Exe)"
   Write-Host "Health: $(Test-Api)"
   Write-Host "Git: $(Get-Command git -ErrorAction SilentlyContinue -ErrorVariable e; if($e){'missing'}else{'OK'})"
   Write-Host "Bun: $(Get-Command bun -ErrorAction SilentlyContinue -ErrorVariable e2; if($e2){'missing'}else{'OK'})"
 }
}
