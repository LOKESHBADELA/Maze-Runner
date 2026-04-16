@echo off
REM Distributed Multiplayer Maze Escape Game - Setup Script for Windows

echo ================================================================
echo    Distributed Multiplayer Maze Escape Game
echo    Installation Script
echo ================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed.
    echo Please install Node.js v14 or higher from https://nodejs.org/
    pause
    exit /b 1
)

echo √ Node.js detected
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo X Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo √ Installation complete!
echo.
echo ================================================================
echo    Ready to play!
echo.
echo    To start the server:
echo    npm start
echo.
echo    Then open in browser:
echo    http://localhost:3000
echo.
echo    For multi-device play:
echo    See QUICKSTART.md
echo ================================================================
echo.
pause
