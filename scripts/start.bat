@echo off
title AI Design Studio - Launcher
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   AI Design Studio - Launcher        ║
echo  ╚══════════════════════════════════════╝
echo.
echo  Starting services...
echo.

echo  [1] Starting Backend Server...
start "Backend Server" cmd /k "color 0B && echo Backend Server (http://localhost:3000) && npm start"
timeout /t 2 /nobreak > nul

echo  [2] Starting AI Service...
start "AI Service" cmd /k "color 0E && echo AI Service (http://localhost:5000) && python ai-service/app.py"
timeout /t 2 /nobreak > nul

echo.
echo  ✓ Both services are starting...
echo.
echo  ┌────────────────────────────────────┐
echo  │  Backend:  http://localhost:3000   │
echo  │  AI Service: http://localhost:5000 │
echo  └────────────────────────────────────┘
echo.
echo  Opening browser in 3 seconds...
timeout /t 3 /nobreak > nul

start http://localhost:3000/index.html

echo.
echo  ✓ Application launched!
echo.
echo  Press any key to close this window
echo  (The servers will continue running)
echo.
pause > nul
