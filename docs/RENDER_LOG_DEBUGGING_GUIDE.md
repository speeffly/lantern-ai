# 🔍 Render Log Debugging Guide - AI Recommendations Not Showing

## 🎯 **Current Status**
- **Frontend**: AWS Amplify (`https://main.d2ymtj6aumrj0m.amplifyapp.com`)
- **Backend**: Render (`https://lantern-ai.onrender.com`)
- **Issue**: AI recommendation logs (`🤖 Generating AI recommendations for profile:`) not appearing in Render console

## 📋 **Step-by-Step Debugging Process**

### **Step 1: Verify Deployment Status**

#### **Check if Updated Code is Deployed**
```bash
# Test if the updated careers route is deployed
curl -X POST https://lantern-ai.onrender.com/api/careers/matches \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-session", "zipCode": "12345"}'

# Look for this response pattern:
# {"success":false,"error":"Session or profile not found. Please complete the assessment first."}
```

#### **Check Environment Variables**
```bash
# Test environment variables endpoint
curl https://lantern-ai.onrender.com/health

# Should show:
# "database": { "status": "Connected", "type": "PostgreSQL" }
```

### **Step 2: Test Complete Assessment Flow**

#### **A. Start Assessment**
1. **Go to**: https://main.d2ymtj6aumrj0m.amplifyapp.com/assessment
2. **Open browser DevTools** (F12) → Console tab
3. **Complete the assessment**
4. **Note the session ID**: `console.log(localStorage.getItem('sessionId'))`

#### **B. Check Render Logs During Assessment**
**Expected logs when assessment is completed**:
```
✅ Created assessment session: [session-token]
📝 Saved 10 assessment answers for session: [session-token]
✅ Completed assessment session: [session-token]
```

#### **C. View Results Page**
1. **Go to**: https://main.d2ymtj6aumrj0m.amplifyapp.com/results
2. **Watch Render logs** for these specific patterns:

**Expected logs when results are loaded**:
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

### **Step 3: Debug Missing Logs**

#### **If No Assessment Logs Appear**:
**Possible causes**:
- Frontend not calling backend assessment endpoints
- CORS issues preventing requests
- Assessment using wrong API endpoints

**Debug steps**:
```bash
# Test assessment endpoint directly
curl -X POST https://lantern-ai.onrender.com/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{}'

# Should return: {"success":true,"data":{"sessionId":"..."},"message":"Assessment session started"}
```

#### **If Assessment Logs Show But No Results Logs**:
**Possible causes**:
- Session not being stored in database
- Frontend calling wrong results endpoint
- Session token mismatch

**Debug steps**:
```bash
# Check if session exists in database
curl "https://lantern-ai.onrender.com/api/database/sessions"

# Should show recent assessment sessions
```

#### **If Results Logs Show But No AI Logs**:
**Possible causes**:
- Session found but profile building fails
- Career matching fails before AI service is called
- AI service throws error before logging

**Debug steps**:
```bash
# Test with a known session ID (replace SESSION_ID)
curl -X POST https://lantern-ai.onrender.com/api/careers/matches \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SESSION_ID", "zipCode": "12345"}'
```

### **Step 4: Add Debug Endpoints**

I'll add some debug endpoints to help trace the issue:

#### **Debug Endpoint 1: Test Session Lookup**
```bash
# Test session lookup (replace SESSION_ID with actual session)
curl "https://lantern-ai.onrender.com/api/debug/session/SESSION_ID"
```

#### **Debug Endpoint 2: Test Profile Building**
```bash
# Test profile building from answers
curl "https://lantern-ai.onrender.com/api/debug/profile/SESSION_ID"
```

#### **Debug Endpoint 3: Test AI Service Directly**
```bash
# Test AI service with sample data
curl -X POST "https://lantern-ai.onrender.com/api/debug/ai-test" \
  -H "Content-Type: application/json" \
  -d '{"interests": ["Healthcare", "Technology"]}'
```

### **Step 5: Check Render Environment**

#### **In Render Dashboard**:
1. **Go to**: https://dashboard.render.com/
2. **Find your service**: "lantern-ai"
3. **Click "Environment" tab**
4. **Verify these variables exist**:
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   FRONTEND_URL=https://main.d2ymtj6aumrj0m.amplifyapp.com
   NODE_ENV=production
   ```

#### **Test Environment Variables**:
```bash
curl "https://lantern-ai.onrender.com/api/debug/env"
```

### **Step 6: Real-Time Log Monitoring**

#### **Access Render Logs**:
1. **Go to**: https://dashboard.render.com/
2. **Click your service**: "lantern-ai"
3. **Click "Logs" tab**
4. **Enable auto-refresh**
5. **Set filter to "All logs"**

#### **Test While Watching Logs**:
1. **Keep Render logs open** in one browser tab
2. **Complete assessment** in another tab
3. **View results** while watching logs
4. **Look for the emoji patterns** listed above

### **Step 7: Common Issues & Solutions**

#### **Issue 1: Code Not Deployed**
**Symptoms**: Old error messages, missing log patterns
**Solution**: 
- Check Render deployment status
- Trigger manual redeploy if needed
- Verify build completed successfully

#### **Issue 2: Database Connection Issues**
**Symptoms**: "Database not initialized" errors
**Solution**:
- Check DATABASE_URL environment variable
- Verify PostgreSQL connection
- Check database initialization logs

#### **Issue 3: Session System Mismatch**
**Symptoms**: "Session not found" errors
**Solution**:
- Verify assessment creates database sessions
- Check session token format
- Ensure frontend uses correct session ID

#### **Issue 4: OpenAI API Issues**
**Symptoms**: AI service called but no recommendations
**Solution**:
- Check OPENAI_API_KEY environment variable
- Verify API key has credits
- Check OpenAI service status

### **Step 8: Quick Diagnostic Commands**

#### **Test Backend Health**:
```bash
curl https://lantern-ai.onrender.com/health
```

#### **Test Database Connection**:
```bash
curl https://lantern-ai.onrender.com/api/database/info
```

#### **Test Recent Sessions**:
```bash
curl https://lantern-ai.onrender.com/api/database/sessions
```

#### **Test Recent Users**:
```bash
curl https://lantern-ai.onrender.com/api/database/users
```

## 🎯 **Most Likely Root Causes**

### **1. Updated Code Not Deployed (80% likely)**
- The careers route with database session support hasn't been deployed to Render
- Still using old version that only checks memory sessions
- **Solution**: Verify deployment status and redeploy if needed

### **2. Assessment Not Creating Database Sessions (15% likely)**
- Assessment creates memory sessions instead of database sessions
- Frontend calling wrong assessment endpoints
- **Solution**: Check assessment flow and endpoints

### **3. Environment Variables Missing (5% likely)**
- OPENAI_API_KEY not set in Render
- DATABASE_URL incorrect
- **Solution**: Check Render environment variables

## 🚀 **Next Steps**

1. **Check Render deployment status** - Is the latest code deployed?
2. **Test the diagnostic endpoints** I'll add below
3. **Complete a full assessment** while watching Render logs
4. **Report back what logs you see** (or don't see)

## 🔧 **Debug Endpoints I'll Add**

I'll add these endpoints to help debug:
- `GET /api/debug/session/:sessionId` - Test session lookup
- `GET /api/debug/profile/:sessionId` - Test profile building  
- `POST /api/debug/ai-test` - Test AI service directly
- `GET /api/debug/env` - Check environment variables
- `GET /api/debug/flow/:sessionId` - Test complete flow

**Let me know what you see in the Render logs and I can pinpoint the exact issue!** 🔍