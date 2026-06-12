@echo off
echo ========================================
echo   PrintShop Pro - Login Fix
echo ========================================
echo.

REM Step 1: Stop any running server
echo [1/4] Stopping any running servers on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
  echo      Killing PID %%a
  taskkill /F /PID %%a >nul 2>&1
)
echo      Done.
echo.

REM Step 2: Delete data folder so default admin is recreated
echo [2/4] Deleting data folder...
if exist data (
  rd /s /q data
  echo      Deleted.
) else (
  echo      No data folder - will be created fresh.
)
echo.

REM Step 3: Clear browser cookies instruction
echo [3/4] IMPORTANT: Clear browser cookies NOW
echo      - Chrome/Edge: Press F12 -^> Application -^> Storage -^> Clear site data
echo      - Or just close ALL browser windows and open a NEW Incognito window
echo.

REM Step 4: Start the server
echo [4/4] Starting server with fresh defaults...
echo.
echo   Username: printshop
echo   Password: rp2006
echo.
echo   Server will start on http://localhost:3000
echo   Open http://localhost:3000/admin in your browser
echo.
echo   Press Ctrl+C to stop the server
echo.
timeout /t 3
npm start
