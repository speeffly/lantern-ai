@echo off
echo ========================================
echo DEPLOYING COUNSELOR CONSTRAINT FIX
echo ========================================
echo.

echo 🔍 ISSUE: counselor_notes constraint violation causing "Error Loading Student"
echo 🎯 Fix: Added comprehensive validation and error handling
echo.

echo 📝 CHANGES MADE:
echo - Added note_type validation against allowed values
echo - Added user existence and role validation
echo - Enhanced error handling in getCounselorNotesForStudent
echo - Added debugging for constraint violations
echo - Improved foreign key validation
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
git commit -m "Fix counselor notes constraint violation

- Add comprehensive validation for note_type values
- Validate user existence and roles before database operations
- Enhanced error handling in getCounselorNotesForStudent method
- Add debugging for constraint violations
- Prevent foreign key constraint errors
- Fix 'Error Loading Student' issue on counselor student detail page"

git push origin main

echo.
echo ========================================
echo ✅ CONSTRAINT FIX DEPLOYED!
echo ========================================
echo.
echo 🔗 Backend URL: https://lantern-ai.onrender.com
echo 🔗 Frontend URL: https://main.d36ebthmdi6xdg.amplifyapp.com
echo.
echo 📋 TESTING CHECKLIST:
echo ✓ Wait for Render deployment to complete (~2-3 minutes)
echo ✓ Login as counselor
echo ✓ Navigate to student management page
echo ✓ Click on a student to view details
echo ✓ Verify "Error Loading Student" is resolved
echo ✓ Try creating a new note with valid note_type
echo ✓ Check Render logs for any remaining constraint errors
echo.
echo 🎯 EXPECTED RESULTS:
echo - Student detail page loads without constraint errors
echo - Notes section displays properly (empty or with existing notes)
echo - Note creation works with valid note_type values
echo - Clear error messages for any validation failures
echo.
echo 📝 VALIDATION ADDED:
echo - note_type must be: general, career_guidance, academic, personal, parent_communication
echo - student_id must exist and have role 'student'
echo - counselor_id must exist and have role 'counselor'
echo - Proper error handling for missing foreign key references
echo.
pause