@echo off
echo 🚀 Deploying to Render - Simple & Reliable!
echo.

cd /d "%~dp0"

echo ✅ Adding all changes...
git add .

echo ✅ Committing changes...
git commit -m "Deploy backend to Render with full configuration"

echo ✅ Pushing to GitHub...
git push origin main

echo.
echo 🎯 Now deploy on Render:
echo.
echo 1. Go to https://render.com
echo 2. Sign up/login with GitHub
echo 3. Click "New +" → "Web Service"
echo 4. Connect your GitHub repository
echo 5. Configure:
echo    - Name: lantern-ai-backend
echo    - Environment: Node
echo    - Root Directory: backend
echo    - Build Command: npm install ^&^& npm run build
echo    - Start Command: npm start
echo 6. Click "Create Web Service"
echo.
echo ⏱️ Render will build and deploy automatically (2-3 minutes)
echo.
echo 📝 After deployment:
echo 1. Copy your Render URL (e.g., https://lantern-ai-backend.onrender.com)
echo 2. Go to AWS Amplify Console
echo 3. Environment Variables → Add:
echo    NEXT_PUBLIC_API_URL = your-render-url
echo    NEXT_PUBLIC_DEMO_MODE = false
echo 4. Redeploy frontend
echo.
echo 🎉 Your full-stack app will be live!
echo.
echo 📱 Test URLs:
echo Frontend: https://main.d2ymtj6aumrj0m.amplifyapp.com/
echo Backend: https://your-app.onrender.com/health
echo.
pause