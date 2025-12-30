# 🚀 Render Deployment - Simple & Reliable

## Why Render?
- ✅ **Easier Setup**: No complex configuration needed
- ✅ **Free Tier**: Perfect for competition
- ✅ **Auto-Deploy**: Connects directly to GitHub
- ✅ **Database Support**: Built-in persistent storage
- ✅ **Reliable**: Better for Node.js apps

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Repository
```bash
cd lantern-ai
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Deploy on Render
1. **Go to [render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Create New Web Service**
4. **Connect Repository**: Select your GitHub repo
5. **Configure Service**:
   - **Name**: `lantern-ai-backend`
   - **Environment**: `Node`
   - **Region**: `US East (Ohio)` (closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Environment Variables
Add these in Render dashboard:
- `NODE_ENV` = `production`
- `PORT` = `10000` (Render default)
- `OPENAI_API_KEY` = `your-openai-key` (optional)

### Step 4: Deploy!
- Click "Create Web Service"
- Render will build and deploy automatically
- Get your URL: `https://lantern-ai-backend.onrender.com`

## 🔧 Update Frontend

### Option A: Amplify Environment Variables
1. AWS Amplify Console → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-render-url.onrender.com`
3. Redeploy frontend

### Option B: Update Code Directly
```javascript
// lantern-ai/frontend/next.config.js
env: {
  NEXT_PUBLIC_API_URL: 'https://lantern-ai-backend.onrender.com',
  NEXT_PUBLIC_ENVIRONMENT: 'production',
  NEXT_PUBLIC_DEMO_MODE: 'false'
}
```

## ✅ Verification

Test these endpoints:
- **Health Check**: https://your-app.onrender.com/health
- **API Info**: https://your-app.onrender.com/api
- **Frontend**: https://main.d2ymtj6aumrj0m.amplifyapp.com/

## 🎉 Complete System

After deployment:
- ✅ **Frontend**: Static site on AWS Amplify
- ✅ **Backend**: Node.js API on Render
- ✅ **Database**: SQLite with persistent storage
- ✅ **Integration**: Frontend connects to backend API

## 🏆 Competition Ready!

Your full-stack application will have:
- **Public URLs** for judges to test
- **Complete functionality** with database
- **AI-powered features** working
- **Professional deployment** on cloud platforms

Perfect for the Presidential Innovation Challenge! 🥇