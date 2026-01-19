@echo off
echo ==========================================
echo DEPLOYING ENHANCED ASSESSMENT DEBUG FIX
echo ==========================================

echo.
echo 🔧 WHAT THIS DEPLOYMENT INCLUDES:
echo - Enhanced assessment detection with 4 comprehensive methods
echo - Detailed JSON logging of raw session data
echo - Multiple status value checks (completed, complete, finished)
echo - Profile data assessment detection
echo - More conservative fallback logic
echo - Detection method tracking for debugging
echo.

echo 📋 ENHANCED DETECTION METHODS:
echo 1. Status/timestamp check (completed, complete, finished status OR completed_at)
echo 2. Answer count check (sessions with answers in assessment_answers table)
echo 3. Career recommendations check (indicates completed assessment)
echo 4. Profile data check (interests, skills, career_preferences)
echo 5. Conservative fallback (substantial sessions only)
echo.

echo 🎯 ENHANCED DEBUG OUTPUT:
echo - Raw session data as JSON for inspection
echo - Answer count for each session (0 or positive number)
echo - Detection method used for each student
echo - Profile data presence check
echo - Conservative fallback logic with session age check
echo.

echo ⚠️ DEBUGGING INFORMATION AFTER DEPLOYMENT:
echo 1. Login as counselor and check dashboard statistics
echo 2. Monitor Render logs for "📊 DEBUG - Student X raw session data:" messages
echo 3. Look for "📊 DEBUG - Student X completion method: [method] ✅" messages
echo 4. Check answer counts: "📊 DEBUG - Student X session Y has Z answers"
echo 5. Verify detection method tracking for successful identifications
echo.

echo 🚀 Starting deployment...
echo.

cd /d "%~dp0"

echo 📁 Navigating to backend directory...
cd backend

echo 📦 Installing dependencies...
call npm install

echo 🔨 Building TypeScript...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed! Check TypeScript errors above.
    pause
    exit /b 1
)

echo ✅ Build successful!

echo 🚀 Deploying to Render...
git add .
git commit -m "Enhanced assessment detection debugging with comprehensive methods

- Added detailed JSON logging of raw session data for inspection
- Enhanced status checking: completed, complete, finished, OR completed_at timestamp
- Added profile data assessment detection (interests, skills, career_preferences)
- Implemented detection method tracking to identify which method works
- Added conservative fallback logic with session age validation
- Enhanced answer count logging for each session
- Improved debugging output to identify exact data structure issues

Debug improvements:
- Raw session data logged as JSON for structure analysis
- Detection method tracking: status/timestamp, has answers, career recommendations, profile data, fallback
- Answer count verification for each session
- Profile data presence checking
- Conservative fallback only for substantial sessions (>1 minute old)

This should identify:
1. Actual session status values in database
2. Whether sessions have answers
3. Which detection method successfully identifies completed assessments
4. Exact data structure for proper assessment completion logic"

git push origin main

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🔍 NEXT STEPS:
echo 1. Wait 2-3 minutes for Render deployment
echo 2. Login as counselor: https://main.d36ebthmdi6xdg.amplifyapp.com/login
echo 3. Go to counselor dashboard and check Quick Overview statistics
echo 4. Monitor Render logs: https://dashboard.render.com/
echo 5. Look for enhanced debug messages with raw session data
echo.
echo 📊 EXPECTED DEBUG OUTPUT:
echo - "📊 DEBUG - Student X raw session data: {...}"
echo - "📊 DEBUG - Student X completed sessions (method 1): Y"
echo - "📊 DEBUG - Student X sessions with answers (method 2): Y"
echo - "📊 DEBUG - Student X career recommendations (method 3): Y"
echo - "📊 DEBUG - Student X completion method: [method] ✅"
echo.
echo 🎯 SUCCESS CRITERIA:
echo - Raw session data reveals actual status values and structure
echo - At least one detection method identifies completed assessments
echo - Assessment completion percentage should be greater than 0%%
echo - Detection method tracking shows which approach works
echo.
echo 🔧 TROUBLESHOOTING:
echo If still 0%%, the debug logs will show:
echo - Exact session status values (might not be "completed")
echo - Whether sessions have answers (might be 0 for all)
echo - Whether career recommendations exist
echo - Whether profile data indicates completion
echo - This will guide the final targeted fix
echo.

pause