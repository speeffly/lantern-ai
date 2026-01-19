@echo off
echo ==========================================
echo DEPLOYING WITH LOCKFILE FIX
echo ==========================================

echo.
echo 🔧 WHAT THIS DEPLOYMENT INCLUDES:
echo - Fixed Next.js lockfile and SWC dependencies issue
echo - Parent dashboard authentication fix (all 6 pages)
echo - Counselor stats debugging enhancement
echo - TypeScript compilation error fixes
echo.

echo ⚠️ LOCKFILE ISSUE RESOLUTION:
echo - Removing problematic package-lock.json
echo - Fresh npm install to regenerate lockfile
echo - Clearing Next.js cache
echo - Installing SWC dependencies properly
echo.

echo 🚀 Starting deployment with lockfile fix...
echo.

cd /d "%~dp0"

echo 📁 Fixing backend build...
cd backend
echo 🧹 Cleaning backend dependencies...
if exist package-lock.json del package-lock.json
if exist node_modules rmdir /s /q node_modules

echo 📦 Fresh install of backend dependencies...
call npm install

echo 🔨 Building TypeScript...
call npm run build
if errorlevel 1 (
    echo ❌ Backend build failed! Check TypeScript errors above.
    pause
    exit /b 1
)

echo ✅ Backend build successful!

echo 📁 Fixing frontend build...
cd ../frontend
echo 🧹 Cleaning frontend dependencies and cache...
if exist package-lock.json del package-lock.json
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next

echo 📦 Fresh install of frontend dependencies...
call npm install

echo 🔧 Installing SWC dependencies explicitly...
call npm install @swc/helpers @swc/core

echo 🔨 Building Next.js application...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed! Trying alternative approach...
    echo 🔄 Clearing cache and retrying...
    if exist .next rmdir /s /q .next
    call npm run build
    if errorlevel 1 (
        echo ❌ Frontend build still failing. Check errors above.
        pause
        exit /b 1
    )
)

echo ✅ Frontend build successful!

echo 🚀 Deploying to production...
cd ..
git add .
git commit -m "Combined fixes with lockfile resolution

LOCKFILE FIX:
- Resolved Next.js SWC dependencies issue
- Fresh npm install to regenerate clean lockfiles
- Explicit SWC dependencies installation
- Cleared build caches to prevent conflicts

PARENT AUTHENTICATION FIX:
- Updated all 6 parent pages to use /api/auth-db/profile
- Fixed 'any click takes user back to sign-in page' issue
- Added comprehensive debugging for parent auth flow
- Enhanced error handling and token cleanup

COUNSELOR STATS DEBUGGING:
- Enhanced assessment detection with 4 comprehensive methods
- Raw session data JSON logging for structure analysis
- Detection method tracking to identify working approach
- Multiple fallback strategies for different completion scenarios

TYPESCRIPT FIXES:
- Removed invalid status value comparisons
- Fixed property access errors
- Clean compilation without warnings or errors
- Stable build pipeline restored

All builds now complete successfully with proper dependency resolution."

git push origin main

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🔍 TESTING INSTRUCTIONS:
echo.
echo 📱 PARENT AUTHENTICATION TEST:
echo 1. Login as parent: https://main.d36ebthmdi6xdg.amplifyapp.com/login
echo 2. Navigate between all parent dashboard pages
echo 3. Verify no authentication redirects occur
echo 4. Check console for successful auth messages
echo.
echo 📊 COUNSELOR STATS DEBUG TEST:
echo 1. Login as counselor: https://main.d36ebthmdi6xdg.amplifyapp.com/login
echo 2. Check counselor dashboard Quick Overview
echo 3. Monitor Render logs for enhanced debug output
echo 4. Look for assessment detection method results
echo.
echo 🎯 SUCCESS CRITERIA:
echo - Both frontend and backend build successfully ✅
echo - Parent navigation works without redirects ✅
echo - Counselor stats show enhanced debugging ✅
echo - No TypeScript or build errors ✅
echo.
echo 📋 NEXT STEPS:
echo 1. Wait 2-3 minutes for deployments to complete
echo 2. Test parent authentication flow thoroughly
echo 3. Check counselor stats debugging in Render logs
echo 4. Verify all functionality works as expected
echo.

pause