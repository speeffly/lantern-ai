@echo off
echo ========================================
echo DEPLOYING CAREER PATHWAY TYPE FIX
echo ========================================
echo.
echo This deployment fixes the TypeScript error for careerPathway property
echo.

echo Step 1: Building backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Building frontend...
cd ../frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying to Render...
cd ..
git add .
git commit -m "fix: add careerPathway property to JobRecommendation interface

TYPESCRIPT ERROR FIX: Property 'careerPathway' does not exist on type 'JobRecommendation'

Changes made:
- Added careerPathway property to JobRecommendation interface
- Updated CounselorGuidanceService to use enhanced career matches
- Added generateJobRecommendationsFromEnhanced method
- Imported CareerMatchingService for enhanced matches
- Each JobRecommendation now includes individual career pathway

This fixes the TypeScript error and ensures each career gets its own
specific AI-generated pathway instead of sharing the same pathway."

git push origin main

echo.
echo ✅ CAREER PATHWAY TYPE FIX DEPLOYED!
echo.
echo TypeScript Error Fixed:
echo - JobRecommendation interface now includes careerPathway property
echo - Frontend can access job.careerPathway without TypeScript errors
echo - Each career will have its own individual pathway
echo.
pause