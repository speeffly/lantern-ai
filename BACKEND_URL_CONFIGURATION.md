# 🔧 Backend URL Configuration Guide

## 📍 Where to Specify Backend Server URL

### **1. Local Development** ✅
**File**: `lantern-ai/frontend/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_ENV=development
```

### **2. Production Deployment Options**

#### **Option A: AWS Amplify Environment Variables (Recommended)**

1. **Go to AWS Amplify Console**
2. **Select your app**: lantern-ai-frontend
3. **Go to Environment Variables**:
   - Navigate to: App settings → Environment variables
4. **Add Environment Variable**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-name.onrender.com`
5. **Redeploy**: Amplify will automatically rebuild with new variables

#### **Option B: Update .env.local and Push**

**Update the file**:
```bash
# lantern-ai/frontend/.env.local
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
NEXT_PUBLIC_ENV=production
```

**Then push to GitHub**:
```bash
git add .
git commit -m "Update: Production backend URL"
git push origin main
```

## 🚀 Step-by-Step Deployment Process

### **Step 1: Deploy Backend to Render**
1. **Push code to GitHub**
2. **Render auto-deploys** from GitHub
3. **Get backend URL**: `https://lantern-ai-backend.onrender.com`

### **Step 2: Update Frontend Configuration**

#### **Method 1: AWS Amplify Console (Recommended)**
```
AWS Amplify → Your App → Environment Variables → Add:
Key: NEXT_PUBLIC_API_URL
Value: https://lantern-ai-backend.onrender.com
```

#### **Method 2: Update .env.local**
```bash
# lantern-ai/frontend/.env.local
NEXT_PUBLIC_API_URL=https://lantern-ai-backend.onrender.com
NEXT_PUBLIC_ENV=production
```

### **Step 3: Verify Configuration**
The frontend will use the backend URL for:
- User authentication (`/api/auth/*`)
- Career assessments (`/api/assessment/*`)
- AI recommendations (`/api/careers/*`)
- Job listings (`/api/jobs/*`)
- Action plans (`/api/action-plans/*`)

## 🔍 How Frontend Uses Backend URL

### **API Service Pattern**
```typescript
// Frontend makes requests like:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessment/questions`);

// Which becomes:
// Development: http://localhost:3002/api/assessment/questions
// Production: https://lantern-ai-backend.onrender.com/api/assessment/questions
```

### **Environment Variable Access**
```typescript
// In any React component or service:
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const endpoint = `${apiUrl}/api/careers/recommendations`;
```

## 🎯 Current Status

### **Local Development** ✅
- ✅ **Backend**: `http://localhost:3002`
- ✅ **Frontend**: `http://localhost:3001`
- ✅ **Configuration**: `.env.local` set correctly

### **Production Deployment** 🚀
- ✅ **Frontend**: `https://main.d3k8x9y2z1m4n5.amplifyapp.com`
- 🔄 **Backend**: Ready for Render deployment
- ⏳ **Configuration**: Update after backend deployment

## 📝 Quick Commands

### **For Local Development**
```bash
# Backend
cd lantern-ai/backend
npm run dev  # Runs on http://localhost:3002

# Frontend  
cd lantern-ai/frontend
npm run dev  # Runs on http://localhost:3001
```

### **For Production Update**
```bash
# Option 1: Update environment file
echo "NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com" > lantern-ai/frontend/.env.local

# Option 2: Use AWS Amplify Console (Recommended)
# Go to AWS Console → Amplify → Environment Variables
```

## 🏆 Competition Ready

Once you deploy the backend and update the frontend URL:
- ✅ **Full-stack integration**: Frontend ↔ Backend communication
- ✅ **User authentication**: Login/register working
- ✅ **AI recommendations**: Career guidance functional
- ✅ **Multi-user system**: Students, counselors, parents
- ✅ **Database persistence**: User data saved

**Your Lantern AI platform will be fully functional for judge demonstrations!** 🚀