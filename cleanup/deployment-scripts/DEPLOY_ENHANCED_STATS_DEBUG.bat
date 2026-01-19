@echo off
echo ========================================
echo DEPLOYING ENHANCED STATS DEBUGGING
echo ========================================
echo.

echo 📊 ISSUE IDENTIFIED: Assessment and career plan completion rates showing 0%
echo 🎯 Fix: Enhanced debugging to show actual session and recommendation data
echo.

echo 📝 ROOT CAUSE ANALYSIS:
echo From logs: Assessment completion: 0/2 = 0%, Career plan completion: 0/2 = 0%
echo This means students have no completed assessments or career recommendations
echo Need to check actual data structure and completion status fields
echo.

echo 🔍 ENHANCED DEBUGGING ADDED:
echo - Show actual assessment session data (id, status, completed_at, started_at)
echo - Try alternative completion status values (complete, finished)
echo - Show actual career recommendation data (id, generated_at, career_matches)
echo - Check multiple completion detection methods
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
git commit -m "Enhanced debugging for counselor stats percentage calculation

- Add detailed assessment session data logging (id, status, completed_at)
- Try alternative completion status detection (complete, finished)
- Add career recommendation data structure logging
- Debug actual data fields to identify why percentages are 0%
- Help identify correct completion status field names and values"

git push origin main

echo.
echo ========================================
echo ✅ ENHANCED STATS DEBUG DEPLOYED!
echo ========================================
echo.
echo 🔗 Backend URL: https://lantern-ai.onrender.com
echo 🔗 Frontend URL: https://main.d36ebthmdi6xdg.amplifyapp.com
echo.
echo 📋 DEBUGGING CHECKLIST:
echo ✓ Wait for Render deployment to complete (~2-3 minutes)
echo ✓ Login as counselor and navigate to dashboard
echo ✓ Check Render logs for enhanced debugging output
echo ✓ Look for "📊 DEBUG - Student X session details" messages
echo ✓ Check actual status values and completed_at fields
echo ✓ Look for "📊 DEBUG - Student X career rec details" messages
echo.
echo 🎯 EXPECTED ENHANCED DEBUG OUTPUT:
echo - "📊 DEBUG - Student 1 session details: [{id: 123, status: 'active', completed_at: null}]"
echo - "📊 DEBUG - Student 1 alternative completed check: 0"
echo - "📊 DEBUG - Student 1 career rec details: [{id: 456, generated_at: '2024-01-01'}]"
echo.
echo 🔍 WHAT TO LOOK FOR IN LOGS:
echo 1. What are the actual status values? (active, pending, completed, finished?)
echo 2. Are completed_at fields null or have actual dates?
echo 3. Do career recommendations exist but with different structure?
echo 4. Are students completing assessments but status not being set correctly?
echo.
echo 💡 LIKELY SOLUTIONS BASED ON FINDINGS:
echo - If status is 'active' but should be 'completed': Fix completion logic
echo - If completed_at is null but assessment is done: Fix completion timestamp
echo - If career recommendations exist: Check data structure differences
echo - If no data at all: Check student-counselor relationships
echo.
pause