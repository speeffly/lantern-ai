# 🔧 Troubleshooting Guide
## Quick Fixes for Common Issues

### 🚨 **Port 3002 Already in Use**

**Problem**: Backend won't start due to port conflict
```
Error: listen EADDRINUSE: address already in use :::3002
```

**Solutions**:

#### Option 1: Kill Existing Process
```bash
# Find process using port 3002
netstat -ano | findstr :3002

# Kill the process (replace PID with actual number)
taskkill /PID [PID_NUMBER] /F
```

#### Option 2: Use Different Port
```bash
# Edit backend/.env file
PORT=3003

# Update frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3003
```

#### Option 3: Restart Computer
- Simple but effective solution
- Clears all port conflicts

---

### 🔧 **TypeScript Compilation Errors**

**Problem**: Build fails with TypeScript errors

**Solution**:
```bash
cd lantern-ai/backend
rm -rf node_modules dist
npm install
npm run build
```

---

### 📦 **Missing Dependencies**

**Problem**: "Module not found: openai"

**Solution**:
```bash
cd lantern-ai/backend
npm install openai@^4.20.1
```

---

### 🌐 **Frontend Won't Connect to Backend**

**Problem**: API calls failing

**Check**:
1. Backend running on correct port (3002)
2. Frontend environment variables correct
3. CORS configuration working

**Solution**:
```bash
# Verify backend is running
curl http://localhost:3002/health

# Check frontend environment
cat lantern-ai/frontend/.env.local
```

---

### 🤖 **OpenAI API Issues**

**Problem**: AI recommendations not working

**Solutions**:

#### Without API Key (Expected)
- System uses intelligent fallbacks
- Still provides comprehensive recommendations
- Look for: "⚠️ OpenAI API key not found, using fallback"

#### With Invalid API Key
- Check API key format
- Verify account has credits
- Test with simple API call

#### Rate Limiting
- OpenAI has usage limits
- System gracefully falls back to rule-based recommendations

---

### 🎯 **Quick System Test**

**Verify Everything Works**:
```bash
# 1. Backend health check
curl http://localhost:3002/health

# 2. Frontend loads
# Open http://localhost:3001

# 3. Complete assessment
# Should see 4 tabs in results

# 4. Check backend logs
# Should see AI recommendation generation logs
```

---

### 📱 **Results Page Issues**

**Problem**: Only seeing old 1-tab interface

**Solutions**:
1. **Clear Browser Cache** - Ctrl+F5 or Cmd+Shift+R
2. **Check Console Errors** - F12 → Console tab
3. **Verify Backend Response** - Should include aiRecommendations, localJobMarket, academicPlan

---

### 🔄 **System Reset**

**Nuclear Option - Fresh Start**:
```bash
# Stop all processes
# Kill any processes on ports 3001, 3002

# Backend reset
cd lantern-ai/backend
rm -rf node_modules dist
npm install
npm run build

# Frontend reset  
cd lantern-ai/frontend
rm -rf node_modules .next
npm install

# Start fresh
npm run dev (in both directories)
```

---

### ✅ **Verification Checklist**

**System Working Correctly When**:
- [ ] Backend starts on port 3002 without errors
- [ ] Frontend loads at http://localhost:3001
- [ ] Assessment completes successfully
- [ ] Results page shows 4 tabs:
  - [ ] Career Matches
  - [ ] 📚 Course Plan  
  - [ ] 💼 Local Jobs
  - [ ] 🎯 Action Plan
- [ ] Course recommendations show by year
- [ ] Local jobs show within 40 miles
- [ ] AI pathway shows short/medium/long term goals

---

### 🆘 **Still Having Issues?**

**Debug Steps**:
1. **Check Backend Logs** - Look for error messages
2. **Check Frontend Console** - F12 → Console for errors
3. **Verify Environment Variables** - API URLs, ports
4. **Test API Endpoints** - Use curl or Postman
5. **Check Network Tab** - See if API calls are being made

**Common Log Messages**:
- ✅ "🤖 Generating AI recommendations" - AI working
- ⚠️ "OpenAI API key not found, using fallback" - Expected without API key
- ❌ "Failed to generate recommendations" - Check API key/network

---

### 🎯 **Success Indicators**

**You Know It's Working When**:
- Backend shows: "🚀 Lantern AI API running on port 3002"
- Frontend shows: "▲ Next.js ready on http://localhost:3001"
- Assessment results show personalized course recommendations
- Local jobs appear with distance information
- AI-generated career pathways display properly

---

**💡 Remember: The system is designed to work even without OpenAI API keys using intelligent fallbacks. Focus on getting the basic functionality working first, then add AI enhancement!**