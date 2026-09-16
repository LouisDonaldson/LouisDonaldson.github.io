@echo off
REM Starts a local web server for Tutor Tracker and opens it in your browser.
REM Needed because browsers block the app's scripts when index.html is opened directly (CORS error).
cd /d "%~dp0"
set URL=http://localhost:8801/docs/

where node >nul 2>nul
if %errorlevel%==0 (
  echo Starting server with Node.js at %URL%
  echo Press Ctrl+C to stop.
  start "" "%URL%"
  npx --yes http-server . -p 8801 -c-1
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  echo Starting server with Python at %URL%
  echo Press Ctrl+C to stop.
  start "" "%URL%"
  py -m http.server 8801
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo Starting server with Python at %URL%
  echo Press Ctrl+C to stop.
  start "" "%URL%"
  python -m http.server 8801
  goto :eof
)

echo Neither Node.js nor Python was found.
echo Install Node.js LTS from https://nodejs.org and run this file again,
echo or open docs\index.html with the VS Code "Live Server" extension.
pause
