@echo off
echo ========================================
echo COMPLETE AI PERSONALIZATION FIX
echo ========================================
echo.
echo This deployment includes ALL AI personalization fixes:
echo 1. AI Career Pathway Personalization Fix (generic "Step 1" to specific steps)
echo 2. Photographer Personalization Fix (prioritize career sector over interests)
echo 3. Enhanced AI Prompt Templates with mandatory replacement instructions
echo 4. Comprehensive fallback recommendations for all 15 sectors
echo.
echo Changes made:
echo - Enhanced AI prompt templates with specific career pathway requirements
echo - Added mandatory placeholder replacement instructions for AI
echo - Restructured action items logic to prioritize TOP CAREER SECTOR
echo - Fixed skill gaps to align with career sector, not mixed interests
echo - Added comprehensive switch statements for all 15 sectors
echo - Improved career pathway context with concrete examples
echo.

cd /d "%~dp0"

echo 📦 Installing dependencies...
call npm install

echo.
echo 🧪 Testing AI personalization fixes...
echo.
echo Testing AI Career Pathway Fix...
node test-ai-career-pathway-fix.js
echo.
echo Testing Photographer Personalization Fix...
node test-photographer-fix.js
echo.
echo Testing Real AI with Photographer Profile...
node test-real-ai-photographer.js

echo.
echo 🚀 Deploying to Render...
git add .
git commit -m "Complete AI personalization fix - career pathways, photographer recommendations, and sector prioritization"
git push origin main

echo.
echo ✅ Complete AI Personalization Fix deployed!
echo.
echo The system now provides:
echo.
echo 🎯 CAREER PATHWAY IMPROVEMENTS:
echo - Specific career pathway steps instead of generic "Step 1", "Step 2"
echo - Career-specific education requirements and certifications
echo - Realistic timelines based on actual education levels
echo - Actionable, measurable steps with concrete next actions
echo.
echo 📸 PHOTOGRAPHER PERSONALIZATION:
echo - Creative portfolio and art competition recommendations
echo - Visual design and artistic skill development
echo - Photography-specific career guidance
echo - No inappropriate IT/programming recommendations
echo.
echo 🤖 AI PROMPT ENHANCEMENTS:
echo - Mandatory replacement of placeholder text
echo - Comprehensive career pathway examples
echo - Sector-specific guidance for all 15 career sectors
echo - Enhanced context with student-specific information
echo.
echo 🔄 FALLBACK IMPROVEMENTS:
echo - Comprehensive sector coverage in fallback recommendations
echo - Career sector prioritization over mixed interests
echo - Specific action items for each of the 15 sectors
echo - Appropriate skill gaps based on career matches
echo.
echo Test the complete fix at: https://lantern-ai-frontend.vercel.app
echo.
echo Expected Results:
echo - Photographers get creative career guidance
echo - AI generates specific career pathways (not generic steps)
echo - All 15 sectors have appropriate recommendations
echo - Mixed interests don't override career sector priorities
echo.
pause