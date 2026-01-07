@echo off
echo ================================================================================
echo 🚀 DEPLOYING DYNAMIC SALARY CALCULATION WITH DEBUG LOGGING
echo ================================================================================
echo.
echo This deployment integrates dynamic salary calculation into the main counselor
echo assessment flow and adds detailed console logging to debug salary calculations.
echo.
echo Changes:
echo - ✅ Integrated DynamicSalaryService into CounselorGuidanceService
echo - ✅ Added EnhancedCareerService for dynamic salary analysis
echo - ✅ Added detailed console logging for salary calculation debugging
echo - ✅ Updated job recommendations to use real Adzuna salary data
echo - ✅ Added step-by-step logging to show salary calculation process
echo.
echo ================================================================================

cd backend

echo 📦 Installing dependencies...
call npm install

echo 🔧 Compiling TypeScript...
call npx tsc
if %errorlevel% neq 0 (
    echo ❌ Build failed: TypeScript compilation error
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 🚀 Deploying to Render...
git add .
git commit -m "Integrate dynamic salary calculation with debug logging

- Integrated DynamicSalaryService into main counselor assessment flow
- Added EnhancedCareerService for real-time salary analysis from Adzuna
- Added comprehensive console logging to debug salary calculations
- Updated CounselorGuidanceService to use dynamic salary data
- Added step-by-step logging showing salary calculation process
- Enhanced job recommendations with real local salary data
- Added detailed breakdown of salary analysis results"

git push origin main

echo.
echo ================================================================================
echo ✅ DEPLOYMENT COMPLETE - DYNAMIC SALARY CALCULATION WITH DEBUG LOGGING
echo ================================================================================
echo.
echo The system now:
echo - 💰 Uses real Adzuna job data for salary calculations
echo - 📊 Shows detailed console logs of salary calculation process
echo - 🔍 Provides step-by-step debugging information
echo - 📈 Displays salary analysis breakdown for each career
echo - 🏢 Shows market insights and job counts
echo - ✅ Integrates dynamic salaries into main career recommendation flow
echo.
echo 🔍 To debug salary calculations:
echo 1. Go to counselor assessment: https://lantern-ai.onrender.com/counselor-assessment
echo 2. Complete the assessment
echo 3. Check Render logs for detailed salary calculation output
echo 4. Look for sections marked with salary emojis (💰 📊 📈 🏢)
echo.
echo Environment variables needed:
echo - USE_REAL_JOBS=true (already set)
echo - ADZUNA_APP_ID=e1489edd (already set)
echo - ADZUNA_API_KEY=9bfb8c73d56c6f6a121eb239136ebe81 (already set)
echo.
echo ================================================================================
pause