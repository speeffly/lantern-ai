@echo off
echo ================================================================================
echo 🚀 DEPLOYING ZIP CODE VALIDATION
echo ================================================================================
echo.
echo This deployment adds comprehensive ZIP code validation to ensure only valid
echo 5-digit ZIP codes are accepted throughout the application.
echo.
echo Changes:
echo - ✅ Backend validation in counselor assessment endpoint
echo - ✅ Backend validation in user profile creation/update
echo - ✅ Frontend validation in counselor assessment form
echo - ✅ Frontend validation in jobs search page
echo - ✅ Enhanced error messages for invalid ZIP codes
echo - ✅ Real-time input filtering (digits only, max 5 characters)
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
echo 🧪 Testing ZIP code validation...
call node test-zipcode-validation.js

echo.
echo 🚀 Deploying to Render...
git add .
git commit -m "Add comprehensive ZIP code validation

- Added backend validation for 5-digit ZIP codes in counselor assessment
- Added backend validation in user profile creation and updates
- Added frontend real-time input filtering (digits only, max 5 chars)
- Added frontend validation in counselor assessment form
- Added frontend validation in jobs search page
- Enhanced error messages for invalid ZIP codes
- Prevents letters, spaces, and incorrect lengths
- Ensures consistent ZIP code format across the application"

git push origin main

echo.
echo ================================================================================
echo ✅ DEPLOYMENT COMPLETE - ZIP CODE VALIDATION
echo ================================================================================
echo.
echo ZIP Code Validation Features:
echo - 📝 Only accepts 5-digit numbers (e.g., 12345)
echo - 🚫 Rejects letters, spaces, and wrong lengths
echo - ⚡ Real-time input filtering in forms
echo - 🔍 Backend validation with clear error messages
echo - 🎯 Applied to all ZIP code inputs across the app
echo.
echo Validation Rules:
echo - Must be exactly 5 digits
echo - No letters or special characters allowed
echo - No spaces or dashes allowed
echo - Real-time filtering prevents invalid input
echo.
echo Error Message:
echo "ZIP code must be exactly 5 digits (e.g., 12345)"
echo.
echo ================================================================================
pause