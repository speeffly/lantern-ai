@echo off
echo ========================================
echo DEPLOYING POSTGRESQL SCHEMA CONSTRAINT FIX
echo ========================================
echo.

echo 🐘 ISSUE: PostgreSQL constraint violation on counselor_notes table
echo 🎯 Fix: Enhanced PostgreSQL-specific constraint handling and validation
echo.

echo 📝 CHANGES MADE:
echo - Updated PostgreSQL schema to create constraint separately
echo - Added comprehensive note_type validation with whitespace handling
echo - Enhanced error handling for PostgreSQL constraint violations
echo - Fixed boolean value handling (true/false instead of 1/0)
echo - Added trimming for all string values to prevent whitespace issues
echo - Improved constraint error messages with PostgreSQL-specific details
echo.

echo 📁 Current directory: %CD%
echo 📁 Backend directory: %CD%\backend
echo.

cd backend

echo 🔧 Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo 📦 Building TypeScript...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ Backend build completed successfully!
echo.
echo 🌐 Pushing to GitHub (triggers Render deployment)...
git add .
git commit -m "Fix PostgreSQL constraint violation for counselor_notes

- Update PostgreSQL schema to create constraint separately with error handling
- Add comprehensive note_type validation with whitespace trimming
- Fix boolean value handling for PostgreSQL (true/false vs 1/0)
- Enhanced error messages for PostgreSQL constraint violations
- Add validation for hidden characters and encoding issues
- Improve constraint creation with DO block and exception handling
- PostgreSQL-specific fixes for counselor notes functionality"

git push origin main

echo.
echo ========================================
echo ✅ POSTGRESQL CONSTRAINT FIX DEPLOYED!
echo ========================================
echo.
echo 🔗 Backend URL: https://lantern-ai.onrender.com
echo 🔗 Frontend URL: https://main.d36ebthmdi6xdg.amplifyapp.com
echo.
echo 📋 TESTING CHECKLIST:
echo ✓ Wait for Render deployment to complete (~2-3 minutes)
echo ✓ Login as counselor and navigate to student detail page
echo ✓ Verify page loads without constraint errors
echo ✓ Try creating a note with 'general' note_type
echo ✓ Check Render logs for any constraint-related errors
echo ✓ Verify note creation works with all valid note_type values
echo.
echo 🎯 EXPECTED RESULTS:
echo - Student detail page loads successfully
echo - No PostgreSQL constraint violation errors
echo - Note creation works with proper validation
echo - Clear error messages for any validation failures
echo - Proper handling of whitespace and encoding issues
echo.

echo 📝 POSTGRESQL-SPECIFIC FIXES:
echo - Constraint created separately with DO block
echo - Boolean values use true/false (PostgreSQL standard)
echo - String trimming prevents whitespace constraint violations
echo - Enhanced validation catches issues before database operations
echo - Proper error handling for PostgreSQL constraint messages
echo.

echo 🧪 VALIDATION IMPROVEMENTS:
echo - Checks for non-empty string values
echo - Trims whitespace from all string inputs
echo - Validates exact match against allowed values
echo - Detects hidden characters or encoding issues
echo - Provides detailed error messages for debugging
echo.

echo ⚠️ IF CONSTRAINT ERRORS PERSIST:
echo 1. Check Render logs for detailed PostgreSQL error messages
echo 2. Run fix-postgres-constraint.sql manually if needed
echo 3. Verify database schema matches application expectations
echo 4. Check for any existing invalid data in counselor_notes table
echo.
pause