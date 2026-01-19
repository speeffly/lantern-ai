@echo off
echo ================================================================================
echo 🚀 DEPLOYING USER DATA ISOLATION FIX
echo ================================================================================
echo.
echo This deployment fixes the user data isolation issue where assessment data
echo was persisting across login/logout cycles and leaking between users.
echo.
echo Changes:
echo - ✅ User-specific localStorage keys for assessment data
echo - ✅ Proper data isolation between logged-in users
echo - ✅ Anonymous user data separation from logged-in users
echo - ✅ Automatic cleanup of old non-user-specific data
echo - ✅ Enhanced security checks for data access
echo - ✅ Proper logout data cleanup
echo.
echo ================================================================================

cd backend

echo 📦 Installing dependencies...
call npm install

echo 🔧 Compiling TypeScript...
call npx tsc
if %errorlevel% neq 0 (
    echo ❌ Build failed: TypeScript compilation error
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 🚀 Deploying to Render...
git add .
git commit -m "Fix user data isolation for assessment storage

- Implemented user-specific localStorage keys for assessment data
- Fixed data leakage between anonymous and logged-in users
- Added proper data isolation between different logged-in users
- Enhanced security checks to verify data ownership
- Automatic cleanup of old non-user-specific data
- Proper logout cleanup to remove user-specific data
- Migration support for existing data to user-specific keys
- Added comprehensive user isolation testing

Key improvements:
- counselorAssessmentAnswers_user_email@domain.com format
- counselorAssessmentResults_user_email@domain.com format
- counselorAssessmentAnswers_anonymous for anonymous users
- Prevents cross-user data contamination
- Maintains backward compatibility with migration"

git push origin main

echo.
echo ================================================================================
echo ✅ DEPLOYMENT COMPLETE - USER DATA ISOLATION FIX
echo ================================================================================
echo.
echo User Data Isolation Features:
echo - 🔐 User-specific storage keys prevent data leakage
echo - 👤 Separate storage for each logged-in user (by email)
echo - 🕶️ Anonymous user data isolated from logged-in users
echo - 🧹 Automatic cleanup on login/logout
echo - 🔄 Migration support for existing data
echo - 🛡️ Enhanced security checks for data access
echo.
echo Storage Key Format:
echo - Logged-in users: "counselorAssessmentResults_user_john@example.com"
echo - Anonymous users: "counselorAssessmentResults_anonymous"
echo - Old format automatically migrated and cleaned up
echo.
echo Security Benefits:
echo - No data leakage between users
echo - Anonymous data doesn't persist after login
echo - Each user only sees their own assessment results
echo - Proper data cleanup on logout
echo.
echo Testing:
echo - Open frontend/test-user-isolation.html to test isolation
echo - Verify different users can't see each other's data
echo - Confirm anonymous data doesn't leak to logged-in users
echo.
echo ================================================================================
pause