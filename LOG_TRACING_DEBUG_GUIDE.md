# 🔍 Log Tracing Debug Guide - AWS Amplify + Render

## 🎯 **Your Setup**
- **Frontend**: AWS Amplify (`https://main.d2ymtj6aumrj0m.amplifyapp.com`)
- **Backend**: Render (`https://lantern-ai.onrender.com`)
- **Issue**: AI recommendation logs not appearing

## 📍 **Step-by-Step Debugging**

### **Step 1: Access Render Logs**

#### **Method A: Render Dashboard**
1. **Go to**: https://dashboard.render.com/
2. **Find your service**: "lantern-ai" (backend)
3. **Click on the service name**
4. **Click "Logs" tab** (should be visible at the top)
5. **Set log level**: "All logs" or "Info"
6. **Enable auto-refresh**: Toggle on for real-time logs

#### **Method B: Render CLI (Alternative)**
```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# View logs
render logs --service-id YOUR_SERVICE_ID --follow
```

### **Step 2: Test the Complete Flow**

#### **A. Complete Assessment**
1. **Go to**: https://main.d2ymtj6aumrj0m.amplifyapp.com/assessment
2. **Complete the assessment** (answer all questions)
3. **Note the session ID** (check browser localStorage)
4. **Watch Render logs** for assessment completion

#### **B. View Results**
1. **Go to**: https://main.d2ymtj6aumrj0m.amplifyapp.com/results
2. **Watch Render logs** for API calls
3. **Look for specific log patterns** (see below)

### **Step 3: Expected Log Patterns**

#### **When Assessment is Completed**:
```
✅ Created assessment session: [session-token]
📝 Saved 10 assessment answers for session: [session-token]
✅ Completed assessment session: [session-token]
```

#### **When Results Page is Loaded**:
```
🔍 Looking for session: [session-token]
✅ Found database session: [session-id]
📝 Found assessment answers: [count]
🔧 Built profile: { interests: [...], skills: [...] }
👤 Built profile from answers: { interests: [...] }
🎯 Getting career matches for profile...
🎯 Found career matches: [count]
🤖 Calling AI recommendation service...
🤖 Generating AI recommendations for profile: [interests-array]
🔑 OpenAI API Key present: true/false
🔑 API Key length: [number]
```

### **Step 4: Debug Missing Logs**

#### **If No Logs Appear at All**:
```bash
# Test if backend is receiving requests
curl https://lantern-ai.onrender.com/health

# Should return:
{
  "status": "OK",
  "message": "Lantern AI API is running",
  "database": { "status": "Connected", "type": "PostgreSQL" }
}
```

#### **If Assessment Logs Missing**:
```bash
# Check if assessment endpoint works
curl -X POST https://lantern-ai.onrender.com/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{}'

# Should return session token
```

#### **If Results Logs Missing**:
```bash
# Check if careers endpoint works
curl -X POST https://lantern-ai.onrender.com/api/careers/matches \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-session", "zipCode": "12345"}'

# Should return error about session not found
```

### **Step 5: Frontend Network Debugging**

#### **Check Browser Network Tab**:
1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Complete assessment and view results**
4. **Look for these requests**:
   - `POST /api/sessions/start` (assessment start)
   - `POST /api/sessions/submit` (assessment submit)
   - `POST /api/careers/matches` (results page)

