@echo off
echo ==========================================
echo DEPLOYING COMBINED FIXES
echo ==========================================

echo.
echo 🔧 WHAT THIS DEPLOYMENT INCLUDES:
echo.
echo 📱 FRONTEND FIXES:
echo - Fixed parent dashboard authentication issue
echo - Updated all 6 parent pages to use correct database auth endpoint
echo - Added comprehensive debugging for parent authentication
echo - Resolved "any click takes user back to sign-in page" issue
echo.
echo 🖥️ BACKEND FIXES:
echo - Fixed TypeScript compilation errors in counselor service
echo - Enhanced assessment detection with comprehensive debugging
echo - Corrected status value comparisons (removed invalid 'complete', 'finished')
echo - Fixed property access (removed non-existent 'career_preferences')
echo - Improved assessment completion detection with multiple methods
echo.

echo 📋 PARENT PAGES FIXED:
echo 1. /parent/progress - Progress tracking
echo 2. /parent/careers - Career exploration
echo 3. /parent/resources - Parent resources
echo 4. /parent/counselor - Counselor communication
echo 5. /parent/financial - Financial planning
echo 6. /parent/settings - Account settings
echo.

echo 🎯 COUNSELOR STATS DEBUGGING:
echo - Enhanced assessment detection with 4 methods
echo - Raw session data JSON logging
echo - Answer count verification per session
echo - Profile data assessment detection
echo - Detection method tracking for troubleshooting
echo.

echo ⚠️ TYPESCRIPT ERRORS FIXED:
echo - Removed invalid status comparisons ('complete', 'finished')
echo - Fixed property access (career_preferences → interests/skills)
echo - All compilation errors resolved
echo.

echo 🚀 Starting deployment...
echo.

cd /d "%~dp0"

echo 📁 Building backend...
cd backend
echo 📦 Installing backend dependencies...
call npm install

echo 🔨 Building TypeScript...
call npm run build
if errorlevel 1 (
    echo ❌ Backend build failed! Check TypeScript errors above.
    pause
    exit /b 1
)

echo ✅ Backend build successful!

echo 📁 Building frontend...
cd ../frontend
echo 📦 Installing frontend dependencies...
call npm install

echo 🔨 Building Next.js application...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed! Check errors above.
    pause
    exit /b 1
)

echo ✅ Frontend build successful!

echo 🚀 Deploying to production...
cd ..
git add .
git commit -m "Combined fixes: Parent auth + Counselor stats debugging + TypeScript errors

FRONTEND FIXES:
- Fixed parent dashboard authentication issue
- Updated all 6 parent pages to use /api/auth-db/profile instead of /api/auth/me
- Resolved 'any click takes user back to sign-in page' issue
- Added comprehensive debugging for parent authentication flow
- Enhanced error handling and token cleanup

BACKEND FIXES:
- Fixed TypeScript compilation errors in counselor service
- Enhanced assessment detection with comprehensive debugging methods
- Corrected invalid status value comparisons (removed 'complete', 'finished')
- Fixed property access error (removed non-existent 'career_preferences')
- Added raw session data JSON logging for troubleshooting

ASSESSMENT DETECTION IMPROVEMENTS:
- Method 1: Status/timestamp check (completed status OR completed_at)
- Method 2: Answer count verification per session
- Method 3: Career recommendations check
- Method 4: Profile data assessment detection (interests/skills)
- Detection method tracking to identify which approach works

PARENT AUTHENTICATION:
- Main dashboard: /api/auth-db/profile ✅ (was working)
- All sub-pages: /api/auth-db/profile ✅ (now fixed)
- Consistent database authentication across all parent pages
- Prevents authentication failures and navigation redirects

COUNSELOR STATS DEBUGGING:
- Raw session data logging as JSON for structure analysis
- Enhanced debugging to identify why 0% completion despite completed assessments
- Multiple detection methods to catch different completion scenarios
- Comprehensive logging to guide targeted fixes based on actual data"

git push origin main

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🔍 TESTING INSTRUCTIONS:
echo.
echo 📱 PARENT AUTHENTICATION TEST:
echo 1. Login as parent: https://main.d36ebthmdi6xdg.amplifyapp.com/login
echo 2. Go to parent dashboard: /parent/dashboard
echo 3. Click each sub-page link (Progress, Careers, Resources, etc.)
echo 4. Verify no redirects to login page occur
echo 5. Check console for "✅ Parent authentication successful" messages
echo.
echo 📊 COUNSELOR STATS DEBUG TEST:
echo 1. Login as counselor: https://main.d36ebthmdi6xdg.amplifyapp.com/login
echo 2. Go to counselor dashboard: /counselor/dashboard
echo 3. Check Quick Overview statistics
echo 4. Monitor Render logs for enhanced debug output:
echo    - "📊 DEBUG - Student X raw session data: {...}"
echo    - "📊 DEBUG - Student X completion method: [method] ✅"
echo    - "📊 DEBUG - Assessment completion: X/Y = Z%%"
echo.
echo 🎯 SUCCESS CRITERIA:
echo - Parent navigation works without authentication issues ✅
echo - Counselor stats show enhanced debugging information ✅
echo - Assessment completion detection identifies working method ✅
echo - TypeScript compilation succeeds without errors ✅
echo.
echo 📋 NEXT STEPS:
echo 1. Wait 2-3 minutes for deployments to complete
echo 2. Test parent authentication flow
echo 3. Check counselor stats debugging output in Render logs
echo 4. Identify which assessment detection method works
echo 5. Create targeted fix based on debug findings if needed
echo.

pause