@echo off
echo ========================================
echo DEPLOYING ENHANCED EXPLAINABILITY FIX
echo ========================================
echo.
echo This deployment includes:
echo - Enhanced "Why This Matches You" explainability with sector-specific explanations
echo - Detailed sector-based reasoning that references student interests and skills
echo - Personalized career descriptions that connect to student profile
echo - Sector-specific strengths, development areas, and next steps
echo - Improved fallback explanations when AI is not available
echo.

cd /d "%~dp0"

echo [1/4] Building backend with enhanced explainability...
cd backend
call npm run build
if errorlevel 1 (
    echo ❌ Backend build failed!
    pause
    exit /b 1
)

echo [2/4] Building frontend...
cd ../frontend
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build completed successfully!

echo [3/4] Restarting backend service...
cd ../backend
call pm2 restart lantern-backend
if errorlevel 1 (
    echo ⚠️ PM2 restart failed, trying to start fresh...
    call pm2 start ecosystem.config.js
)

echo [4/4] Testing enhanced explainability...
timeout /t 3 /nobreak > nul
curl -s http://localhost:3001/api/health > nul
if errorlevel 1 (
    echo ❌ Backend health check failed!
    echo Please check the backend logs: pm2 logs lantern-backend
    pause
    exit /b 1
)

echo.
echo ✅ ENHANCED EXPLAINABILITY DEPLOYMENT COMPLETE!
echo.
echo 🎯 New Features:
echo   - Sector-specific "Why This Matches You" explanations
echo   - Personalized career descriptions based on student interests
echo   - Detailed strengths analysis referencing student profile
echo   - Career-specific development areas and next steps
echo   - Enhanced fallback explanations when AI is unavailable
echo.
echo 📊 Testing Instructions:
echo   1. Complete the Enhanced Assessment
echo   2. Check "Why This Matches You" sections for each career
echo   3. Verify explanations reference specific interests and skills
echo   4. Confirm explanations are sector-appropriate and detailed
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause