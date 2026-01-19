@echo off
echo ========================================
echo DEPLOYING HOSPITALITY SKILLS FIX
echo ========================================
echo.
echo This deployment fixes Cook/Chef showing creative skills instead of culinary skills
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
git commit -m "fix: add proper skill gaps for hospitality and all other sectors

SECTOR SKILLS BUG FIX: Cook/Chef was showing creative skills instead of culinary skills

Changes made:
- Added hospitality sector case to getBasicSkillGaps method
- Added proper culinary skills for Cook/Chef careers:
  * Culinary Skills (cooking techniques, knife skills)
  * Food Safety & Sanitation (ServSafe certification)
  * Kitchen Management (inventory, time management)
- Added skill gaps for all missing sectors:
  * business/finance: Financial Analysis, Business Communication
  * education: Teaching Methods, Student Assessment
  * public-service: Public Safety Protocols, Community Relations
  * science: Research Methods, Laboratory Skills
  * agriculture: Agricultural Knowledge, Equipment Operation
  * transportation: Transportation Regulations, Vehicle Operation
  * retail: Customer Service, Product Knowledge
  * legal: Legal Research, Legal Analysis

Before: Cook/Chef showed Creative Problem Solving, Visual Design Skills
After: Cook/Chef shows Culinary Skills, Food Safety & Sanitation, Kitchen Management

This ensures all careers get sector-appropriate skill recommendations."

git push origin main

echo.
echo ✅ HOSPITALITY SKILLS FIX DEPLOYED!
echo.
echo Bug Fixed:
echo - Cook/Chef now shows proper culinary skills
echo - All sectors now have appropriate skill gaps
echo - No more creative skills for hospitality careers
echo - Each sector gets relevant, professional skills
echo.
echo Cook/Chef will now show:
echo - Culinary Skills (cooking techniques, knife skills)
echo - Food Safety & Sanitation (ServSafe certification)
echo - Kitchen Management (inventory, cost control)
echo.
pause