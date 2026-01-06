@echo off
echo ================================================================================
echo LANTERN AI - ENVIRONMENT VARIABLES DEBUG DEPLOYMENT
echo ================================================================================
echo.
echo This script will:
echo 1. Add debug endpoints to check environment variables in production
echo 2. Deploy the debug tools to Render
echo 3. Provide testing instructions
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
git commit -m "Add environment variables debug endpoints

- Add /api/debug/env-check endpoint to verify environment variables
- Add /api/debug/test-jobs endpoint to test RealJobProvider
- Enhanced RealJobProvider logging for better debugging
- Help diagnose why USE_REAL_JOBS=true is not working in production"

git push origin main

echo.
echo ================================================================================
echo ✅ DEBUG TOOLS DEPLOYED
echo ================================================================================
echo.
echo Debug endpoints are now available in production:
echo.
echo 🔍 ENVIRONMENT CHECK:
echo   URL: https://lantern-ai.onrender.com/api/debug/env-check
echo   Purpose: Verify environment variables are loaded correctly
echo.
echo 🧪 JOB PROVIDER TEST:
echo   URL: https://lantern-ai.onrender.com/api/debug/test-jobs
echo   Purpose: Test if RealJobProvider can fetch real jobs
echo.
echo ================================================================================
echo 📋 NEXT STEPS - MANUAL VERIFICATION REQUIRED
echo ================================================================================
echo.
echo 1. WAIT FOR DEPLOYMENT (2-3 minutes)
echo    - Check Render dashboard for successful deployment
echo.
echo 2. TEST ENVIRONMENT VARIABLES:
echo    - Visit: https://lantern-ai.onrender.com/api/debug/env-check
echo    - Look for: "realJobProviderEnabled": true
echo.
echo 3. IF STILL DISABLED:
echo    a) Go to Render Dashboard ^> Your Service ^> Environment
echo    b) Verify these EXACT variables:
echo       USE_REAL_JOBS=true
echo       ADZUNA_APP_ID=e1489edd
echo       ADZUNA_APP_KEY=9bfb8c73d56c6f6a121eb239136ebe81
echo    c) Click "Manual Deploy" ^> "Deploy Latest Commit"
echo    d) Wait 2-3 minutes and test again
echo.
echo 4. TEST JOB FETCHING:
echo    - Visit: https://lantern-ai.onrender.com/api/debug/test-jobs
echo    - Should show real job results
echo.
echo 5. VERIFY COUNSELOR ASSESSMENT:
echo    - Complete assessment at: https://main.d36ebthmdi6xdg.amplifyapp.com/counselor-assessment
echo    - Check for real job data in results
echo.
echo ================================================================================
echo 🎯 SUCCESS CRITERIA
echo ================================================================================
echo.
echo ✅ env-check shows: "realJobProviderEnabled": true
echo ✅ test-jobs returns real job listings
echo ✅ No more "RealJobProvider disabled" errors in logs
echo ✅ Counselor assessment shows real job recommendations
echo.
echo ================================================================================

pause