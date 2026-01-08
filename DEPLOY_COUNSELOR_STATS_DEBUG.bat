@echo off
echo ========================================
echo DEPLOYING COUNSELOR STATS DEBUG FIX
echo ========================================
echo.

echo 📊 ISSUE: Counselor dashboard percentages not showing correct numbers
echo 🎯 Fix: Added comprehensive debugging to counselor stats calculation
echo.

echo 📝 DEBUGGING ADDED:
echo - Detailed logging for each student's assessment status
echo - Career plan completion tracking with counts
echo - Assignment completion rate calculation debugging
echo - Improved assessment completion logic (check for completed status)
echo - Step-by-step percentage calculation logging
echo.

echo 📁 Current directory: %CD%
echo 📁 Backend directory: %CD%\backend
echo.

cd backend

echo 🔧 Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo 📦 Building TypeScript...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ Backend build completed successfully!
echo.
echo 🌐 Pushing to GitHub (triggers Render deployment)...
git add .
git commit -m "Add debugging for counselor dashboard statistics

- Add comprehensive logging to getCounselorStats method
- Debug assessment completion rate calculation
- Debug career plan completion rate calculation  
- Debug assignment completion rate calculation
- Improve assessment completion logic to check for completed status
- Add step-by-step percentage calculation logging
- Help identify why percentages are not showing correctly"

git push origin main

echo.
echo ========================================
echo ✅ COUNSELOR STATS DEBUG DEPLOYED!
echo ========================================
echo.
echo 🔗 Backend URL: https://lantern-ai.onrender.com
echo 🔗 Frontend URL: https://main.d36ebthmdi6xdg.amplifyapp.com
echo.
echo 📋 TESTING CHECKLIST:
echo ✓ Wait for Render deployment to complete (~2-3 minutes)
echo ✓ Login as counselor and navigate to dashboard
echo ✓ Check Render logs for "📊 DEBUG" messages when loading dashboard
echo ✓ Look for detailed statistics calculation logs
echo ✓ Verify percentage calculations in logs vs displayed values
echo ✓ Check if assessment completion logic is working correctly
echo.
echo 🎯 EXPECTED DEBUG OUTPUT:
echo - Total students count
echo - Each student's assessment session count
echo - Each student's completed assessment count
echo - Each student's career recommendation count
echo - Each student's assignment counts
echo - Final percentage calculations with numerator/denominator
echo.
echo 📊 DEBUGGING INFORMATION TO CHECK:
echo 1. Are students being found correctly?
echo 2. Are assessment sessions being counted properly?
echo 3. Are completed assessments being identified correctly?
echo 4. Are career recommendations being found?
echo 5. Are assignment completion rates calculated correctly?
echo 6. Do the final percentages match the calculations?
echo.
echo 🔍 LOOK FOR THESE LOG PATTERNS:
echo - "📊 DEBUG - Total students: X"
echo - "📊 DEBUG - Student X assessment sessions: Y"
echo - "📊 DEBUG - Student X completed sessions: Z"
echo - "📊 DEBUG - Final calculations:"
echo - "📊 DEBUG - Assessment completion: X/Y = Z%"
echo.
pause