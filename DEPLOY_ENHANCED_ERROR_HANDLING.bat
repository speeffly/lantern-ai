@echo off
echo ========================================
echo DEPLOYING ENHANCED ERROR HANDLING
echo ========================================
echo.

echo 🔍 ISSUE: Persistent constraint violation despite validation
echo 🎯 Fix: Enhanced error handling and graceful degradation
echo.

echo 📝 CHANGES MADE:
echo - Added detailed error logging for constraint violations
echo - Enhanced error handling in database INSERT operations
echo - Graceful degradation for page loading (return empty arrays on error)
echo - Better error messages for debugging constraint issues
echo - Prevent page crashes due to constraint errors
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
git commit -m "Enhanced error handling for constraint violations

- Add detailed error logging for database constraint errors
- Enhanced error handling in counselor note INSERT operations  
- Graceful degradation for student detail page loading
- Prevent page crashes due to constraint violations
- Better debugging information for constraint issues
- Return empty arrays instead of failing entire page load"

git push origin main

echo.
echo ========================================
echo ✅ ENHANCED ERROR HANDLING DEPLOYED!
echo ========================================
echo.
echo 🔗 Backend URL: https://lantern-ai.onrender.com
echo 🔗 Frontend URL: https://main.d36ebthmdi6xdg.amplifyapp.com
echo.
echo 📋 TESTING CHECKLIST:
echo ✓ Wait for Render deployment to complete (~2-3 minutes)
echo ✓ Login as counselor and navigate to student detail page
echo ✓ Check if page loads (should not crash even with constraint errors)
echo ✓ Check Render logs for detailed error messages
echo ✓ Try creating a note to see specific constraint error details
echo ✓ Look for "🔍" debug messages in logs
echo.
echo 🎯 EXPECTED RESULTS:
echo - Student detail page loads without crashing
echo - Detailed error logs show exact constraint violation cause
echo - Notes/assignments sections show empty state instead of errors
echo - Clear error messages for any constraint violations
echo.
echo 📝 DEBUGGING INFORMATION:
echo - Check Render logs for "❌ Database INSERT error" messages
echo - Look for "🔍 Failed INSERT parameters" with exact values
echo - Check for constraint error details and parameter values
echo - Identify which specific value is causing the constraint violation
echo.
echo ⚠️ IF ISSUE PERSISTS:
echo 1. Check Render logs for exact error details
echo 2. Consider temporary constraint removal (see EMERGENCY_CONSTRAINT_FIX.md)
echo 3. Verify database schema matches application expectations
echo 4. Check for hidden characters or encoding issues in data
echo.
pause