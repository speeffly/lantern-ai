@echo off
echo ========================================
echo DEPLOYING ADD STUDENT FIX
echo ========================================

echo.
echo 1. Building backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)

echo.
echo 2. Deploying to Render...
git add .
git commit -m "Fix: Update auth middleware to handle nested user tokens for counselor add student functionality"
git push origin main

echo.
echo ✅ Deployment initiated!
echo.
echo The backend will be automatically deployed to Render.
echo Please wait 2-3 minutes for the deployment to complete.
echo.
echo Then test the add student functionality in the counselor dashboard.
echo.
pause