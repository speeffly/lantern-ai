# 🚀 Full Stack Deployment Guide - Frontend + Backend + Database

## 🎯 Complete Solution Overview

For the Presidential Innovation Challenge, we need:
- ✅ **Frontend**: Static site on AWS Amplify (already working)
- ✅ **Backend**: Node.js API server with database
- ✅ **Database**: SQLite database with all features
- ✅ **Integration**: Frontend connects to live backend API

## 🏗️ Architecture

```
Frontend (Amplify)     Backend (Railway/Render)     Database
https://amplify.app -> https://api.railway.app -> SQLite DB
     Static Site           Node.js + Express         Persistent Storage
```

## 🚀 Option 1: Railway Deployment (Recommended)

Railway is perfect for Node.js backends with databases.

### Step 1: Prepare Backend for Railway

```bash
cd lantern-ai/backend
```

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

### Step 2: Add Health Check Endpoint

Add to `backend/src/index.ts`:
```typescript
// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

### Step 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `lantern-ai/backend` folder
6. Railway will auto-deploy!

### Step 4: Get Your API URL

Railway will give you a URL like: `https://your-app.railway.app`

## 🚀 Option 2: Render Deployment (Alternative)

### Step 1: Create render.yaml

```yaml
services:
  - type: web
    name: lantern-ai-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Select repository and branch
5. Set build/start commands
6. Deploy!

## 🔧 Update Frontend Configuration

Once backend is deployed, update the frontend:

### Update Amplify Environment Variables

In AWS Amplify Console:
1. Go to App Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.railway.app`
   - `NEXT_PUBLIC_ENVIRONMENT` = `production`
   - `NEXT_PUBLIC_DEMO_MODE` = `false`

### Or Update next.config.js

```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://your-backend-url.railway.app',
    NEXT_PUBLIC_ENVIRONMENT: 'production',
    NEXT_PUBLIC_DEMO_MODE: 'false'
  }
}
```

## 📊 Database Setup

The SQLite database will work perfectly on Railway/Render:

### Features Included:
- ✅ User authentication (students, counselors, parents)
- ✅ Assessment storage and retrieval
- ✅ Career recommendations with AI
- ✅ Job listings integration
- ✅ Action plans and progress tracking
- ✅ Multi-user relationships
- ✅ Counselor guidance system

### Database Persistence:
- Railway: Automatic volume mounting
- Render: Persistent disk storage
- Data survives deployments and restarts

## 🎯 Complete Feature Set

### Frontend Features:
- Career assessment (quick & enhanced)
- User registration/login (3 user types)
- Career matching with AI recommendations
- Job listings within 40-mile radius
- Action plan generation and tracking
- Multi-user dashboards
- Profile management

### Backend Features:
- RESTful API with Express.js
- JWT authentication
- SQLite database with comprehensive schema
- OpenAI integration for AI recommendations
- Local job market analysis
- Course recommendation engine
- Counselor guidance system

### AI Features:
- Machine learning career matching
- Natural language processing for interests
- OpenAI GPT integration for personalized advice
- Local job market analysis
- 4-year academic planning
- Salary and location-based recommendations

## 🏆 Competition Benefits

This full-stack deployment provides:

### Technical Excellence:
- ✅ Modern tech stack (React, Node.js, TypeScript)
- ✅ Cloud deployment (AWS + Railway/Render)
- ✅ Database persistence
- ✅ API integration
- ✅ AI/ML features

### Real-World Impact:
- ✅ Serves rural students effectively
- ✅ Multi-stakeholder system (students, counselors, parents)
- ✅ Practical job search within geographic constraints
- ✅ Actionable career guidance
- ✅ Educational pathway planning

### Professional Presentation:
- ✅ Public URLs for judges to test
- ✅ Full functionality demonstration
- ✅ Scalable architecture
- ✅ Production-ready deployment

## 🚀 Quick Deploy Commands

### For Railway:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd lantern-ai/backend
railway deploy
```

### For Render:
```bash
# Just push to GitHub, Render auto-deploys
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## 📱 Final URLs

After deployment, you'll have:
- **Frontend**: https://main.d2ymtj6aumrj0m.amplifyapp.com/
- **Backend**: https://your-app.railway.app (or render.com)
- **Full Integration**: Frontend calls live backend API

## 🎉 Success Metrics

When working correctly:
- ✅ Users can register and login
- ✅ Assessments save to database
- ✅ Career recommendations use AI
- ✅ Job listings show real data
- ✅ All user types have functional dashboards
- ✅ Data persists between sessions

## 🏆 Competition Ready!

This deployment provides everything judges need to see:
- **Innovation**: AI-powered career guidance
- **Technical Skill**: Full-stack cloud deployment
- **Real Impact**: Addresses rural education challenges
- **Scalability**: Production-ready architecture
- **Usability**: Intuitive multi-user interface

Perfect for winning the Presidential Innovation Challenge! 🥇