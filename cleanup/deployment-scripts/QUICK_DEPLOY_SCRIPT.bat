@echo off
echo 🚀 Lantern AI - Quick AWS Deployment (No Git Required)
echo ================================================

echo.
echo 📋 Prerequisites Check:
echo - AWS CLI installed and configured
echo - Node.js 18+ installed
echo - OpenAI API key ready
echo.

pause

echo.
echo 🔧 Setting up environment variables...
set /p OPENAI_API_KEY="Enter your OpenAI API key: "
set /p JWT_SECRET="Enter JWT secret (or press Enter for auto-generated): "

if "%JWT_SECRET%"=="" (
    echo Generating JWT secret...
    set JWT_SECRET=lantern-ai-jwt-secret-2024-competition-ready
)

echo.
echo 📦 Installing Serverless Framework...
npm install -g serverless

echo.
echo 🏗️ Building Backend...
cd backend
npm install
npm run build

echo.
echo 🚀 Deploying Backend to AWS Lambda...
serverless deploy

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend deployment failed!
    pause
    exit /b 1
)

echo.
echo ✅ Backend deployed successfully!
echo.
echo 📝 Please copy the API Gateway URL from above and update frontend/.env.production
echo Example: https://abc123.execute-api.us-east-1.amazonaws.com/dev
echo.

pause

echo.
echo 🏗️ Building Frontend...
cd ..\frontend
npm install
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Frontend built successfully!
echo.
echo 📤 Frontend deployment options:
echo 1. Drag frontend\.next folder to https://app.netlify.com/drop
echo 2. Or run: npx vercel --prod
echo 3. Or upload to AWS S3 for static hosting
echo.

echo 🎉 Deployment Complete!
echo.
echo 📋 Next Steps:
echo 1. Update frontend/.env.production with your API Gateway URL
echo 2. Deploy frontend using one of the options above
echo 3. Test your application
echo 4. Share the public URL for the competition
echo.

pause