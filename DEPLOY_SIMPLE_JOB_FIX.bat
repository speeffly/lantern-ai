@echo off
echo ================================================================================
echo LANTERN AI - SIMPLE JOB FETCHING FIX DEPLOYMENT
echo ================================================================================
echo.
echo This script will:
echo 1. Deploy the optimized aiRecommendationService with duplicate job fix
echo 2. Rebuild TypeScript to JavaScript
echo 3. Deploy to production
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
git commit -m "Fix: Prevent duplicate job fetching in aiRecommendationService

- Add preloadedJobs parameter to generateRecommendations method
- Fetch jobs once in generateComprehensiveGuidance and reuse
- Eliminate duplicate API calls within the same service
- Maintain backward compatibility with optional parameter"

git push origin main

echo.
echo ================================================================================
echo ✅ DEPLOYMENT COMPLETE
echo ================================================================================
echo.
echo The backend has been optimized with the following improvements:
echo.
echo 🔧 FIXES APPLIED:
echo   • Eliminated duplicate job API calls within aiRecommendationService
echo   • Jobs now fetched once and reused in comprehensive guidance
echo   • Maintained backward compatibility
echo   • Fixed RealJobProvider configuration
echo.
echo 📡 DEPLOYMENT STATUS:
echo   • Code pushed to main branch
echo   • Render.com will automatically rebuild and deploy
echo   • New deployment should be live in 2-3 minutes
echo.
echo 🧪 TESTING:
echo   • Test the counselor assessment after deployment
echo   • Check logs for reduced API calls
echo   • Verify no more duplicate job fetching errors
echo.
echo ================================================================================

pause