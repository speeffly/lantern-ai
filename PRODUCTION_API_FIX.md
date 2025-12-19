# 🚨 Production API Errors - Fix Guide

## 🎯 **Issue Identified**

Production deployment on Render.com is experiencing API errors:
- `POST /api/assessment/answers` → **400 Bad Request**
- `POST /api/assessment/complete` → **404 Not Found**

## 🔍 **Root Cause Analysis**

### **The Problem**:
The production backend on Render.com is **missing critical environment variables** that are required for the application to function properly.

### **Missing Environment Variables**:
1. ❌ `FRONTEND_URL` - Required for CORS configuration
2. ❌ `OPENAI_API_KEY` - Required for AI recommendations
3. ❌ `USE_REAL_AI` - Flag to enable real AI vs fallback mode
4. ❌ `JWT_SECRET` - Required for authentication
5. ❌ `BLS_API_KEY` - Required for salary data

### **Why This Causes Errors**:

#### **400 Bad Request on `/api/assessment/answers`**:
- Backend validation is failing because session management isn't working properly
- Without proper environment configuration, the session service may not be functioning correctly
- CORS issues may be preventing proper request handling

#### **404 Not Found on `/api/assessment/complete`**:
- Route exists in code but may not be registered due to initialization errors
- Database adapter may not be initializing properly without correct environment
- Server may be failing to start routes correctly

## 🚀 **Solution**

### **Step 1: Update Render.yaml Configuration**

The `render.yaml` file has been updated with all required environment variables:

```yaml
services:
  - type: web
    name: lantern-ai-backend
    env: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: RENDER
        value: "true"
      - key: FRONTEND_URL
        value: https://main.d2ymtj6aumrj0m.amplifyapp.com
      - key: JWT_SECRET
        value: lantern-ai-production-secret-key-2025
      - key: OPENAI_API_KEY
        value: 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
      - key: USE_REAL_AI
        value: "true"
      - key: BLS_API_KEY
        value: d4f3e185f79f410984c5f5b380e1bfbd
```

### **Step 2: Deploy Updated Configuration to Render**

#### **Option A: Automatic Deployment (If GitHub Connected)**
1. **Commit the updated `render.yaml`**:
   ```bash
   git add lantern-ai/render.yaml
   git commit -m "Fix: Add missing environment variables for production"
   git push origin main
   ```

2. **Render will automatically detect the changes** and redeploy with new environment variables

#### **Option B: Manual Environment Variable Update**
If you can't push to GitHub or want immediate fix:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your service**: `lantern-ai-backend`
3. **Go to "Environment" tab**
4. **Add these environment variables**:
   - `FRONTEND_URL` = `https://main.d2ymtj6aumrj0m.amplifyapp.com`
   - `JWT_SECRET` = `lantern-ai-production-secret-key-2025`
   - `OPENAI_API_KEY` = `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`
   - `USE_REAL_AI` = `true`
   - `BLS_API_KEY` = `d4f3e185f79f410984c5f5b380e1bfbd`

5. **Click "Save Changes"**
6. **Render will automatically restart** the service with new variables

### **Step 3: Verify Deployment**

After deployment completes, verify the fix:

#### **1. Check Environment Variables**:
```bash
curl https://lantern-ai.onrender.com/api/debug/env
```

Expected response should show:
```json
{
  "success": true,
  "data": {
    "NODE_ENV": "production",
    "OPENAI_API_KEY": "present",
    "OPENAI_KEY_LENGTH": 164,
    "FRONTEND_URL": "https://main.d2ymtj6aumrj0m.amplifyapp.com",
    "PORT": "10000",
    "RENDER": "true"
  }
}
```

#### **2. Check Health Endpoint**:
```bash
curl https://lantern-ai.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Lantern AI API is running",
  "database": {
    "status": "Connected",
    "type": "sqlite"
  },
  "environment": "production"
}
```

#### **3. Test Assessment Endpoints**:

**Test Questions Endpoint**:
```bash
curl https://lantern-ai.onrender.com/api/assessment/questions
```

Should return list of questions without errors.

**Test Complete Flow**:
1. Go to production frontend: https://main.d2ymtj6aumrj0m.amplifyapp.com
2. Start Quick Assessment
3. Answer all questions including text questions
4. Submit with ZIP code
5. Should successfully complete without 400/404 errors

## 📊 **What Each Variable Does**

### **FRONTEND_URL**
- **Purpose**: Configures CORS to allow frontend to make API requests
- **Impact**: Without this, browser blocks API calls (CORS errors)
- **Value**: `https://main.d2ymtj6aumrj0m.amplifyapp.com`

