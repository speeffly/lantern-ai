@echo off
echo ========================================
echo DEPLOYING FINAL ASSESSMENT V3
echo ========================================

echo.
echo 1. Testing V3 structure...
node test-v3-structure.js
if %ERRORLEVEL% neq 0 (
    echo ERROR: V3 structure validation failed
    pause
    exit /b 1
)

echo.
echo 2. Building backend...
cd backend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Backend build failed
    pause
    exit /b 1
)

echo.
echo 3. Building frontend...
cd ../frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)

echo.
echo 4. Restarting backend service...
cd ../backend
pm2 restart lantern-backend || pm2 start ecosystem.config.js

echo.
echo ========================================
echo FINAL ASSESSMENT V3 DEPLOYMENT COMPLETE
echo ========================================
echo.
echo ✅ V3 hierarchical branching implemented
echo ✅ Hard Hat / Non Hard Hat / Unable to decide paths
echo ✅ Enhanced career matching logic
echo ✅ Streamlined question flow
echo ✅ Assessment summary integration
echo.
echo The new assessment features:
echo - Hierarchical work preference selection
echo - 8-10 focused questions per path
echo - Enhanced career matching accuracy
echo - Better user experience with nested options
echo.
pause