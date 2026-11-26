@echo off
rem Second PC site - double-click to start. Close this window to stop the server.
rem Keep this file English-only (cmd can misread Korean).
cd /d "%~dp0"
echo Starting server at http://localhost:5100 ...
echo Close this window to stop.
rem open the browser after 2 seconds so the server is ready
start "" cmd /c "timeout /t 2 >nul & start http://localhost:5100"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
