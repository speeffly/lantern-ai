# 🔧 AWS Amplify 404 Error Fix

## ❌ The Problem
Your Amplify deployment shows 404 error because:
1. Next.js 13+ with App Router needs static export configuration
2. Amplify was looking for files in wrong directory (`.next` instead of `out`)
3. Missing Next.js configuration for static hosting

## ✅ What I Fixed

### 1. Updated `next.config.js` (Created)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // Enable static export
  trailingSlash: true,        // Required for Amplify
  images: {
    unoptimized: true         // Required for static export
  }
}
```

### 2. Updated `package.json` (Added export script)
```json
{
  "scripts": {
    "export": "next export"
  }
}
```

### 3. Updated `amplify.yml` (Fixed build directory)
```yaml
artifacts:
  baseDirectory: frontend/out  # Changed from frontend/.next
```

## 🚀 Deploy the Fix

### Step 1: Push Changes to GitHub
```bash
cd lantern-ai
git add .
git commit -m "Fix Amplify 404 - Add Next.js static export configuration"
git push origin main
```

### Step 2: Redeploy in Amplify
1. Go to AWS Amplify Console
2. Your app will automatically rebuild with the new configuration
3. Or click "Redeploy this version" to trigger manually

### Step 3: Set Environment Variables (Important!)
In Amplify Console → Environment Variables, add:
- `NEXT_PUBLIC_API_URL`: Your backend API URL
- `NEXT_PUBLIC_ENVIRONMENT`: `production`

## 🎯 Expected Results

After the fix:
- ✅ Build will create `frontend/out` directory
- ✅ Amplify will serve files from correct location
- ✅ Homepage will load at: https://main.d2ymtj6aumrj0m.amplifyapp.com/
- ✅ All routes will work correctly

## 🔧 Alternative Quick Fix

If the above doesn't work immediately, try this alternative `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/out
    files:
      - '**/*'
    name: lantern-ai-frontend
  cache:
    paths:
      - frontend/node_modules/**/*
```

## 🚨 If Still Getting 404

### Check Build Logs:
1. Go to Amplify Console → Build History
2. Click on latest build
3. Check if `frontend/out` directory is created
4. Verify files are in the artifacts

### Manual Verification:
```bash
# Test locally
cd lantern-ai/frontend
npm run build
ls -la out/  # Should see index.html and other files
```

### Common Issues:

1. **Missing out directory**: 
   - Check `next.config.js` has `output: 'export'`
   - Verify build completes successfully

2. **Environment variables not set**:
   - Add `NEXT_PUBLIC_API_URL` in Amplify Console
   - Set to your backend URL

3. **Build still failing**:
   - Try clearing Amplify cache
   - Or use this simpler `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend && npm install
    build:
      commands:
        - cd frontend && npm run build
  artifacts:
    baseDirectory: frontend/out
    files:
      - '**/*'
```

## ✅ Success Indicators

When working correctly:
- Build logs show: "Export successful"
- Artifacts show files in `frontend/out`
- URL loads Lantern AI homepage
- Navigation works between pages

## 🎉 Your App Should Now Work!

After pushing these changes, your Amplify deployment should work correctly:
- **Homepage**: https://main.d2ymtj6aumrj0m.amplifyapp.com/
- **Assessment**: https://main.d2ymtj6aumrj0m.amplifyapp.com/assessment/
- **Jobs**: https://main.d2ymtj6aumrj0m.amplifyapp.com/jobs/

The 404 error will be resolved and your Lantern AI application will be fully functional! 🚀