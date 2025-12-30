# 🔧 API 404 Errors - Troubleshooting Guide

## 🚨 Current Issue

Frontend is connecting to backend (CORS working), but getting 404 errors:
```
lantern-ai.onrender.com//api/sessions/start:1 Failed to load resource: 404
lantern-ai.onrender.com//api/counselor-assessment/questions:1 Failed to load resource: 404
lantern-ai.onrender.com//api/auth/register:1 Failed to load resource: 404
```

## 🔍 Root Cause Analysis

### **Issue 1: Double Slash in URLs** ⚠️
Notice the double slash: `lantern-ai.onrender.com//api/...`
- **Correct**: `lantern-ai.onrender.com/api/...`
- **Current**: `lantern-ai.onrender.com//api/...`

### **Issue 2: Backend Deployment Status** ⚠️
The backend might not have deployed with latest route changes.

## ✅ **Solutions**

### **Solution 1: Fix URL Construction**

Check frontend environment variable:
```bash
# Should be (no trailing slash):
NEXT_PUBLIC_API_URL=https://lantern-ai.onrender.com

# NOT (with trailing slash):
NEXT_PUBLIC_API_URL=https://lantern-ai.onrender.com/
```

### **Solution 2: Verify Backend Deployment**

1. **Check Render Dashboard**:
   - Go to render.com dashboard
   - Check if latest deployment succeeded
   - Look for build/deployment errors

2. **Test Backend Directly**:
   ```bash
   # Test these URLs in browser:
   https://lantern-ai.onrender.com/
   https://lantern-ai.onrender.com/health
   https://lantern-ai.onrender.com/api
   ```

3. **Test Specific Endpoints**:
   ```bash
   # These should work:
   https://lantern-ai.onrender.com/api/sessions/start (POST)
   https://lantern-ai.onrender.com/api/counselor-assessment/questions (GET)
   https://lantern-ai.onrender.com/api/auth/register (POST)
   ```

## 🔧 **Quick Fixes**

### **Fix 1: Update Environment Variable**

In `lantern-ai/frontend/.env.local`:
```bash
# Remove any trailing slash
NEXT_PUBLIC_API_URL=https://lantern-ai.onrender.com
```

### **Fix 2: Check AWS Amplify Environment**

In AWS Amplify Console → Environment Variables:
```
Key: NEXT_PUBLIC_API_URL
Value: https://lantern-ai.onrender.com (no trailing slash)
```

### **Fix 3: Force Backend Redeploy**

If backend hasn't deployed latest changes:
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete

## 🎯 **Verification Steps**

### **Step 1: Test Backend Health**
```bash
curl https://lantern-ai.onrender.com/health
```
Should return:
```json
{"status":"OK","message":"Lantern AI API is running"}
```

### **Step 2: Test API Endpoint**
```bash
curl https://lantern-ai.onrender.com/api
```
Should return API information with all endpoints listed.

### **Step 3: Test Specific Route**
```bash
curl https://lantern-ai.onrender.com/api/counselor-assessment/questions
```
Should return counselor questions data.

## 🚀 **Expected Resolution**

After fixes:
- ✅ **No double slashes** in API URLs
- ✅ **Backend routes responding** correctly
- ✅ **Frontend connecting** to all endpoints
- ✅ **Full functionality** restored

## 📊 **Route Verification**

These routes should be available:
- ✅ `POST /api/sessions/start`
- ✅ `GET /api/counselor-assessment/questions`
- ✅ `POST /api/auth/register`
- ✅ `POST /api/auth/login`
- ✅ `GET /api/assessment/questions`
- ✅ `POST /api/careers/recommendations`

## 🔍 **Debug Commands**

### **Check Frontend API URL**
In browser console on your frontend:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

### **Test API Call**
In browser console:
```javascript
fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## 🎉 **Next Steps**

1. **Check environment variables** for trailing slashes
2. **Verify backend deployment** completed successfully
3. **Test endpoints directly** in browser
4. **Check browser console** for specific error details

**The 404 errors should resolve once the URL construction and deployment issues are fixed!** 🚀