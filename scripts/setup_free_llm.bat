@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%setup_free_llm.ps1" %*
if errorlevel 1 (
  echo.
  echo Free local LLM setup failed.
  exit /b 1
)
endlocal
