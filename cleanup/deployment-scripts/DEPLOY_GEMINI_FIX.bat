@echo off
echo 🔧 Deploying Gemini Model Fix to Production
echo =============================================
echo.

cd /d "%~dp0"

echo 📋 Fix Summary:
echo    - Changed model from: gemini-1.5-flash
echo    - Changed model to:   gemini-pro
echo    - Files updated:      3 files
echo    - Status:            Ready for deployment
echo.

echo ✅ Step 1: Adding all changes...
git add .

echo ✅ Step 2: Committing the fix...
git commit -m "Fix Gemini model: change gemini-1.5-flash to gemini-pro"

echo ✅ Step 3: Pushing to GitHub (triggers auto-deploy)...
git push origin main

echo.
echo 🚀 Deployment Status:
echo =============================================
echo.
echo ✅ Code pushed to GitHub
echo ⏳ Render.com will auto-deploy in 2-3 minutes
echo.
echo 📊 Monitor deployment:
echo    1. Go to: https://render.com
echo    2. Click on your "lantern-ai-backend" service
echo    3. Watch the "Logs" tab for deployment progress
echo.
echo 🧪 Test after deployment:
echo    1. Backend health: https://lantern-ai.onrender.com/health
echo    2. Frontend test:  https://main.d36ebthmdi6xdg.amplifyapp.com
echo    3. Try counselor assessment with AI recommendations
echo.
echo 🎯 Expected Results:
echo    ✅ No more "gemini-1.5-flash not found" errors
echo    ✅ Gemini AI provider works correctly
echo    ✅ Career recommendations generate successfully
echo    ✅ Logs show "Model Used: gemini-pro"
echo.
echo 📝 Environment Variables (verify in Render.com):
echo    AI_PROVIDER=gemini
echo    GEMINI_API_KEY=your-key-here
echo    USE_REAL_AI=true
echo.
echo 🏁 Deployment initiated! Check Render.com dashboard for progress.
echo.
pause