@echo off
echo 🚀 Deploying Final Amplify Fix...
echo.

cd /d "%~dp0"

echo ✅ Adding all changes...
git add .

echo ✅ Committing changes...
git commit -m "FINAL FIX: Remove deprecated next export command and add Suspense boundaries"

echo ✅ Pushing to GitHub...
git push origin main

echo.
echo 🎉 Deployment complete!
echo.
echo 📱 Your site will be available at:
echo https://main.d2ymtj6aumrj0m.amplifyapp.com/
echo.
echo ⏱️ Build will take 2-3 minutes. Check Amplify Console for progress.
echo.
pause