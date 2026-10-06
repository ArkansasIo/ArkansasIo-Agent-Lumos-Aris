@echo off
setlocal EnableExtensions

title MiMoCode - Free Local Launcher
set "SCRIPT_DIR=%~dp0"
set "ROOT=%SCRIPT_DIR%.."
for %%I in ("%ROOT%") do set "ROOT=%%~fI"

echo ==========================================
echo          MiMoCode FREE LOCAL LAUNCHER
echo ==========================================
echo Repository: %ROOT%
echo.

if not exist "%ROOT%\package.json" (
  echo ERROR: This launcher must be inside the MiMo-Code\scripts folder.
  echo.
  echo Expected:
  echo   MiMo-Code\scripts\MiMoCode-Free-Launcher.bat
  pause
  exit /b 1
)

where ollama.exe >nul 2>&1
if errorlevel 1 (
  echo Ollama is not installed.
  where winget.exe >nul 2>&1
  if errorlevel 1 (
    echo ERROR: winget is unavailable. Install Ollama, then run this launcher again.
    pause
    exit /b 1
  )
  echo Installing Ollama...
  winget install --id Ollama.Ollama -e --accept-package-agreements --accept-source-agreements
  if errorlevel 1 (
    echo ERROR: Ollama installation failed.
    pause
    exit /b 1
  )
)

where ollama.exe >nul 2>&1
if errorlevel 1 (
  echo Ollama was installed but is not visible in this CMD session.
  echo Close this window, open a new CMD/PowerShell window, and run this launcher again.
  pause
  exit /b 1
)

echo Checking Ollama service...
curl.exe -fsS --max-time 3 http://127.0.0.1:11434/api/tags >nul 2>&1
if errorlevel 1 (
  echo Starting Ollama...
  start "" /min ollama.exe serve
  timeout /t 3 /nobreak >nul
)

echo Checking local Qwen2.5-Coder model...
ollama list | findstr /I /C:"qwen2.5-coder:7b" >nul 2>&1
if errorlevel 1 (
  echo Downloading qwen2.5-coder:7b...
  echo This is a local model download and does not require a paid API token.
  ollama pull qwen2.5-coder:7b
  if errorlevel 1 (
    echo ERROR: Model download failed.
    pause
    exit /b 1
  )
)

echo.
echo Applying MiMoCode free-local configuration...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%setup_free_llm.ps1" -Size 7b
if errorlevel 1 (
  echo ERROR: Free LLM configuration failed.
  pause
  exit /b 1
)

echo.
echo Starting MiMoCode...
cd /d "%ROOT%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start_free_mimo.ps1"

set "EXITCODE=%ERRORLEVEL%"
echo.
if not "%EXITCODE%"=="0" (
  echo MiMoCode exited with code %EXITCODE%.
  pause
)
exit /b %EXITCODE%