#### **Check Request Details**:
```javascript
// In browser console, check session storage
console.log('Session ID:', localStorage.getItem('sessionId'));
console.log('ZIP Code:', localStorage.getItem('zipCode'));

// Check if API URL is correct
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

### **Step 6: Add Debug Endpoint**

Let me add a debug endpoint to test the flow:

#### **Test Endpoint** (add to backend):
```typescript
// Add to backend/src/routes/careers.ts
router.get('/debug/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  console.log('🔍 DEBUG: Looking for session:', sessionId);
  
  try {
    // Try database session
    const dbSession = await AssessmentServiceDB.getSessionByToken(sessionId);
    console.log('📊 DEBUG: Database session:', !!dbSession);
    
    if (dbSession) {
      const answers = await AssessmentServiceDB.getAnswers(sessionId);
      console.log('📝 DEBUG: Answers count:', answers.length);
      console.log('📝 DEBUG: Sample answers:', answers.slice(0, 3));
    }
    
    // Try memory session
    const memSession = SessionService.getSession(sessionId);
    console.log('💾 DEBUG: Memory session:', !!memSession);
    
    res.json({
      sessionId,
      databaseSession: !!dbSession,
      memorySession: !!memSession,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ DEBUG Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### **Test the Debug Endpoint**:
```bash
# Replace SESSION_ID with actual session from localStorage
curl https://lantern-ai.onrender.com/api/careers/debug/SESSION_ID
```

### **Step 7: Common Issues & Solutions**

#### **Issue 1: No Logs at All**
**Cause**: Requests not reaching backend
**Check**:
- Frontend API URL configuration
- CORS settings
- Network connectivity

#### **Issue 2: Session Not Found**
**Cause**: Session system mismatch
**Check**:
- Assessment using database vs memory storage
- Session token format
- Database connection

#### **Issue 3: AI Service Not Called**
**Cause**: Profile building fails
**Check**:
- Assessment answers format
- Profile building logic
- Career matching service

#### **Issue 4: OpenAI Logs Missing**
**Cause**: API key issues
**Check**:
- `OPENAI_API_KEY` environment variable
- API key validity
- OpenAI service status

### **Step 8: Environment Variable Check**

#### **In Render Dashboard**:
1. **Go to your service** → **Environment** tab
2. **Check these variables**:
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   FRONTEND_URL=https://main.d2ymtj6aumrj0m.amplifyapp.com
   NODE_ENV=production
   ```

#### **Test Environment Variables**:
```bash
# Add this endpoint to test
curl https://lantern-ai.onrender.com/api/debug/env

# Should show (without revealing actual values):
{
  "DATABASE_URL": "present",
  "OPENAI_API_KEY": "present", 
  "FRONTEND_URL": "https://main.d2ymtj6aumrj0m.amplifyapp.com"
}
```

### **Step 9: Real-Time Log Monitoring**

#### **Watch Logs While Testing**:
1. **Open Render logs** in one browser tab
2. **Open your app** in another tab
3. **Complete assessment** while watching logs
4. **View results** while watching logs
5. **Look for the specific emoji logs**

#### **Log Filtering**:
In Render logs, you can filter by:
- **Level**: Info, Error, Debug
- **Time**: Last hour, day, etc.
- **Search**: Type "🤖" to find AI logs

### **Step 10: Quick Test Commands**

#### **Test Backend Health**:
```bash
curl https://lantern-ai.onrender.com/health
```

#### **Test Database Connection**:
```bash
curl https://lantern-ai.onrender.com/api/database/info
```

#### **Test Session Creation**:
```bash
curl -X POST https://lantern-ai.onrender.com/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### **Test Career Matches** (with fake session):
```bash
curl -X POST https://lantern-ai.onrender.com/api/careers/matches \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "fake-session", "zipCode": "12345"}'
```

## 🎯 **Most Likely Issues**

### **1. Frontend Not Calling Backend**
- Check browser Network tab
- Verify API URL in frontend
- Check CORS configuration

### **2. Session System Mismatch**
- Assessment creates database session
- Results looks for memory session
- Need to verify session storage method

### **3. Database Connection Issues**
- PostgreSQL connection problems
- Session not being stored
- Check database logs

### **4. Environment Variables Missing**
- OPENAI_API_KEY not set
- DATABASE_URL incorrect
- Check Render environment settings

## 🚀 **Next Steps**

1. **Check Render logs** during assessment completion
2. **Check Render logs** during results viewing
3. **Test debug endpoints** to isolate the issue
4. **Verify environment variables** are set correctly
5. **Check browser network tab** for failed requests

**Let me know what you see in the Render logs and I can help pinpoint the exact issue!** 🔍