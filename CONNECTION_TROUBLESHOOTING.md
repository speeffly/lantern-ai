# 🔧 Connection Troubleshooting Guide

## 🚨 "Failed to Connect to Server" Error

Let's systematically troubleshoot this issue:

## 1. 🔍 Check Backend Status

### **Test Backend Directly**
Open these URLs in your browser:

1. **Root URL**: https://lantern-ai.onrender.com/
   - Should show: Professional welcome page
   - If 404/error: Backend not deployed properly

2. **Health Check**: https://lantern-ai.onrender.com/health
   - Should show: `{"status":"OK","message":"Lantern AI API is running"}`
   - If error: Backend service is down

3. **API Info**: https://lantern-ai.onrender.com/api
   - Should show: API endpoint information
   - If error: Routes not configured properly

## 2. 🌐 Check CORS Configuration

The backend needs to allow requests from your frontend domain.

### **Current CORS Setup**
```typescript
// Should be in backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://main.d3k8x9y2z1m4n5.amplifyapp.com'
  ],
  credentials: true
}));
```

## 3. 📡 Check Frontend API Calls

### **Environment Variable**
In AWS Amplify Console:
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://lantern-ai.onrender.com`

### **Test API Call**
Open browser console on your frontend and run:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## 4. 🔄 Common Issues & Solutions

### **Issue A: Backend Not Deployed**
- Check Render dashboard
- Look for build/deployment errors
- Verify GitHub connection

### **Issue B: CORS Blocking**
- Browser console shows CORS error
- Need to add frontend domain to CORS whitelist

### **Issue C: Wrong API URL**
- Environment variable not updated
- Amplify not rebuilt after env change

### **Issue D: SSL/HTTPS Issues**
- Mixed content (HTTP backend, HTTPS frontend)
- Certificate problems

## 5. 🛠️ Quick Fixes

### **Fix 1: Update CORS (Most Likely)**
```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000', 
    'https://main.d3k8x9y2z1m4n5.amplifyapp.com',
    'https://*.amplifyapp.com' // Allow all Amplify domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **Fix 2: Add Preflight Handler**
```typescript
// Handle preflight requests
app.options('*', cors());
```

### **Fix 3: Environment Variable Check**
```typescript
// Add debug logging
console.log('🌐 Frontend URL:', process.env.NEXT_PUBLIC_API_URL);
```

## 6. 🔍 Debugging Steps

### **Step 1: Test Backend Manually**
```bash
curl https://lantern-ai.onrender.com/health
```

### **Step 2: Check Browser Network Tab**
1. Open frontend in browser
2. Open Developer Tools → Network tab
3. Try to use a feature that calls the API
4. Look for failed requests and error messages

### **Step 3: Check Console Errors**
1. Open Developer Tools → Console tab
2. Look for CORS, network, or API errors
3. Note the exact error message

## 7. 🎯 Most Likely Solutions

Based on common deployment issues:

### **Solution 1: CORS Issue (90% likely)**
The backend is probably blocking requests from your Amplify domain.

### **Solution 2: Environment Variable Not Applied**
Amplify might not have rebuilt with the new environment variable.

### **Solution 3: Backend Service Down**
The Render service might have failed to start.

## 8. 📞 Next Steps

Please check:
1. Can you access https://lantern-ai.onrender.com/ directly?
2. What error appears in browser console?
3. What's the exact error message?
4. Did Amplify rebuild after adding the environment variable?

Let me know the results and I'll provide the specific fix!