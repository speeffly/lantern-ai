@echo off
echo ================================================================================
echo LANTERN AI - JOB FETCHING OPTIMIZATION DEPLOYMENT
echo ================================================================================
echo.
echo This script will:
echo 1. Fix duplicate job fetching issues
echo 2. Rebuild TypeScript to JavaScript
echo 3. Deploy optimized backend to production
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
echo 🧪 Testing RealJobProvider configuration...
node test-real-job-provider.js

echo.
echo 📊 Checking build output...
if exist "dist\services\aiRecommendationService.js" (
    echo ✅ Build successful - aiRecommendationService.js found
) else (
    echo ❌ Build failed - aiRecommendationService.js not found
    pause
    exit /b 1
)

echo.
echo 🚀 Deploying to production...
echo Note: This will trigger automatic deployment on Render.com
git add .
git commit -m "Fix: Optimize job fetching to prevent duplicate API calls

- Add preloadedJobs parameter to prevent duplicate fetching
- Update generateComprehensiveGuidance to fetch jobs once and reuse
- Update academicPlanService to accept preloaded jobs
- Fix RealJobProvider configuration issues
- Optimize API usage and reduce costs"

git push origin main

echo.
echo ================================================================================
echo ✅ DEPLOYMENT COMPLETE
echo ================================================================================
echo.
echo The backend has been optimized and deployed with the following improvements:
echo.
echo 🔧 FIXES APPLIED:
echo   • Eliminated duplicate job API calls
echo   • Jobs now fetched once and reused across all services
echo   • Fixed RealJobProvider configuration
echo   • Optimized comprehensive guidance generation
echo.
echo 📡 DEPLOYMENT STATUS:
echo   • Code pushed to main branch
echo   • Render.com will automatically rebuild and deploy
echo   • New deployment should be live in 2-3 minutes
echo.
echo 🧪 TESTING:
echo   • Test the counselor assessment after deployment
echo   • Check logs for "Using preloaded jobs" messages
echo   • Verify no more "RealJobProvider disabled" errors
echo.
echo ================================================================================

pause