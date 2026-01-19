@echo off
echo ========================================
echo DEPLOYING NOTE CONSTRAINT DEBUG FIX
echo ========================================
echo.

echo 🔍 ISSUE: counselor_notes constraint violation
echo 🎯 Fix: Added debugging to identify exact values causing constraint error
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
git commit -m "Add debugging for counselor note constraint violation

- Added detailed logging in counselor routes and service
- Debug noteType values and types being received
- Identify exact cause of constraint violation error
- Helps fix student detail page loading issue"

git push origin main

echo.
echo ========================================
echo ✅ DEBUG DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo 🔗 Backend URL: https://lantern-ai.onrender.com
echo 🔗 Frontend URL: https://main.d36ebthmdi6xdg.amplifyapp.com
echo.
echo 📋 DEBUGGING STEPS:
echo 1. Wait for Render deployment to complete (~2-3 minutes)
echo 2. Try to access counselor student detail page
echo 3. Check Render logs for debug output
echo 4. Look for "🔍 DEBUG" messages in logs
echo 5. Identify the exact noteType value causing constraint error
echo.
echo 🎯 EXPECTED DEBUG OUTPUT:
echo - Request body with all field values
echo - noteType value and JavaScript type
echo - Exact parameters being passed to database
echo.
echo 📝 CONSTRAINT DETAILS:
echo Database allows: 'general', 'career_guidance', 'academic', 'personal', 'parent_communication'
echo Frontend sends: 'general' (default value)
echo.
pause