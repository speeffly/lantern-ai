@echo off
echo ========================================
echo PHOTOGRAPHER PERSONALIZATION FIX
echo ========================================
echo.
echo This deployment fixes the issue where photographers with technology interests
echo were getting IT Support Specialist recommendations instead of creative career guidance.
echo.
echo Changes made:
echo - Restructured action items logic to prioritize TOP CAREER SECTOR over interests
echo - Added comprehensive switch statement for all 15 sectors in action items
echo - Ensured photographers get creative portfolio and art competition recommendations
echo - Fixed skill gaps to prioritize career sector over mixed interests
echo - Added fallback logic only when no clear career match exists
echo.

cd /d "%~dp0"

echo 📦 Installing dependencies...
call npm install

echo.
echo 🧪 Testing photographer personalization fix locally...
node test-photographer-fix.js

echo.
echo 🚀 Deploying to Render...
git add .
git commit -m "Fix photographer personalization - prioritize career sector over interests in recommendations"
git push origin main

echo.
echo ✅ Photographer Personalization Fix deployed!
echo.
echo The system will now:
echo - Prioritize the student's TOP CAREER SECTOR in all recommendations
echo - Give photographers creative portfolio and art competition actions
echo - Provide sector-appropriate skill gaps regardless of mixed interests
echo - Only fall back to interest-based recommendations when no clear career match
echo.
echo Test the fix at: https://lantern-ai-frontend.vercel.app
echo.
pause