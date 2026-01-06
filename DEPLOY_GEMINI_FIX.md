# 🚀 Deploy Gemini Model Fix to Production

## Issue Status
✅ **Code Fixed**: Gemini model updated from `gemini-1.5-flash` to `gemini-pro`  
⚠️ **Production Status**: Needs redeployment to apply the fix

## Current Error in Production
```
GoogleGenerativeAIFetchError: models/gemini-1.5-flash is not found for API version v1beta
```

## Quick Fix Deployment

### Option 1: Automatic Deployment (Recommended)

Since your Render.com service is connected to GitHub, the fix will deploy automatically when you push the changes:

```bash
# 1. Commit and push the fix
git add .
git commit -m "Fix Gemini model name from gemini-1.5-flash to gemini-pro"
git push origin main
```

**Expected Result**: Render.com will automatically detect the changes and redeploy (takes 2-3 minutes)

### Option 2: Manual Deployment via Render Dashboard

1. **Go to Render.com Dashboard**
   - Visit: https://render.com
   - Sign in to your account

2. **Find Your Service**
   - Look for "lantern-ai-backend" or similar service name

3. **Trigger Manual Deploy**
   - Click on your service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete (2-3 minutes)

### Option 3: Use Deployment Script

```bash
# Run the deployment script
./DEPLOY_RENDER.bat
```

## Verification Steps

### 1. Check Deployment Status
- Go to your Render.com dashboard
- Verify the deployment completed successfully
- Look for "Live" status

### 2. Test the Fix
```bash
# Test the backend health endpoint
curl https://lantern-ai.onrender.com/health

# Test AI provider endpoint (if available)
curl https://lantern-ai.onrender.com/api/test-ai
```

### 3. Monitor Logs
- In Render.com dashboard, click "Logs"
- Look for successful startup messages
- Verify no more `gemini-1.5-flash` errors

### 4. Test Full Functionality
- Go to your frontend: https://main.d36ebthmdi6xdg.amplifyapp.com
- Try the counselor assessment with Gemini AI enabled
- Verify career recommendations are generated successfully

## Environment Configuration

Ensure your Render.com environment variables are set correctly:

### Required Environment Variables
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-actual-gemini-api-key
USE_REAL_AI=true
```

### To Update Environment Variables:
1. Go to Render.com dashboard
2. Click on your service
3. Go to "Environment" tab
4. Add/update the variables above
5. Click "Save Changes"

## Expected Timeline

| Step | Duration | Status |
|------|----------|--------|
| Code Push | 1 minute | ✅ Ready |
| Render Build | 2-3 minutes | ⏳ Pending |
| Service Start | 30 seconds | ⏳ Pending |
| **Total** | **3-4 minutes** | ⏳ **Pending** |

## Troubleshooting

### If Deployment Fails

1. **Check Build Logs**
   - Go to Render.com dashboard
   - Click on your service → "Logs"
   - Look for build errors

2. **Common Issues**
   ```bash
   # TypeScript compilation errors
   npm run build:tsc
   
   # Missing dependencies
   npm install
   
   # Environment variable issues
   # Check Render.com environment tab
   ```

3. **Rollback Plan**
   ```bash
   # If needed, rollback to previous version
   git revert HEAD
   git push origin main
   ```

### If Gemini Still Fails

1. **Switch to OpenAI Temporarily**
   ```bash
   # In Render.com environment variables:
   AI_PROVIDER=openai
   ```

2. **Verify API Key**
   - Check your Gemini API key in Google AI Studio
   - Ensure it's not expired or quota exceeded

3. **Test Alternative Models**
   - Try `gemini-1.5-pro` if available in your region
   - Check Google AI Studio for available models

## Success Indicators

✅ **Deployment Successful When**:
- Render.com shows "Live" status
- No `gemini-1.5-flash` errors in logs
- Health endpoint responds: `{"status": "healthy"}`
- Career recommendations work in frontend
- Logs show: "Model Used: gemini-pro"

## Post-Deployment Checklist

- [ ] Render.com deployment completed successfully
- [ ] No errors in production logs
- [ ] Frontend can connect to backend
- [ ] Gemini AI provider works correctly
- [ ] Career recommendations are generated
- [ ] No more `gemini-1.5-flash` errors
- [ ] Performance is normal

## Support

If you encounter issues:

1. **Check the logs** in Render.com dashboard
2. **Verify environment variables** are set correctly
3. **Test with OpenAI** as fallback: `AI_PROVIDER=openai`
4. **Review the fix documentation**: `docs/GEMINI_MODEL_FIX.md`

---

## Quick Commands Summary

```bash
# Deploy the fix
git add .
git commit -m "Deploy Gemini model fix"
git push origin main

# Test after deployment
curl https://lantern-ai.onrender.com/health

# Monitor deployment
# Go to https://render.com → Your Service → Logs
```

**Estimated Fix Time**: 3-4 minutes after pushing to GitHub

🎯 **Next Step**: Run the git commands above to deploy the fix!