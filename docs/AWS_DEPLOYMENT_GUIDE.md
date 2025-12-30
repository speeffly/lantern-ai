# AWS Deployment Guide - Lantern AI

## 🚀 Complete AWS Deployment for Presidential Innovation Challenge

This guide provides multiple deployment options for hosting Lantern AI on AWS, suitable for competition requirements with public accessibility.

## 📋 Prerequisites

### Required AWS Services
- **AWS Account** with billing enabled
- **AWS CLI** installed and configured
- **Node.js 18+** and **npm** installed locally
- **Git** for version control

### AWS CLI Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-windows-x86_64.msi" -o "AWSCLIV2.msi"
msiexec /i AWSCLIV2.msi

# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key  
# Enter your default region (e.g., us-east-1)
# Enter output format: json
```

## 🎯 Deployment Option 1: AWS Amplify (Recommended for Competition)

### Why Amplify?
- **Fastest Setup**: Deploy in minutes
- **Automatic HTTPS**: SSL certificates included
- **Global CDN**: Fast worldwide access
- **Git Integration**: Auto-deploy on code changes
- **Cost-Effective**: Pay only for usage

### Step 1: Prepare Frontend for Deployment

Create production environment file:
```bash
# In lantern-ai/frontend/
cp .env.local.example .env.production
```

Update `lantern-ai/frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.amazonaws.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### Step 2: Deploy Backend to AWS Lambda

Create `lantern-ai/backend/serverless.yml`:
```yaml
service: lantern-ai-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}
    JWT_SECRET: ${env:JWT_SECRET}

functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-offline
```

Create Lambda handler `lantern-ai/backend/src/lambda.ts`:
```typescript
import serverless from 'serverless-http';
import app from './index';

export const handler = serverless(app);
```

Install serverless:
```bash
cd lantern-ai/backend
npm install -g serverless
npm install serverless-http serverless-offline
```

Deploy backend:
```bash
# Set environment variables
export OPENAI_API_KEY="your-openai-key"
export JWT_SECRET="your-jwt-secret"

# Build and deploy
npm run build
serverless deploy
```

### Step 3: Deploy Frontend to Amplify

1. **Push to GitHub**:
```bash
cd lantern-ai
git add .
git commit -m "Prepare for AWS deployment"
git push origin main
```

2. **AWS Amplify Console**:
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select `lantern-ai` repository and `main` branch

3. **Build Settings**:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

4. **Environment Variables** (in Amplify Console):
   - `NEXT_PUBLIC_API_URL`: Your Lambda API Gateway URL
   - `NEXT_PUBLIC_ENVIRONMENT`: `production`

## 🎯 Deployment Option 2: AWS EC2 (Full Control)

### Step 1: Launch EC2 Instance

1. **AWS Console** → EC2 → Launch Instance
2. **AMI**: Ubuntu Server 22.04 LTS
3. **Instance Type**: t3.small (sufficient for demo)
4. **Security Group**: Allow HTTP (80), HTTPS (443), SSH (22)
5. **Key Pair**: Create or use existing

### Step 2: Setup Server

SSH into your instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

Install dependencies:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

### Step 3: Deploy Application

Clone and setup:
```bash
# Clone repository
git clone https://github.com/your-username/lantern-ai.git
cd lantern-ai

# Setup backend
cd backend
npm install
npm run build

# Setup frontend
cd ../frontend
npm install
npm run build

# Create production environment
cp .env.local.example .env.production
# Edit with your production values
```

### Step 4: Configure PM2

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'lantern-backend',
      script: 'dist/index.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        OPENAI_API_KEY: 'your-key',
        JWT_SECRET: 'your-secret'
      }
    },
    {
      name: 'lantern-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

Start applications:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/lantern-ai`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/lantern-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 💰 Cost Estimation

### Amplify + Lambda (Recommended)
- **Amplify**: ~$1-5/month for small traffic
- **Lambda**: ~$0-10/month (generous free tier)
- **API Gateway**: ~$1-5/month
- **Total**: ~$2-20/month

### EC2 Option
- **t3.small**: ~$15/month
- **Data Transfer**: ~$1-5/month
- **Total**: ~$16-20/month

## 🚀 Quick Deployment Commands

### For Amplify (Fastest):
```bash
# 1. Push to GitHub
git add . && git commit -m "Deploy to AWS" && git push

# 2. Deploy backend
cd backend
npm install -g serverless
npm run build
serverless deploy

# 3. Connect GitHub to Amplify Console
# 4. Update environment variables
# 5. Deploy automatically
```

## 🔧 Environment Variables for Production

### Backend (.env):
```env
NODE_ENV=production
PORT=3002
OPENAI_API_KEY=your-openai-key
JWT_SECRET=your-strong-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_URL=sqlite:./data/lantern.db
```

### Frontend (.env.production):
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🎯 Competition-Ready Checklist

- [ ] **Public URL**: Accessible from anywhere
- [ ] **HTTPS**: SSL certificate configured
- [ ] **Custom Domain**: Professional appearance
- [ ] **Performance**: Fast loading times
- [ ] **Monitoring**: Error tracking setup
- [ ] **Backup**: Database backup strategy
- [ ] **Documentation**: Deployment guide complete
- [ ] **Demo Data**: Sample users and assessments
- [ ] **Mobile Responsive**: Works on all devices

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Update backend CORS settings
   - Check environment variables

2. **Database Issues**:
   - Ensure SQLite file permissions
   - Check database initialization

3. **API Connection**:
   - Verify NEXT_PUBLIC_API_URL
   - Check security group settings

4. **Build Failures**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

## 🎉 Final Steps

1. **Test Deployment**: Verify all features work
2. **Performance Check**: Test loading speeds
3. **Mobile Testing**: Ensure responsive design
4. **Demo Preparation**: Create sample data
5. **Documentation**: Update README with live URL
6. **Backup**: Export important data
7. **Monitor**: Set up alerts for issues

Your Lantern AI application will be publicly accessible and ready for the Presidential Innovation Challenge judging!