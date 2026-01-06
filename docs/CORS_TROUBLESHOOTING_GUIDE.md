# CORS Troubleshooting Guide

## Issue Overview

**Problem**: CORS (Cross-Origin Resource Sharing) errors when the frontend tries to communicate with the backend API.

**Common Error Message**:
```
Access to fetch at 'https://lantern-ai-backend.onrender.com/api/...' from origin 'https://main.d36ebthmdi6xdg.amplifyapp.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

The backend CORS configuration doesn't include the current frontend domain in its allowed origins list. This happens when:

1. **Frontend domain changes** (new Amplify deployment)
2. **Backend hasn't been redeployed** with updated CORS settings
3. **Environment variables are outdated**

## Solution Implemented

### 1. **Updated CORS Configuration**

Enhanced the backend CORS middleware to:
- Accept multiple frontend domains
- Use pattern matching for Amplify domains
- Provide detailed logging for debugging

```typescript
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin matches Amplify pattern
    if (origin.match(/^https:\/\/.*\.amplifyapp\.com$/)) {
      return callback(null, true);
    }
    
    // Log rejected origins for debugging
    console.log('🚫 CORS rejected origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### 2. **Updated Allowed Origins**

Added both old and new Amplify domains:

```typescript
const allowedOrigins = [
  // Environment variable domains
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) : []),
  // Production domains
  ...(process.env.NODE_ENV === 'production'
    ? [
        'https://main.d2ymtj6aumrj0m.amplifyapp.com',  // Old domain
        'https://d2ymtj6aumrj0m.amplifyapp.com',       // Old domain
        'https://main.d36ebthmdi6xdg.amplifyapp.com',  // New domain
        'https://d36ebthmdi6xdg.amplifyapp.com',       // New domain
        'https://*.amplifyapp.com'                     // Wildcard pattern
      ]
    : ['http://localhost:3000', 'http://localhost:3001'])
].filter(Boolean);
```

### 3. **Updated Environment Variables**

**render.yaml**:
```yaml
- key: FRONTEND_URL
  value: https://main.d36ebthmdi6xdg.amplifyapp.com,https://main.d2ymtj6aumrj0m.amplifyapp.com
```

## Testing CORS Configuration

### 1. **Debug Endpoint**

Test CORS configuration using the debug endpoint:
```bash
curl -H "Origin: https://main.d36ebthmdi6xdg.amplifyapp.com" \
     https://lantern-ai-backend.onrender.com/api/debug/cors
```

### 2. **Test Script**

Run the CORS test script:
```bash
node test-cors-fix.js
```

Expected output:
```
🧪 Testing CORS Configuration
==================================================

🌐 Testing origin: https://main.d36ebthmdi6xdg.amplifyapp.com
   Status: 200
   CORS Headers:
     Access-Control-Allow-Origin: https://main.d36ebthmdi6xdg.amplifyapp.com
     Access-Control-Allow-Credentials: true
   Origin Allowed: ✅ Yes
   Amplify Pattern Match: ✅ Yes
```

### 3. **Browser Developer Tools**

Check Network tab in browser developer tools:
1. Look for preflight OPTIONS requests
2. Check response headers for `Access-Control-Allow-Origin`
3. Verify no CORS errors in console

## Deployment Steps

### 1. **Backend Deployment (Render.com)**

The backend needs to be redeployed with the updated CORS configuration:

1. **Automatic Deployment** (if GitHub connected):
   - Changes are automatically deployed when pushed to main branch
   - Check deployment status in Render dashboard

2. **Manual Deployment**:
   - Go to Render.com dashboard
   - Find "lantern-ai-backend" service
   - Click "Manual Deploy" → "Deploy latest commit"

3. **Environment Variables**:
   - Ensure `FRONTEND_URL` includes new domain
   - Update in Render dashboard if needed

### 2. **Verify Deployment**

After deployment, verify CORS is working:

```bash
# Test the debug endpoint
curl -H "Origin: https://main.d36ebthmdi6xdg.amplifyapp.com" \
     https://lantern-ai-backend.onrender.com/api/debug/cors

# Test actual API endpoint
curl -H "Origin: https://main.d36ebthmdi6xdg.amplifyapp.com" \
     -H "Content-Type: application/json" \
     -X OPTIONS \
     https://lantern-ai-backend.onrender.com/api/counselor-assessment/submit
```

## Common CORS Issues & Solutions

### Issue 1: **Wildcard Pattern Not Working**

**Problem**: `https://*.amplifyapp.com` doesn't work in CORS origin array

**Solution**: Use function-based origin checking with regex pattern matching

```typescript
origin: (origin, callback) => {
  if (origin && origin.match(/^https:\/\/.*\.amplifyapp\.com$/)) {
    return callback(null, true);
  }
  // ... other checks
}
```

### Issue 2: **Multiple Domains**

**Problem**: Need to support multiple frontend domains

**Solution**: Use comma-separated environment variable

```bash
FRONTEND_URL=https://domain1.com,https://domain2.com,https://domain3.com
```

### Issue 3: **Preflight Requests Failing**

**Problem**: OPTIONS requests not handled properly

**Solution**: Explicit OPTIONS handler

```typescript
app.options('*', cors());
```

### Issue 4: **Credentials Not Allowed**

**Problem**: Cookies/auth headers not working

**Solution**: Enable credentials in CORS

```typescript
cors({
  credentials: true,
  // ... other options
})
```

## Environment-Specific Configuration

### **Development**
```bash
# Local development
FRONTEND_URL=http://localhost:3000,http://localhost:3001
NODE_ENV=development
```

### **Production**
```bash
# Production (Render.com)
FRONTEND_URL=https://main.d36ebthmdi6xdg.amplifyapp.com,https://main.d2ymtj6aumrj0m.amplifyapp.com
NODE_ENV=production
```

## Monitoring CORS Issues

### **Backend Logs**

The backend now logs CORS rejections:
```
🚫 CORS rejected origin: https://unauthorized-domain.com
🌐 Allowed origins: ['https://main.d36ebthmdi6xdg.amplifyapp.com', ...]
```

### **Debug Endpoints**

Use debug endpoints to troubleshoot:

1. **Environment Check**: `/api/debug/env`
2. **CORS Check**: `/api/debug/cors`
3. **Health Check**: `/health`

### **Browser Network Tab**

Monitor for:
- Failed preflight OPTIONS requests
- Missing CORS headers in responses
- 403/404 errors on API calls

## Prevention Strategies

### 1. **Flexible CORS Configuration**

Use pattern matching instead of hardcoded domains:
```typescript
// Good: Pattern matching
if (origin.match(/^https:\/\/.*\.amplifyapp\.com$/)) {
  return callback(null, true);
}

// Bad: Hardcoded domains
if (origin === 'https://specific-domain.amplifyapp.com') {
  return callback(null, true);
}
```

### 2. **Environment Variable Management**

Keep frontend URLs in environment variables:
```bash
# Easy to update without code changes
FRONTEND_URL=https://new-domain.com
```

### 3. **Automated Testing**

Include CORS testing in CI/CD pipeline:
```bash
# Test CORS configuration
npm run test:cors
```

### 4. **Documentation**

Document current frontend domains:
```markdown
## Current Domains
- Production: https://main.d36ebthmdi6xdg.amplifyapp.com
- Staging: https://staging.d36ebthmdi6xdg.amplifyapp.com
- Development: http://localhost:3000
```

## Quick Fix Checklist

When CORS errors occur:

- [ ] **Identify the frontend domain** from error message
- [ ] **Check if domain is in allowed origins** list
- [ ] **Update CORS configuration** to include new domain
- [ ] **Update environment variables** (FRONTEND_URL)
- [ ] **Redeploy backend** to Render.com
- [ ] **Test CORS configuration** using debug endpoint
- [ ] **Verify frontend can connect** to backend
- [ ] **Update documentation** with new domain

## Contact & Support

For CORS-related issues:

1. **Check deployment logs** in Render.com dashboard
2. **Use debug endpoints** to diagnose configuration
3. **Run test scripts** to verify CORS settings
4. **Review this guide** for common solutions
5. **Contact development team** if issues persist

---

**Last Updated**: January 4, 2025  
**Related Documents**: 
- [Technical Architecture Guide](./TECHNICAL_ARCHITECTURE_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)