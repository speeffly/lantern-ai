@echo off
echo ========================================
echo   LANTERN AI - PRODUCTION DEPLOYMENT
echo ========================================
echo.
echo This script will deploy the assessment persistence fix to production.
echo.
echo CHANGES INCLUDED:
echo - Fixed assessment disappearing after logout
echo - Assessment now saves to database properly
echo - Grade and location persistence fixed
echo - Database-first loading implemented
echo.
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the lantern-ai directory.
    pause
    exit /b 1
)

echo Step 1: Checking git status...
echo ========================================
git status
echo.

echo Step 2: Adding all changes...
echo ========================================
git add .
echo.

echo Step 3: Committing changes...
echo ========================================
git commit -m "Fix critical assessment persistence bug - save to database instead of localStorage"
echo.

echo Step 4: Pushing to repository...
echo ========================================
echo.
echo IMPORTANT: This will trigger automatic deployment on your hosting platform.
echo.
set /p CONFIRM="Are you sure you want to push to production? (yes/no): "

if /i not "%CONFIRM%"=="yes" (
    echo.
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo Pushing to main branch...
git push origin main

echo.
echo ========================================
echo   DEPLOYMENT INITIATED
echo ========================================
echo.
echo Your hosting platform (Render/Amplify) should now be deploying the changes.
echo.
echo NEXT STEPS:
echo 1. Monitor your hosting platform's deployment logs
echo 2. Wait for "Deploy succeeded" or "Deployment completed" message
echo 3. Test the production site with the steps in DEPLOYMENT_GUIDE.md
echo 4. Check backend logs for "Assessment and recommendations saved to database"
echo 5. Test logout/login cycle to verify persistence
echo.
echo IMPORTANT NOTES:
echo - Existing users will need to retake the assessment
echo - New assessments will properly save to database
echo - Monitor backend logs for any errors
echo.
echo For detailed testing instructions, see DEPLOYMENT_GUIDE.md
echo.
pause
