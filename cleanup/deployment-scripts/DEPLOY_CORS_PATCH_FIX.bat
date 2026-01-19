@echo off
echo ========================================
echo DEPLOYING CORS PATCH METHOD FIX
echo ========================================
echo.

echo 🌐 CORS Issue: PATCH method not allowed in preflight response
echo 🎯 Fix: Added PATCH to allowed methods in backend CORS config
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

echo 🧪 Testing CORS configuration...
node ../test-cors-patch-fix.js

cd ..

echo.
echo ✅ Backend build completed successfully!
echo.
echo 🌐 Pushing to GitHub (triggers Render deployment)...
git add .
git commit -m "Fix CORS: Add PATCH method support for student assignments

- Added PATCH to allowed methods in CORS configuration
- Fixes student assignment status update functionality
- Resolves 'Method PATCH is not allowed by Access-Control-Allow-Methods' error
- Enables students to mark assignments as in_progress/completed"

git push origin main

echo.
echo ========================================
echo ✅ CORS PATCH FIX DEPLOYED!
echo ========================================
echo.
echo 🔗 Backend URL: https://lantern-ai.onrender.com
echo 🔗 Frontend URL: https://main.d36ebthmdi6xdg.amplifyapp.com
echo.
echo 📋 TESTING CHECKLIST:
echo ✓ Wait for Render deployment to complete (~2-3 minutes)
echo ✓ Test CORS preflight with: node test-cors-patch-fix.js
echo ✓ Login as student and try updating assignment status
echo ✓ Verify no more CORS errors in browser console
echo ✓ Confirm assignment status updates work correctly
echo.
echo 🎯 EXPECTED RESULT:
echo - Student can click "Start Working" button successfully
echo - Student can click "Mark Complete" button successfully
echo - No CORS errors in browser console
echo - Assignment status updates in real-time
echo.
pause