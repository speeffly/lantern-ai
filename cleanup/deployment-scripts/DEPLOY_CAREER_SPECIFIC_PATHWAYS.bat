@echo off
echo ========================================
echo DEPLOYING CAREER-SPECIFIC PATHWAYS FIX
echo ========================================
echo.
echo This deployment fixes the bug where all careers showed the same AI pathway
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
git commit -m "fix: generate individual AI career pathways for each career

CRITICAL BUG FIX: AI career pathways were being shared across all careers

Changes made:
- Enhanced CareerMatchingService to generate individual career pathways
- Added careerPathway field to EnhancedCareerMatch interface
- Created getCareerSpecificPathway method for career-specific AI pathways
- Added getBasicCareerPathway fallback for each career
- Updated frontend to use job.careerPathway instead of shared pathway
- Each career now gets its own personalized AI-generated pathway

Before: All careers showed the same generic pathway
After: Each career (Photographer, Nurse, etc.) has its own specific pathway

This ensures that:
- Photographer pathway focuses on portfolio, creative skills, photography education
- Nurse pathway focuses on healthcare education, medical certifications, patient care
- Each career gets relevant, specific steps instead of generic advice"

git push origin main

echo.
echo ✅ CAREER-SPECIFIC PATHWAYS DEPLOYED!
echo.
echo Bug Fixed:
echo - Each career now has its own AI-generated pathway
echo - Photographer pathway will be specific to photography career
echo - Nurse pathway will be specific to nursing career
echo - No more shared/duplicate pathways across different careers
echo.
echo The AI will now generate unique, career-specific pathways for each
echo career match instead of showing the same pathway for all careers.
echo.
pause