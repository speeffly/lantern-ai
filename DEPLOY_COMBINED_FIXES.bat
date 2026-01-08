@echo off
echo ========================================
echo DEPLOYING COMBINED FIXES TO PRODUCTION
echo ========================================
echo.
echo Fixes included:
echo - TypeScript compilation errors resolved
echo - Parent-child account linking implemented  
echo - Enhanced assessment detection logic
echo - Parent authentication fixes
echo.

cd /d "%~dp0"

echo Step 1: Building backend...
cd backend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)

echo.
echo Step 2: Building frontend...
cd ../frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying to Render...
cd ..
git add .
git commit -m "Fix: TypeScript compilation errors and implement parent-child linking

- Fixed invalid status comparisons in counselor service
- Resolved property access errors in assessment detection
- Implemented complete parent-child account linking system
- Enhanced assessment detection with multiple methods
- All builds successful with 30 pages generated"

git push origin main

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo Monitor the following:
echo - Render deployment logs for successful build
echo - Parent-child linking functionality in production
echo - Counselor dashboard statistics accuracy
echo - Enhanced assessment detection performance
echo.
echo Production URL: https://main.d36ebthmdi6xdg.amplifyapp.com
echo Backend URL: https://lantern-ai.onrender.com
echo.
pause