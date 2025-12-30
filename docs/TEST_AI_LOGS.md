# 🧪 Test AI Logs - Step by Step

## 🎯 **Quick Test Commands**

### **Step 1: Test Backend Health**
```bash
curl https://lantern-ai.onrender.com/health
```
**Expected**: Should show `"database": { "status": "Connected", "type": "PostgreSQL" }`

### **Step 2: Test Environment Variables**
```bash
curl https://lantern-ai.onrender.com/api/debug/env
```
**Expected**: Should show `"OPENAI_API_KEY": "present"` and `"DATABASE_URL": "present"`

### **Step 3: Test AI Service Directly**
```bash
curl -X POST https://lantern-ai.onrender.com/api/careers/debug/ai-test \
  -H "Content-Type: application/json" \
  -d '{"interests": ["Healthcare", "Technology"], "zipCode": "12345"}'
```
**Expected**: Should trigger AI logs in Render console

### **Step 4: Complete Assessment and Get Session ID**

1. **Go to**: https://main.d2ymtj6aumrj0m.amplifyapp.com/assessment
2. **Complete the assessment**
3. **Open browser console** (F12) and run:
   ```javascript
   console.log('Session ID:', localStorage.getItem('sessionId'));
   ```
4. **Copy the session ID**

### **Step 5: Test Session Debug (Replace SESSION_ID)**
```bash
curl https://lantern-ai.onrender.com/api/careers/debug/SESSION_ID
```
**Expected**: Should show session details and profile information

### **Step 6: Test Complete Flow (Replace SESSION_ID)**
```bash
curl https://lantern-ai.onrender.com/api/careers/debug/flow/SESSION_ID
```
**Expected**: Should trigger all the AI logs in Render console

### **Step 7: Test Actual Results (Replace SESSION_ID)**
```bash
curl -X POST https://lantern-ai.onrender.com/api/careers/matches \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SESSION_ID", "zipCode": "12345"}'
```
**Expected**: Should trigger AI logs and return full results

## 🔍 **What to Look For in Render Logs**

### **When Testing AI Service Directly (Step 3)**:
```
🤖 DEBUG: Testing AI service directly
🤖 DEBUG: Test interests: ['Healthcare', 'Technology']
🔑 DEBUG: OpenAI API Key present: true
🔑 DEBUG: API Key length: 51
🎯 DEBUG: Found career matches: 15
🤖 Generating AI recommendations for profile: ['Healthcare', 'Technology']
🔑 OpenAI API Key present: true
🔑 API Key length: 51
✅ DEBUG: AI recommendations generated successfully
```

### **When Testing Complete Flow (Step 6)**:
```
🔄 DEBUG: Testing complete flow for session: abc123
🔍 DEBUG STEP 1: Looking for session
✅ DEBUG STEP 1: Found database session: 42
📝 DEBUG STEP 2: Getting assessment answers
📝 DEBUG STEP 2: Found answers: 10
🔧 DEBUG STEP 3: Building profile from answers
👤 DEBUG STEP 3: Built profile: { interests: [...] }
🎯 DEBUG STEP 4: Getting career matches
🎯 DEBUG STEP 4: Found matches: 15
🤖 DEBUG STEP 5: Calling AI recommendation service
🤖 Generating AI recommendations for profile: [...]
✅ DEBUG STEP 5: AI recommendations completed
```

### **When Testing Actual Results (Step 7)**:
```
🔍 Looking for session: abc123
✅ Found database session: 42
📝 Found assessment answers: 10
🔧 Built profile: { interests: [...] }
👤 Built profile from answers: { interests: [...] }
🎯 Getting career matches for profile...
🎯 Found career matches: 15
🤖 Calling AI recommendation service...
🤖 Generating AI recommendations for profile: [...]
🔑 OpenAI API Key present: true
🔑 API Key length: 51
```

## 🚨 **Troubleshooting**

### **If Step 1 Fails**:
- Backend is not running or deployed
- Check Render deployment status

### **If Step 2 Shows Missing Variables**:
- Go to Render Dashboard → Environment
- Add missing `OPENAI_API_KEY` or `DATABASE_URL`

### **If Step 3 Fails**:
- OpenAI API key is invalid or has no credits
- Check OpenAI account status

### **If Step 5 Shows No Session**:
- Assessment didn't create database session
- Frontend might be using wrong endpoints
- Check assessment flow

### **If Step 6 Fails at Step 1**:
- Session not found in database
- Session token mismatch
- Assessment not completed properly

### **If Step 6 Fails at Step 5**:
- AI service error
- OpenAI API issues
- Check error details in response

## 🎯 **Most Likely Issues**

1. **Updated code not deployed** - Run Step 3 to verify
2. **Environment variables missing** - Run Step 2 to check
3. **Assessment not creating database sessions** - Run Step 5 to verify
4. **OpenAI API key issues** - Check Step 3 response

## 🚀 **Quick Fix Commands**

### **If Environment Variables Missing**:
In Render Dashboard → Environment, add:
```
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=postgresql://your-db-url
FRONTEND_URL=https://main.d2ymtj6aumrj0m.amplifyapp.com
```

### **If Code Not Deployed**:
In Render Dashboard → Manual Deploy → Deploy Latest Commit

### **If Database Issues**:
```bash
# Check database connection
curl https://lantern-ai.onrender.com/api/database/info

# Check recent sessions
curl https://lantern-ai.onrender.com/api/database/sessions
```

## 📊 **Expected Results**

After running these tests, you should see:
- ✅ Backend health check passes
- ✅ Environment variables are present
- ✅ AI service test triggers logs
- ✅ Session debug shows profile data
- ✅ Complete flow test shows all steps
- ✅ Actual results call triggers AI logs

**Run these tests and let me know which step fails - that will pinpoint the exact issue!** 🔍