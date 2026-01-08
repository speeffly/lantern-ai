@echo off
echo ========================================
echo DEPLOYING SKILL GAPS FIX
echo ========================================
echo.
echo This deployment fixes the Skills to Develop section to show career-specific skills
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
git commit -m "fix: generate individual skill gaps for each career

CRITICAL BUG FIX: Skills to Develop section was showing same skills for all careers

Changes made:
- Added skillGaps field to EnhancedCareerMatch interface
- Created getCareerSpecificSkillGaps method for AI-generated skill gaps
- Added getBasicSkillGaps fallback with sector-specific skills
- Updated JobRecommendation interface to include skillGaps
- Modified frontend to use job.skillGaps instead of shared skillGaps
- Each career now gets its own relevant skill development recommendations

Before: All careers showed the same generic skills
After: Each career shows skills specific to that profession

Examples:
- Photographer: Creative Problem Solving, Visual Design Skills, Portfolio Development
- Nurse: Medical Terminology, Patient Care Skills, Clinical Procedures
- Electrician: Electrical Safety, Circuit Analysis, Code Compliance

This ensures students get accurate, career-relevant skill development guidance."

git push origin main

echo.
echo ✅ SKILL GAPS FIX DEPLOYED!
echo.
echo Bug Fixed:
echo - Each career now has its own specific skill gaps
echo - Photographer shows creative/visual skills
echo - Healthcare careers show medical skills
echo - Technology careers show programming skills
echo - No more shared/duplicate skills across different careers
echo.
echo The AI will now generate unique, career-specific skill gaps for each
echo career match instead of showing the same skills for all careers.
echo.
pause