# 📋 Manual Deployment Steps (No Git Required)

## 🎯 Simplest Method: Serverless + Netlify Drop

### Step 1: Prepare Your Environment

1. **Install AWS CLI** (if not already installed):
   - Download from: https://aws.amazon.com/cli/
   - Run: `aws configure`
   - Enter your AWS credentials

2. **Get OpenAI API Key**:
   - Go to: https://platform.openai.com/api-keys
   - Create new key
   - Copy the key (starts with sk-...)

### Step 2: Deploy Backend to AWS Lambda

Open Command Prompt or PowerShell in your project folder:

```bash
# Navigate to backend
cd lantern-ai\backend

# Install serverless globally
npm install -g serverless

# Install dependencies
npm install

# Build the project
npm run build

# Set environment variables (replace with your actual values)
set OPENAI_API_KEY=sk-your-openai-key-here
set JWT_SECRET=your-strong-secret-here

# Deploy to AWS
serverless deploy
```

**Important**: Copy the API Gateway URL from the output (looks like: `https://abc123.execute-api.us-east-1.amazonaws.com/dev`)

### Step 3: Configure Frontend

1. Open `lantern-ai\frontend\.env.production`
2. Update with your API Gateway URL:
```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_ENVIRONMENT=production
```

### Step 4: Build Frontend

```bash
# Navigate to frontend
cd ..\frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 5: Deploy Frontend (Choose One)

#### Option A: Netlify Drop (Easiest)
1. Go to: https://app.netlify.com/drop
2. Drag the entire `frontend\.next` folder to the page
3. Get your public URL instantly

#### Option B: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

#### Option C: AWS S3 Static Hosting
1. Go to AWS S3 Console
2. Create bucket: `lantern-ai-frontend`
3. Upload all files from `frontend\.next` folder
4. Enable static website hosting

---

## 🔧 Alternative: Manual File Upload

### For AWS Lambda (Backend):

1. **Prepare Files**:
   ```bash
   cd lantern-ai\backend
   npm install
   npm run build
   ```

2. **Create ZIP Package**:
   - Include: `dist/`, `node_modules/`, `package.json`, `data/`
   - Create ZIP file manually

3. **Upload via AWS Console**:
   - Go to AWS Lambda Console
   - Create new function
   - Upload ZIP file
   - Set handler: `dist/lambda.handler`
   - Add environment variables

### For Static Frontend:

1. **Build Static Files**:
   ```bash
   cd lantern-ai\frontend
   npm install
   npm run build
   npm run export
   ```

2. **Upload to Hosting**:
   - Upload `out/` folder to any static host
   - Netlify, Vercel, S3, etc.

---

## 🎯 Windows Batch Script Method

I've created `QUICK_DEPLOY_SCRIPT.bat` for you. Just:

1. Double-click `QUICK_DEPLOY_SCRIPT.bat`
2. Follow the prompts
3. Enter your OpenAI API key when asked
4. Script handles the rest automatically

---

## 📱 Mobile-Friendly Testing

After deployment, test on:
- Desktop browsers (Chrome, Firefox, Edge)
- Mobile devices (iOS Safari, Android Chrome)
- Different screen sizes

---

## 🚨 Common Issues & Solutions

### Issue: "serverless command not found"
**Solution**: 
```bash
npm install -g serverless
# Or use npx: npx serverless deploy
```

### Issue: "AWS credentials not configured"
**Solution**:
```bash
aws configure
# Enter your AWS Access Key ID and Secret
```

### Issue: "Build failed"
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run build
```

### Issue: "CORS errors"
**Solution**: Check that your frontend `.env.production` has the correct API URL

---

## ✅ Deployment Verification

After deployment, verify:

1. **Backend Health Check**:
   - Visit: `https://your-api-url/health`
   - Should return: `{"status": "OK"}`

2. **Frontend Loading**:
   - Visit your frontend URL
   - Homepage should load
   - Navigation should work

3. **Full Flow Test**:
   - Register new user
   - Take assessment
   - View results
   - Check job listings

---

## 🏆 Competition Ready Checklist

- [ ] Public URL accessible from anywhere
- [ ] HTTPS enabled (automatic with Netlify/Vercel)
- [ ] All features working
- [ ] Mobile responsive
- [ ] Fast loading times
- [ ] Professional appearance
- [ ] Demo data available

**Your application is now live and ready for judging!** 🎉

---

## 📞 Quick Support

If you encounter issues:

1. **Check AWS Console** for error logs
2. **Check browser console** for frontend errors
3. **Verify environment variables** are set correctly
4. **Test API endpoints** individually
5. **Clear browser cache** and try again

**Estimated Total Time**: 15-30 minutes for complete deployment