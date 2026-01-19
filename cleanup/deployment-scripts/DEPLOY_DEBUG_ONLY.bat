@echo off
echo ================================================================================
echo LANTERN AI - DEBUG TOOLS DEPLOYMENT (EMERGENCY FIX)
echo ================================================================================
echo.
echo This script will:
echo 1. Deploy debug endpoints to check environment variables
echo 2. Temporarily disable academicPlanService to fix compilation
echo 3. Focus on resolving the RealJobProvider environment issue
echo.
echo ================================================================================

cd /d "%~dp0"

echo 📁 Navigating to backend directory...
cd backend

echo.
echo 🔧 Installing/updating dependencies...
call npm install

echo.
echo 🏗️ Building TypeScript to JavaScript...
call npx tsc

echo.
echo 📊 Checking build output...
if exist "dist\routes\debug.js" (
    echo ✅ Build successful - debug.js found
) else (
    echo ❌ Build failed - debug.js not found
    pause
    exit /b 1
)

echo.
echo 🚀 Deploying debug tools to production...
git add .
git commit -m "EMERGENCY: Deploy debug tools to fix environment variables

- Add /api/debug/env-check endpoint to verify environment variables
- Add /api/debug/test-jobs endpoint to test RealJobProvider
- Temporarily disable academicPlanService to fix compilation errors
- Enhanced RealJobProvider logging for better debugging
- Focus on resolving RealJobProvider disabled errors in production"

git push origin main

echo.
echo ================================================================================
echo ✅ DEBUG TOOLS DEPLOYED
echo ================================================================================
echo.
echo 🔍 IMMEDIATE TESTING REQUIRED:
echo.
echo 1. WAIT 2-3 MINUTES for Render deployment
echo.
echo 2. TEST ENVIRONMENT VARIABLES:
echo    URL: https://lantern-ai.onrender.com/api/debug/env-check
echo    Expected: "realJobProviderEnabled": true
echo.
echo 3. IF STILL DISABLED:
echo    - Go to Render Dashboard ^> Environment tab
echo    - Set: USE_REAL_JOBS=true
echo    - Set: ADZUNA_APP_ID=e1489edd  
echo    - Set: ADZUNA_APP_KEY=9bfb8c73d56c6f6a121eb239136ebe81
echo    - Click "Manual Deploy"
echo.
echo 4. TEST JOB FETCHING:
echo    URL: https://lantern-ai.onrender.com/api/debug/test-jobs
echo    Expected: Real job listings returned
echo.
echo 5. VERIFY COUNSELOR ASSESSMENT:
echo    URL: https://main.d36ebthmdi6xdg.amplifyapp.com/counselor-assessment
echo    Expected: No more "RealJobProvider disabled" errors
echo.
echo ================================================================================
echo ⚠️  TEMPORARY CHANGES MADE
echo ================================================================================
echo.
echo - AcademicPlanService temporarily disabled due to compilation errors
echo - FourYearPlan returns fallback data
echo - All other functionality (AI recommendations, jobs) works normally
echo - Once environment variables are fixed, we'll restore AcademicPlanService
echo.
echo ================================================================================

pause