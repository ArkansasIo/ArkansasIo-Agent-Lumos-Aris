@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start_free_mimo.ps1" %*
if errorlevel 1 (
  echo.
  echo MiMoCode failed to start.
  echo.
  echo If Ollama is not installed, run setup_free_llm.bat first.
  exit /b 1
)

endlocal
