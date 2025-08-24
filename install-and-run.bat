@echo off
echo ===============================================
echo    Pick Your Pup - Backend Setup and Launch
echo ===============================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Set up database
echo 🗄️ Setting up database...
call node setup-database.js

if %errorlevel% neq 0 (
    echo ❌ Failed to set up database
    pause
    exit /b 1
)

echo ✅ Database setup completed
echo.

REM Start the server
echo 🚀 Starting Pick Your Pup server...
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔌 API: http://localhost:3000/api
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
