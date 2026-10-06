@echo off
setlocal
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto_setup_lumos-aris.ps1" %*
exit /b %ERRORLEVEL%
