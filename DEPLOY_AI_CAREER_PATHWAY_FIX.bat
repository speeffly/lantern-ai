@echo off
echo ========================================
echo AI CAREER PATHWAY PERSONALIZATION FIX
echo ========================================
echo.
echo This deployment fixes the AI-generated career pathways to be specific and personalized
echo instead of generic "Step 1", "Step 2" content.
echo.
echo Changes made:
echo - Enhanced AI prompt templates with specific career pathway requirements
echo - Added mandatory placeholder replacement instructions
echo - Improved career pathway context with examples
echo - Added comprehensive validation for personalized content
echo.

cd /d "%~dp0"

echo 📦 Installing dependencies...
call npm install

echo.
echo 🧪 Testing AI career pathway personalization locally...
node test-ai-career-pathway-fix.js

echo.
echo 🚀 Deploying to Render...
git add .
git commit -m "Fix AI career pathway personalization - replace generic steps with specific career guidance"
git push origin main

echo.
echo ✅ AI Career Pathway Personalization Fix deployed!
echo.
echo The AI will now generate:
echo - Specific career pathway steps (not generic "Step 1", "Step 2")
echo - Career-specific education requirements
echo - Actual certification names
echo - Realistic timelines based on education level
echo - Actionable, measurable steps
echo.
echo Test the fix at: https://lantern-ai-frontend.vercel.app
echo.
pause