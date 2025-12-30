# 🔧 AWS Amplify GitHub Connection Troubleshooting

## Common Issue: Repository Not Showing in Amplify

### 🎯 Quick Solutions (Try These First)

#### Solution 1: Refresh GitHub Connection
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. If you see "GitHub" but no repositories:
   - Click "Refresh" button (circular arrow icon)
   - Wait 30 seconds and refresh the page
   - Try selecting "All repositories" instead of specific ones

#### Solution 2: Re-authorize GitHub
1. In Amplify Console, click "GitHub" 
2. Click "Authorize AWS Amplify" again
3. Make sure you grant access to:
   - ✅ All repositories (recommended)
   - ✅ Or specifically select your repository
4. Complete the authorization flow

#### Solution 3: Check Repository Visibility
1. Go to your GitHub repository
2. Click "Settings" tab
3. Scroll to "Danger Zone"
4. Ensure repository is **Public** (not Private)
5. If Private, either:
   - Make it Public, OR
   - Ensure GitHub App has access to Private repos

---

## 🔍 Detailed Troubleshooting Steps

### Step 1: Verify GitHub Repository Setup

**Check Repository Status:**
```bash
# Verify your repository exists and has content
git status
git log --oneline -5
```

**Required Files for Amplify:**
- ✅ `package.json` in frontend folder
- ✅ Source code committed and pushed
- ✅ Repository is accessible

### Step 2: GitHub App Permissions

1. **Go to GitHub Settings:**
   - GitHub.com → Your Profile → Settings
   - Left sidebar → Applications
   - Click "Authorized OAuth Apps"

2. **Find AWS Amplify:**
   - Look for "AWS Amplify" in the list
   - Click on it
   - Verify permissions include:
     - ✅ Repository access
     - ✅ Read/Write access
     - ✅ Webhook access

3. **If Not Found:**
   - Go back to Amplify Console
   - Start the GitHub connection process again
   - Authorize with full permissions

### Step 3: Repository Structure Check

**Amplify expects this structure:**
```
your-repository/
├── package.json          # Root level (optional)
├── frontend/
│   ├── package.json      # Frontend package.json
│   ├── app/             # Next.js app directory
│   └── ...
├── backend/             # Backend (ignored by Amplify)
└── README.md
```

**If your structure is different:**
- Move frontend files to root, OR
- Configure custom build settings

### Step 4: Alternative Connection Methods

#### Method A: Use GitHub CLI
```bash
# Install GitHub CLI
# Then connect repository
gh repo view --web
# Copy the repository URL and use it in Amplify
```

#### Method B: Manual Repository URL
1. In Amplify Console
2. Instead of clicking GitHub button
3. Choose "Deploy without Git provider"
4. Upload your built files directly

#### Method C: Fork and Try Again
1. Fork your repository to a new name
2. Try connecting the forked repository
3. This often resolves permission issues

---

## 🚀 Alternative: Direct Deployment (Skip GitHub)

If GitHub connection continues to fail, use direct deployment:

### Option 1: Amplify CLI
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify in your project
cd lantern-ai/frontend
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Option 2: Manual Upload
```bash
# Build your frontend
cd lantern-ai/frontend
npm install
npm run build

# Upload to Amplify Console manually
# Go to Amplify Console → "Deploy without Git"
# Upload the .next folder
```

---

## 🔧 Step-by-Step GitHub Connection Fix

### Step 1: Complete Disconnect and Reconnect

1. **Disconnect GitHub:**
   - Go to GitHub.com → Settings → Applications
   - Find "AWS Amplify" and click "Revoke"

2. **Clear Browser Cache:**
   - Clear cookies for github.com and aws.amazon.com
   - Or use incognito/private browsing

3. **Reconnect Fresh:**
   - Go to Amplify Console
   - Click "New app" → "Host web app"
   - Click "GitHub"
   - Authorize with ALL permissions

### Step 2: Repository Visibility Check

**Make Repository Public (Temporary):**
1. Go to your GitHub repository
2. Settings → General
3. Scroll to "Danger Zone"
4. Click "Change repository visibility"
5. Select "Make public"
6. Try Amplify connection again
7. Can change back to private after connection

### Step 3: Organization vs Personal Account

**If repository is in an Organization:**
1. GitHub Settings → Organizations
2. Find your organization
3. Click "Settings"
4. "Third-party access" → "OAuth App access restrictions"
5. Make sure AWS Amplify is approved

---

## 🎯 Quick Alternative Solutions

### Solution A: Use Different Git Provider
- **GitLab**: Often works when GitHub doesn't
- **Bitbucket**: Another alternative
- **AWS CodeCommit**: Native AWS solution

### Solution B: Zip File Upload
```bash
# Build your project
cd lantern-ai/frontend
npm run build

# Create zip of .next folder
# Upload directly to Amplify Console
```

### Solution C: Use Netlify Instead
```bash
# Build project
npm run build

# Go to netlify.com/drop
# Drag .next folder
# Get instant deployment
```

---

## 🚨 Common Error Messages & Fixes

### Error: "No repositories found"
**Fix:** 
- Check repository is public
- Re-authorize GitHub connection
- Wait 5 minutes and refresh

### Error: "Access denied"
**Fix:**
- Grant Amplify access to all repositories
- Check organization permissions
- Use personal access token

### Error: "Repository not accessible"
**Fix:**
- Verify repository exists
- Check you're logged into correct GitHub account
- Try incognito browser window

---

## ✅ Success Checklist

After fixing connection:
- [ ] Repository appears in Amplify dropdown
- [ ] Can select correct branch (main/master)
- [ ] Build settings detected automatically
- [ ] Environment variables can be set
- [ ] Deployment starts successfully

---

## 🎉 Once Connected Successfully

### Configure Build Settings:
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

### Set Environment Variables:
- `NEXT_PUBLIC_API_URL`: Your backend API URL
- `NEXT_PUBLIC_ENVIRONMENT`: production

**Your Amplify deployment will be ready in 5-10 minutes!** 🚀

---

## 📞 Still Having Issues?

Try these in order:
1. **Different Browser**: Chrome, Firefox, Edge
2. **Incognito Mode**: Clears all cached permissions
3. **Different GitHub Account**: Test with another account
4. **Contact AWS Support**: Free tier includes basic support
5. **Use Alternative Deployment**: Netlify, Vercel, or direct upload

The most common fix is **re-authorizing GitHub with full permissions** and ensuring the repository is **public**.