@echo off
echo ===============================================
echo      Push Pick Your Pup to GitHub
echo ===============================================
echo.

REM Get GitHub username from user
set /p GITHUB_USERNAME="Enter your GitHub username: "

REM Validate input
if "%GITHUB_USERNAME%"=="" (
    echo Error: GitHub username cannot be empty
    pause
    exit /b 1
)

echo.
echo Setting up GitHub remote for: %GITHUB_USERNAME%/Pick-Your-Pup
echo.

REM Add remote origin
git remote add origin https://github.com/%GITHUB_USERNAME%/Pick-Your-Pup.git

if %errorlevel% neq 0 (
    echo Warning: Remote may already exist, updating...
    git remote set-url origin https://github.com/%GITHUB_USERNAME%/Pick-Your-Pup.git
)

echo ✅ GitHub remote configured
echo.

REM Verify remote
echo 🔍 Verifying remote configuration...
git remote -v
echo.

REM Set branch to main (GitHub default)
git branch -M main

echo 📤 Pushing to GitHub...
echo.
echo Note: You may be prompted for GitHub credentials
echo If you have 2FA enabled, use a Personal Access Token as password
echo.

REM Push to GitHub
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo 🎉 Your Pick Your Pup project is now available at:
    echo    https://github.com/%GITHUB_USERNAME%/Pick-Your-Pup
    echo.
) else (
    echo.
    echo ❌ Push failed. This might be due to:
    echo    1. Repository doesn't exist on GitHub
    echo    2. Incorrect credentials
    echo    3. Network issues
    echo.
    echo 💡 Make sure you have:
    echo    1. Created the repository "Pick-Your-Pup" on GitHub
    echo    2. Have push access to the repository
    echo    3. Correct GitHub credentials
    echo.
)

pause
