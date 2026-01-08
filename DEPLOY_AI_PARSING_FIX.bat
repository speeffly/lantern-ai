@echo off
echo ========================================
echo AI RESPONSE PARSING FIX
echo ========================================
echo.
echo This deployment fixes the AI response parsing issue where AI generates
echo career pathway content but it fails to parse correctly, causing fallback
echo to generic "Complete high school with strong grades" steps.
echo.
echo Changes made:
echo - Added extractCareerPathwayFromAI method with multiple extraction strategies
echo - Enhanced parseAIResponse to try career pathway extraction before fallback
echo - Added pattern matching for step-by-step content in AI responses
echo - Improved error handling to preserve AI-generated content when possible
echo - Added career-specific content extraction as backup strategy
echo.

cd /d "%~dp0"

echo 📦 Installing dependencies...
call npm install

echo.
echo 🧪 Testing AI parsing fix...
node debug-ai-parsing.js

echo.
echo 🚀 Deploying to Render...
git add .
git commit -m "Fix AI response parsing - extract career pathways even when JSON parsing fails"
git push origin main

echo.
echo ✅ AI Response Parsing Fix deployed!
echo.
echo The system will now:
echo - Try multiple strategies to extract career pathways from AI responses
echo - Preserve AI-generated content even when JSON is malformed
echo - Use pattern matching to find step-by-step career guidance
echo - Fall back gracefully while maintaining AI-generated insights
echo.
echo Expected Results:
echo - Fewer generic "Complete high school with strong grades" pathways
echo - More AI-generated specific career steps preserved
echo - Better extraction of career-specific guidance from AI responses
echo - Improved success rate of AI content parsing
echo.
echo Test the fix at: https://lantern-ai-frontend.vercel.app
echo.
pause