@echo off
echo ========================================
echo DEPLOYING AI PERSONALIZATION FIX
echo ========================================
echo.
echo This deployment fixes the issue where AI recommendations
echo were returning generic advice instead of personalized
echo recommendations based on student interests and career matches.
echo.
echo Key improvements:
echo - Enhanced AI context with mandatory personalization requirements
echo - Interest-specific course recommendations (Healthcare, Hands-on, Tech)
echo - Personalized career pathways and action items
echo - Improved fallback recommendations when AI is unavailable
echo - 15+ new personalization helper methods
echo.

cd /d "%~dp0"

echo Step 1: Testing AI personalization locally...
node test-ai-personalization.js
if %ERRORLEVEL% neq 0 (
    echo ❌ AI personalization test failed
    echo Please check the test results above
    pause
    exit /b 1
)

echo.
echo Step 2: Building backend with new AI service...
cd backend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)

echo.
echo Step 3: Building frontend...
cd ../frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo.
echo Step 4: Deploying to production...
cd ..
git add .
git commit -m "Fix: Implement personalized AI recommendations

Major improvements to AI recommendation system:

PERSONALIZATION ENHANCEMENTS:
- Enhanced AI context with mandatory personalization requirements
- Added 15+ helper methods for interest-specific recommendations
- Implemented user-specific context generation and reasoning
- Added career-specific explanations for every recommendation

INTEREST-SPECIFIC RECOMMENDATIONS:
- Healthcare: Biology, Chemistry, Health Sciences + hospital volunteering
- Hands-on Work: Shop, Industrial Arts, Geometry + apprenticeships  
- Technology: Computer Science, Programming + coding projects
- Community Impact: Social Studies, Leadership + volunteer opportunities

FALLBACK IMPROVEMENTS:
- Personalized fallback recommendations when AI unavailable
- Interest-based course selection and career pathway generation
- Targeted skill gaps and action items for each career field
- Grade-appropriate timeline and education advice

TECHNICAL IMPLEMENTATION:
- Enhanced aiRecommendationService.ts with personalization logic
- Added test endpoint for AI recommendation validation
- Improved prompt engineering with specific personalization requirements
- Quality metrics for measuring recommendation relevance

EXPECTED RESULTS:
- Students with different interests receive different recommendations
- All advice references student's specific career matches and interests
- Actionable course names and activities instead of generic suggestions
- Clear explanations of WHY each recommendation fits the student

This fixes the major issue where all students were receiving
identical generic recommendations regardless of their assessment results."

git push origin main

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo The AI personalization fix has been deployed. Key improvements:
echo.
echo 🎯 PERSONALIZED RECOMMENDATIONS:
echo    - Healthcare students get Biology, Chemistry, hospital volunteering
echo    - Hands-on students get Shop class, apprenticeship opportunities  
echo    - Tech students get Computer Science, programming projects
echo    - All students get career-specific pathways and explanations
echo.
echo 🔧 TECHNICAL IMPROVEMENTS:
echo    - Enhanced AI context with mandatory personalization
echo    - 15+ new helper methods for interest-specific advice
echo    - Improved fallback recommendations when AI unavailable
echo    - Quality metrics for measuring recommendation relevance
echo.
echo 📊 MONITORING RECOMMENDATIONS:
echo    - Check Render logs for AI personalization quality
echo    - Monitor user feedback on recommendation relevance
echo    - Test with different student profiles to verify personalization
echo    - Use test endpoint: /api/test/ai-recommendations for validation
echo.
echo Production URLs:
echo - Frontend: https://main.d36ebthmdi6xdg.amplifyapp.com
echo - Backend: https://lantern-ai.onrender.com
echo - Test AI: https://lantern-ai.onrender.com/api/test/ai-recommendations
echo.
pause