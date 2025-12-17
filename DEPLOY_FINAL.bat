@echo off
echo 🚀 Lantern AI - Final Deployment Script
echo =====================================

echo.
echo 📦 Step 1: Checking backend build...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed!
    pause
    exit /b 1
)
echo ✅ Backend build successful!

echo.
echo 📤 Step 2: Pushing to GitHub...
cd ..
git add .
git commit -m "Final: Production-ready deployment for Presidential Innovation Challenge"
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Git push failed!
    pause
    exit /b 1
)
echo ✅ Code pushed to GitHub!

echo.
echo 🎉 Deployment Complete!
echo =====================
echo.
echo Frontend (AWS Amplify): https://main.d3k8x9y2z1m4n5.amplifyapp.com
echo Backend (Render): Will be available after deployment
echo.
echo Next Steps:
echo 1. Check Render dashboard for backend deployment status
echo 2. Update frontend environment variables with backend URL
echo 3. Test full-stack integration
echo 4. Prepare demo scenarios for judges
echo.
echo 🏆 Ready for Presidential Innovation Challenge!
pause