@echo off
echo 🚀 Deploying Backend to Railway...
echo.

cd /d "%~dp0"

echo ✅ Installing Railway CLI (if not installed)...
npm list -g @railway/cli >nul 2>&1 || npm install -g @railway/cli

echo ✅ Adding all changes...
git add .

echo ✅ Committing changes...
git commit -m "Prepare backend for Railway deployment"

echo ✅ Pushing to GitHub...
git push origin main

echo.
echo 🚂 Now deploy to Railway:
echo.
echo 1. Go to https://railway.app
echo 2. Sign up/login with GitHub
echo 3. Click "New Project" → "Deploy from GitHub repo"
echo 4. Select your repository
echo 5. Choose the "backend" folder as root directory
echo 6. Railway will auto-deploy!
echo.
echo 📝 After deployment:
echo 1. Copy your Railway app URL (e.g., https://your-app.railway.app)
echo 2. Go to AWS Amplify Console
echo 3. Add Environment Variable: NEXT_PUBLIC_API_URL = your-railway-url
echo 4. Redeploy frontend
echo.
echo 🎉 Your full-stack app will be live!
echo.
pause