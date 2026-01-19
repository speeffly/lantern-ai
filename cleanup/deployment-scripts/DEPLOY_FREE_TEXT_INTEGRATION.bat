@echo off
echo ========================================
echo DEPLOYING FREE TEXT INTEGRATION FIX
echo ========================================
echo.
echo This deployment adds proper free text input handling to AI prompts
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
echo Step 2: Deploying to Render...
git add .
git commit -m "feat: integrate user free text inputs into AI prompts

- Enhanced interpretAssessmentAnswer to properly handle free text responses
- Added extractFreeTextResponses method to extract and format detailed user inputs
- Updated AI prompts to emphasize using student's own words and experiences
- Added dedicated section for free text responses in AI context
- Enhanced personalization requirements to reference specific user inputs
- Improved both OpenAI and Gemini prompts to utilize free text data

This ensures AI recommendations are based on the rich, detailed information
users provide about their interests, experiences, values, and aspirations,
rather than just multiple-choice selections."

git push origin main

echo.
echo ✅ FREE TEXT INTEGRATION DEPLOYED!
echo.
echo Changes made:
echo - Enhanced AI prompt preparation to include user free text responses
echo - Added proper handling for detailed interest descriptions
echo - Integrated work/volunteer experience into recommendations
echo - Included user values and inspirations in AI context
echo - Enhanced personalization based on user's own words
echo.
echo The AI will now use the rich, detailed information users provide
echo in free text fields to create much more personalized recommendations.
echo.
pause