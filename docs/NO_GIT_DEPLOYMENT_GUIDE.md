# 🚀 AWS Deployment Without Git - Lantern AI

## Multiple Options for Deploying Without Git Repository

### 🎯 Option 1: Direct Lambda Deployment (Serverless Framework)

This is the **fastest and easiest** method without Git.

#### Step 1: Install Serverless Framework
```bash
npm install -g serverless
```

#### Step 2: Deploy Backend Directly
```bash
cd lantern-ai/backend
npm install
npm run build

# Set environment variables
set OPENAI_API_KEY=your-openai-key-here
set JWT_SECRET=your-jwt-secret-here

# Deploy directly to AWS
serverless deploy
```

**Result**: Your backend will be deployed to AWS Lambda with an API Gateway URL.

#### Step 3: Deploy Frontend to Netlify/Vercel (No Git Required)

**Option A: Netlify Drop**
1. Build your frontend:
```bash
cd lantern-ai/frontend
npm install
npm run build
```
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop your `frontend/.next` folder
4. Get instant public URL

**Option B: Vercel CLI**
```bash
npm install -g vercel
cd lantern-ai/frontend
vercel --prod
```

---

### 🎯 Option 2: AWS EC2 with Direct Upload

#### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2
2. Launch Ubuntu 22.04 instance (t3.small)
3. Configure security groups (HTTP, HTTPS, SSH)
4. Download key pair

#### Step 2: Upload Your Code
```bash
# Create a zip file of your project
# (You can do this manually or with 7-zip on Windows)

# Upload to EC2 using SCP
scp -i your-key.pem lantern-ai.zip ubuntu@your-ec2-ip:~/

# SSH into server
ssh -i your-key.pem ubuntu@your-ec2-ip

# Extract and setup
unzip lantern-ai.zip
cd lantern-ai
```

#### Step 3: Run Setup Script
```bash
# Make script executable and run
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

---

### 🎯 Option 3: AWS S3 + CloudFront (Static Hosting)

Perfect for frontend-only deployment.

#### Step 1: Build Frontend
```bash
cd lantern-ai/frontend
npm install
npm run build
npm run export  # Creates static files
```

#### Step 2: Upload to S3
1. Go to AWS S3 Console
2. Create new bucket (e.g., `lantern-ai-frontend`)
3. Upload all files from `frontend/out` folder
4. Enable static website hosting
5. Set index.html as index document

#### Step 3: Setup CloudFront (Optional)
1. Create CloudFront distribution
2. Point to your S3 bucket
3. Get CloudFront URL

---

### 🎯 Option 4: ZIP File Upload Methods

#### For Lambda (Backend):
```bash
cd lantern-ai/backend
npm install
npm run build

# Create deployment package
# Include: dist/, node_modules/, package.json
# Zip these files manually

# Upload via AWS Console:
# 1. Go to Lambda Console
# 2. Create new function
# 3. Upload zip file
# 4. Set handler to dist/lambda.handler
```

#### For Elastic Beanstalk (Full Stack):
```bash
# Create application zip
# Include: backend/, frontend/, package.json

# Upload via Elastic Beanstalk Console:
# 1. Create new application
# 2. Upload zip file
# 3. Deploy
```

---

### 🎯 Option 5: Manual File Transfer

#### Using AWS CLI (No Git Required):
```bash
# Install AWS CLI
# Configure with: aws configure

# Sync files to S3
aws s3 sync lantern-ai/frontend/out s3://your-bucket-name --delete

# Update Lambda function
cd lantern-ai/backend
npm run build
zip -r function.zip dist/ node_modules/ package.json
aws lambda update-function-code --function-name lantern-ai-backend --zip-file fileb://function.zip
```

---

## 🚀 Recommended: Serverless + Netlify Drop

**This is the fastest method without Git:**

### Step 1: Deploy Backend (5 minutes)
```bash
cd lantern-ai/backend
npm install -g serverless
npm install
npm run build
set OPENAI_API_KEY=your-key
set JWT_SECRET=your-secret
serverless deploy
```

### Step 2: Update Frontend Config
Update `lantern-ai/frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_ENVIRONMENT=production
```

### Step 3: Deploy Frontend (2 minutes)
```bash
cd lantern-ai/frontend
npm install
npm run build
```

Then drag `frontend/.next` folder to [Netlify Drop](https://app.netlify.com/drop)

**Total Time: ~10 minutes**
**Cost: ~$0-5/month**
**Result: Fully functional public application**

---

## 🔧 Environment Setup (No Git)

### Create Required Files Manually:

#### Backend Environment (.env):
```env
NODE_ENV=production
PORT=3002
OPENAI_API_KEY=your-openai-key
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-netlify-url.netlify.app
```

#### Frontend Environment (.env.production):
```env
NEXT_PUBLIC_API_URL=https://your-lambda-url.amazonaws.com/dev
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## 📦 Alternative Hosting Platforms (No Git)

### 1. Railway
- Upload zip file directly
- Automatic deployment
- Free tier available

### 2. Render
- Direct file upload
- Auto-scaling
- Free SSL

### 3. DigitalOcean App Platform
- Zip file deployment
- Managed hosting
- Simple setup

### 4. Heroku
- Git not required for CLI deployment
- `heroku create` and `heroku deploy`

---

## 🎯 Quick Start Commands (Copy & Paste)

### Windows PowerShell:
```powershell
# Navigate to project
cd lantern-ai

# Install dependencies
cd backend
npm install -g serverless
npm install

# Build project
npm run build

# Set environment variables
$env:OPENAI_API_KEY="your-openai-key"
$env:JWT_SECRET="your-jwt-secret"

# Deploy to AWS
serverless deploy

# Build frontend
cd ../frontend
npm install
npm run build
```

### Command Prompt:
```cmd
cd lantern-ai\backend
npm install -g serverless
npm install
npm run build
set OPENAI_API_KEY=your-openai-key
set JWT_SECRET=your-jwt-secret
serverless deploy

cd ..\frontend
npm install
npm run build
```

---

## 🚨 Troubleshooting Without Git

### Common Issues:

1. **Missing Dependencies**:
   - Run `npm install` in both backend and frontend
   - Check package.json files exist

2. **Environment Variables**:
   - Set them in your terminal session
   - Or create .env files manually

3. **Build Errors**:
   - Clear node_modules: `rm -rf node_modules`
   - Reinstall: `npm install`

4. **AWS Permissions**:
   - Ensure AWS CLI is configured
   - Check IAM permissions

### File Structure Check:
```
lantern-ai/
├── backend/
│   ├── src/
│   ├── dist/ (after build)
│   ├── package.json
│   ├── serverless.yml
│   └── .env
├── frontend/
│   ├── app/
│   ├── .next/ (after build)
│   ├── package.json
│   └── .env.production
└── README.md
```

---

## ✅ Success Checklist

- [ ] Backend deployed to Lambda
- [ ] API Gateway URL obtained
- [ ] Frontend built successfully
- [ ] Frontend deployed to hosting platform
- [ ] Environment variables configured
- [ ] Application accessible publicly
- [ ] All features working
- [ ] HTTPS enabled

**Your application will be live and ready for the Presidential Innovation Challenge!** 🏆

No Git required - just direct deployment to AWS and hosting platforms.