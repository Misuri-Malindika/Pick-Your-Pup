@echo off
echo Starting Pick Your Pup Website Server...
echo.
echo Server will start on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Node.js server...
    npx -y http-server -p 8080 -c-1
) else (
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        echo Using Python server...
        python -m http.server 8080
    ) else (
        echo Neither Node.js nor Python found.
        echo Please open index.html directly in your browser.
        pause
    )
)
