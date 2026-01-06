# Render Environment Variables Debug Guide

## Current Issue 🚨

Even after setting environment variables in Render, you're still seeing:
```
🟠 RealJobProvider disabled: set USE_REAL_JOBS=true and provide ADZUNA_APP_ID/ADZUNA_API_KEY
🟠 Falling back to mock jobs for career "Plumber" in 78724
```

## Immediate Debugging Steps

### 1. Verify Render Environment Variables

**Go to Render Dashboard:**
1. Navigate to your backend service on Render.com
2. Go to "Environment" tab
3. Verify these exact variables are set:

```
USE_REAL_JOBS=true
ADZUNA_APP_ID=e1489edd
ADZUNA_APP_KEY=9bfb8c73d56c6f6a121eb239136ebe81
```

**Important Notes:**
- Variable names are case-sensitive
- No extra spaces before/after values
- USE_REAL_JOBS must be exactly "true" (lowercase)

### 2. Force Redeploy After Environment Changes

After setting environment variables in Render:
1. Click "Manual Deploy" → "Deploy Latest Commit"
2. OR push a small change to trigger redeploy
3. Wait for deployment to complete (2-3 minutes)

### 3. Test Environment Variables in Production

Add this test endpoint to verify environment variables are loaded:

**Create:** `lantern-ai/backend/src/routes/debug.ts`
```typescript
import { Router } from 'express';

const router = Router();

router.get('/env-check', (req, res) => {
  const envCheck = {
    USE_REAL_JOBS: process.env.USE_REAL_JOBS || 'NOT_SET',
    ADZUNA_APP_ID: process.env.ADZUNA_APP_ID ? 'SET' : 'NOT_SET',
    ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
  };
  
  res.json({
    message: 'Environment Variables Check',
    environment: envCheck,
    realJobProviderEnabled: require('../services/realJobProvider').RealJobProvider.isEnabled()
  });
});

export default router;
```

**Add to:** `lantern-ai/backend/src/index.ts`
```typescript
import debugRoutes from './routes/debug';
app.use('/api/debug', debugRoutes);
```

**Test URL:** `https://lantern-ai.onrender.com/api/debug/env-check`

## Common Issues & Solutions

### Issue 1: Environment Variables Not Propagating
**Symptoms:** Variables set in Render but still showing as "NOT_SET"
**Solution:** 
- Redeploy the service after setting variables
- Check for typos in variable names
- Ensure no trailing spaces in values

### Issue 2: Case Sensitivity
**Symptoms:** USE_REAL_JOBS set to "True" or "TRUE"
**Solution:** Must be exactly "true" (lowercase)

### Issue 3: API Key Format
**Symptoms:** ADZUNA_APP_KEY not recognized
**Solution:** 
- Ensure no quotes around the key
- Copy-paste directly from Adzuna dashboard
- Check for hidden characters

### Issue 4: Deployment Caching
**Symptoms:** Old code still running after changes
**Solution:**
- Clear Render build cache
- Force manual redeploy
- Check deployment logs for errors

## Quick Fix Commands

### Option 1: Add Debug Endpoint (Recommended)
```bash
# Add the debug endpoint and redeploy
git add .
git commit -m "Add environment debug endpoint"
git push origin main
```

### Option 2: Force Environment Refresh
```bash
# Make a small change to force redeploy
echo "// Force redeploy $(date)" >> lantern-ai/backend/src/index.ts
git add .
git commit -m "Force redeploy to refresh environment variables"
git push origin main
```

## Verification Steps

1. **Check Debug Endpoint:** Visit `https://lantern-ai.onrender.com/api/debug/env-check`
2. **Expected Response:**
```json
{
  "message": "Environment Variables Check",
  "environment": {
    "USE_REAL_JOBS": "true",
    "ADZUNA_APP_ID": "SET",
    "ADZUNA_APP_KEY": "SET",
    "NODE_ENV": "production"
  },
  "realJobProviderEnabled": true
}
```

3. **Test Counselor Assessment:** Complete assessment and check for real job data

## If Still Not Working

### Check Render Logs
1. Go to Render Dashboard → Your Service → Logs
2. Look for environment variable loading messages
3. Check for any deployment errors

### Alternative: Hardcode for Testing
**Temporary fix in `realJobProvider.ts`:**
```typescript
static isEnabled(): boolean {
  // TEMPORARY: Force enable for testing
  return true;
}
```

**Note:** Remove this after confirming environment variables work

## Success Indicators

✅ Debug endpoint shows all variables as "SET"
✅ `realJobProviderEnabled: true` in response
✅ No more "RealJobProvider disabled" errors in logs
✅ Real job data appears in counselor assessment results

---

**Next Steps:** Once environment variables are confirmed working, we can address the duplicate API calls issue.