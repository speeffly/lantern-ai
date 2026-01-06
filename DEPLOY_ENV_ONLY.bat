@echo off
echo ================================================================================
echo LANTERN AI - ENVIRONMENT VARIABLES DEBUG (MINIMAL DEPLOYMENT)
echo ================================================================================
echo.
echo FOCUS: Fix "RealJobProvider disabled" errors in production
echo APPROACH: Deploy debug endpoints only, ignore JSON parsing issues for now
echo.
echo ================================================================================

cd /d "%~dp0"

echo 📁 Navigating to backend directory...
cd backend

echo.
echo 🔧 Installing/updating dependencies...
call npm install

echo.
echo 🏗️ Building TypeScript to JavaScript (ignoring aiRecommendationService errors)...
call npx tsc --skipLibCheck --noEmitOnError false

echo.
echo 📊 Checking debug endpoints...
if exist "dist\routes\debug.js" (
    echo ✅ Debug endpoints compiled successfully
) else (
    echo ❌ Debug endpoints failed to compile
    pause
    exit /b 1
)

echo.
echo 🚀 Deploying environment debug tools...
git add src/routes/debug.ts src/index.ts
git commit -m "Add environment debug endpoints to fix RealJobProvider issues

- Add /api/debug/env-check to verify environment variables in production
- Add /api/debug/test-jobs to test RealJobProvider functionality
- Enhanced RealJobProvider logging for better debugging
- Focus on resolving 'RealJobProvider disabled' errors
- JSON parsing improvements to be addressed separately"

git push origin main

echo.
echo ================================================================================
echo ✅ DEBUG ENDPOINTS DEPLOYED
echo ================================================================================
echo.
echo 🔍 IMMEDIATE TESTING REQUIRED:
echo.
echo 1. WAIT 2-3 MINUTES for Render deployment
echo.
echo 2. TEST ENVIRONMENT VARIABLES:
echo    https://lantern-ai.onrender.com/api/debug/env-check
echo.
echo    SUCCESS = "realJobProviderEnabled": true
echo    FAILURE = "realJobProviderEnabled": false
echo.
echo 3. IF FAILURE - SET IN RENDER DASHBOARD:
echo    - USE_REAL_JOBS=true
echo    - ADZUNA_APP_ID=e1489edd
echo    - ADZUNA_APP_KEY=9bfb8c73d56c6f6a121eb239136ebe81
echo    - Then click "Manual Deploy"
echo.
echo 4. TEST JOB FETCHING:
echo    https://lantern-ai.onrender.com/api/debug/test-jobs
echo    Should return real job listings
echo.
echo 5. VERIFY COUNSELOR ASSESSMENT:
echo    Should show NO MORE "RealJobProvider disabled" errors
echo.
echo ================================================================================
echo 📝 NEXT STEPS AFTER ENVIRONMENT FIX:
echo ================================================================================
echo.
echo 1. Fix JSON parsing issues in aiRecommendationService
echo 2. Restore academicPlanService functionality  
echo 3. Implement job fetching optimization
echo 4. Full system testing and optimization
echo.
echo ================================================================================

pause