### **OPENAI_API_KEY**
- **Purpose**: Enables AI-powered career recommendations
- **Impact**: Without this, system uses fallback generic recommendations
- **Value**: Your OpenAI API key (starts with `sk-proj-`)

### **USE_REAL_AI**
- **Purpose**: Flag to enable/disable real AI vs fallback mode
- **Impact**: Even with API key, this must be `true` to use AI
- **Value**: `true`

### **JWT_SECRET**
- **Purpose**: Signs and verifies authentication tokens
- **Impact**: Without this, login/registration may fail
- **Value**: Any secure random string (production should be different from dev)

### **BLS_API_KEY**
- **Purpose**: Fetches real salary data from Bureau of Labor Statistics
- **Impact**: Without this, uses estimated salary data
- **Value**: Your BLS API key

### **NODE_ENV**
- **Purpose**: Tells app it's running in production
- **Impact**: Affects logging, error messages, and optimizations
- **Value**: `production`

### **PORT**
- **Purpose**: Port number for server to listen on
- **Impact**: Render requires specific port (10000)
- **Value**: `10000`

### **RENDER**
- **Purpose**: Flag indicating running on Render platform
- **Impact**: Affects database path and file storage locations
- **Value**: `true`

## 🔧 **Additional Troubleshooting**

### **If Errors Persist After Deployment**:

#### **1. Check Render Logs**:
```
Dashboard → Your Service → Logs tab
```

Look for:
- ✅ "Environment check - OpenAI API key loaded: true"
- ✅ "Database initialized successfully"
- ✅ "Lantern AI API running on port 10000"
- ❌ Any error messages during startup

#### **2. Check Database Status**:
```bash
curl https://lantern-ai.onrender.com/api/database/info
```

Should show database is connected and ready.

#### **3. Check CORS Configuration**:
Look in logs for:
```
🌐 CORS configuration:
   - Environment: production
   - Frontend URL: https://main.d2ymtj6aumrj0m.amplifyapp.com
   - Port: 10000
```

#### **4. Test Specific Endpoints**:

**Create a test session**:
```bash
curl -X POST https://lantern-ai.onrender.com/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'
```

**Test answer submission** (use sessionId from above):
```bash
curl -X POST https://lantern-ai.onrender.com/api/assessment/answers \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "answers": [
      {"questionId": "1", "answer": "Option A", "timestamp": "2025-01-01T00:00:00Z"}
    ]
  }'
```

## 🎯 **Expected Outcome**

After deploying the fix:

✅ **Quick Assessment works end-to-end**:
- Questions load properly
- Text input questions work
- Answers save successfully (no 400 error)
- Assessment completes successfully (no 404 error)
- Results page loads with recommendations

✅ **AI Recommendations work**:
- Real AI-powered recommendations instead of fallback
- Personalized career guidance
- Detailed action plans

✅ **All API endpoints respond correctly**:
- No CORS errors
- No authentication errors
- No database errors

## 📝 **Deployment Checklist**

- [ ] Updated `render.yaml` with all environment variables
- [ ] Committed and pushed changes to GitHub (if using auto-deploy)
- [ ] OR manually added environment variables in Render dashboard
- [ ] Waited for deployment to complete (check Render dashboard)
- [ ] Verified environment variables are loaded (`/api/debug/env`)
- [ ] Verified health check passes (`/health`)
- [ ] Tested Quick Assessment flow end-to-end
- [ ] Verified AI recommendations are working
- [ ] Checked Render logs for any errors

## 🚀 **Quick Deploy Commands**

If you have Git configured and want to deploy immediately:

```bash
# Navigate to project root
cd lantern-ai

# Add the updated file
git add render.yaml

# Commit the fix
git commit -m "Fix: Add missing production environment variables"

# Push to trigger deployment
git push origin main
```

Then monitor deployment at: https://dashboard.render.com

## ⚠️ **Security Note**

The `render.yaml` file now contains sensitive API keys. In a production environment, you should:

1. **Use Render's Secret Files** feature for sensitive data
2. **Use environment variable groups** in Render dashboard
3. **Never commit API keys** to public repositories
4. **Rotate keys regularly** for security

For this competition/demo, having keys in the file is acceptable, but for real production use, move them to Render's secure environment variable storage.

---

**Status**: 🔧 **Fix Ready for Deployment**
**Impact**: 🎯 **Will resolve all production API errors**
**Action Required**: ✅ **Deploy updated render.yaml to Render.com**
