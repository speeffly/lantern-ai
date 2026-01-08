@echo off
echo ========================================
echo DEPLOYING TYPESCRIPT FIX
echo ========================================
echo.
echo This deployment fixes the TypeScript error for careerPathway property
echo.

echo Step 1: Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Building backend...
cd ../backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying to Render...
cd ..
git add .
git commit -m "fix: add careerPathway property to frontend JobRecommendation interface

TYPESCRIPT ERROR FIX: Property 'careerPathway' does not exist on type 'JobRecommendation'

Changes made:
- Added careerPathway property to frontend JobRecommendation interface
- Added careerPathway property to backend JobRecommendation interface
- Frontend can now access job.careerPathway without TypeScript errors

This resolves the build error and allows the frontend to display
individual career pathways for each career match."

git push origin main

echo.
echo ✅ TYPESCRIPT FIX DEPLOYED!
echo.
echo TypeScript Error Fixed:
echo - Frontend JobRecommendation interface now includes careerPathway
echo - Backend JobRecommendation interface now includes careerPathway
echo - Build should complete successfully
echo - Each career can display its own pathway
echo.
pause