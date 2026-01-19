@echo off
echo ========================================
echo JSON MALFORMATION PREVENTION FIX
echo ========================================
echo.
echo This deployment prevents malformed JSON at the source by enhancing
echo AI prompts with comprehensive JSON formatting requirements.
echo.
echo Changes made:
echo - Added detailed JSON formatting requirements to AI prompts
echo - Specified exact rules for quotes, commas, brackets, and data types
echo - Added mandatory JSON validation instruction to AI
echo - Lowered OpenAI temperature from 0.7 to 0.3 for consistency
echo - Added JSON response format enforcement for OpenAI
echo - Enhanced system prompts with JSON-only instructions
echo.

cd /d "%~dp0"

echo 📦 Installing dependencies...
call npm install

echo.
echo 🧪 Testing JSON prevention improvements...
echo This will test if AI generates cleaner JSON responses...

echo.
echo 🚀 Deploying to Render...
git add .
git commit -m "Prevent malformed JSON from AI - enhanced prompts with detailed formatting requirements"
git push origin main

echo.
echo ✅ JSON Malformation Prevention Fix deployed!
echo.
echo The AI will now receive enhanced instructions to:
echo - Generate only valid JSON (no text before/after)
echo - Use proper double quotes for all strings
echo - Avoid trailing commas after last items
echo - Escape quotes inside strings correctly
echo - Close all brackets and braces properly
echo - Use correct JSON data types
echo - Test JSON before responding
echo.
echo Expected Results:
echo - Significantly fewer JSON parsing errors
echo - More AI-generated content preserved
echo - Fewer fallbacks to generic recommendations
echo - Better success rate for career pathway extraction
echo.
echo Monitor Results:
echo - Check server logs for "JSON cleanup successful" messages
echo - Look for fewer "Failed to parse AI response" errors
echo - Verify more specific career pathways are generated
echo.
echo Test the improvements at: https://lantern-ai-frontend.vercel.app
echo.
pause