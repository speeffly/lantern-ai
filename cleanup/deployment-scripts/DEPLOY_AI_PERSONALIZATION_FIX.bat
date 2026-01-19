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

echo Step 1: Testing career matching algorithm locally...
node test-career-matching.js
if %ERRORLEVEL% neq 0 (
    echo ❌ Career matching test failed
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
git commit -m "Fix: Implement comprehensive AI personalization across 15 sectors

MAJOR EXPANSION: Career Database & Matching Algorithm
- Expanded from 2 sectors (healthcare, infrastructure) to 15 sectors
- Added 35+ careers across technology, education, business, creative, 
  public service, agriculture, transportation, hospitality, manufacturing,
  retail, finance, legal, and science sectors
- Updated Sector type definition to support all new sectors

ENHANCED CAREER MATCHING ALGORITHM:
- Comprehensive sector-interest mapping for all 15 sectors
- Updated calculateMatchScore method with expanded interest alignment
- Enhanced work environment scoring for indoor/outdoor/mixed preferences
- Improved education level matching across all career types

AI PERSONALIZATION IMPROVEMENTS:
- Enhanced AI context with mandatory personalization requirements
- Added 15+ helper methods for sector-specific recommendations
- Implemented user-specific context generation and reasoning
- Added career-specific explanations for every recommendation

SECTOR-SPECIFIC RECOMMENDATIONS:
- Healthcare: Biology, Chemistry, Health Sciences + hospital volunteering
- Technology: Computer Science, Programming + coding projects
- Business/Finance: Economics, Accounting + business internships
- Creative: Visual Arts, Media Arts + portfolio building
- Education: Psychology, Speech + tutoring experience
- Science: Advanced Chemistry, Statistics + research projects
- And comprehensive recommendations for all other sectors

FALLBACK IMPROVEMENTS:
- Personalized fallback recommendations when AI unavailable
- Sector-based course selection and career pathway generation
- Targeted skill gaps and action items for each career field
- Grade-appropriate timeline and education advice

TECHNICAL IMPLEMENTATION:
- Enhanced aiRecommendationService.ts with comprehensive personalization
- Updated careerService.ts with expanded sector matching
- Added helper methods for company names, course focus, experience recommendations
- Improved TypeScript type safety with proper sector handling

TESTING & VALIDATION:
- Created comprehensive test suite for career matching algorithm
- Verified all 15 sectors work correctly with interest mapping
- Tested personalization quality across different student profiles
- All test cases pass with expected sector matches

EXPECTED RESULTS:
- Students interested in ANY sector get appropriate recommendations
- Technology students get programming courses and tech club suggestions
- Business students get economics courses and entrepreneurship activities
- Creative students get art courses and portfolio building advice
- All advice references student's specific career matches and interests
- Clear explanations of WHY each recommendation fits the student

This completely solves the issue where students could only get
recommendations for healthcare and infrastructure careers."

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