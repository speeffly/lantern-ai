# AI Fallback Troubleshooting - Complete Guide

## What Was Done

Added comprehensive debug logging to trace the exact flow of AI calls and identify where failures occur.

## Files Modified

1. **lantern-ai/backend/src/services/counselorGuidanceService.ts**
   - Added detailed logging at start of `generateUndecidedCareerMatches()`
   - Added logging before/after AI call
   - Added logging for successful parsing
   - Added detailed error logging in catch block
   - Added logging for fallback mode

2. **lantern-ai/backend/src/services/cleanAIRecommendationService.ts**
   - Added detailed logging in `callAI()` method
   - Logs environment variables (USE_REAL_AI, AI_PROVIDER, API keys)
   - Added detailed logging in `callOpenAI()` method
   - Logs API call details and responses
   - Added comprehensive error logging

## How to Debug

### Step 1: Run Environment Check
```bash
cd lantern-ai
node test-ai-env-debug.js
```

This will show:
- ✅ or ❌ for each environment variable
- API key format validation
- Configuration recommendations

### Step 2: Start Backend and Watch Logs
```bash
cd lantern-ai/backend
npm run dev
```

### Step 3: Complete Assessment

Go through the assessment in the frontend and watch the backend console.

### Step 4: Analyze the Logs

Look for these key sections (in order):

#### Section 1: Start
```
================================================================================
🎯 UNDECIDED CAREER MATCHING - START
================================================================================
```

#### Section 2: AI Configuration
```
================================================================================
🤖 CLEAN AI SERVICE - callAI() START
================================================================================
📋 AI Configuration:
   - USE_REAL_AI: true/false  <-- MUST BE true
   - OPENAI_API_KEY exists: true/false  <-- MUST BE true
```

#### Section 3: OpenAI Call
```
🟢 CALLING OPENAI API...
   - Calling OpenAI chat.completions.create...
```

#### Section 4: Success or Failure

**SUCCESS:**
```
✅ OPENAI RESPONSE RECEIVED
   - aiProcessed flag: true  <-- THIS MEANS REAL AI WORKED!
================================================================================
🎯 UNDECIDED CAREER MATCHING - SUCCESS
================================================================================
```

**FAILURE:**
```
❌ OPENAI API CALL FAILED
   - Error message: [specific error]
🔄 FALLING BACK to generateDirectCounselorRecommendations...
```

## Common Issues and Solutions

### Issue 1: USE_REAL_AI is false
**Log shows:**
```
📋 AI Configuration:
   - USE_REAL_AI: false
```

**Solution:**
```bash
# Edit backend/.env
USE_REAL_AI=true
```

### Issue 2: Missing API Key
**Log shows:**
```
📋 AI Configuration:
   - OPENAI_API_KEY exists: false
   - OPENAI_API_KEY length: 0
```

**Solution:**
```bash
# Edit backend/.env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### Issue 3: Invalid/Expired API Key
**Log shows:**
```
❌ OPENAI API CALL FAILED
   - Error message: Invalid API key
   - API Status: 401
```

**Solution:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Update backend/.env with the new key
4. Restart backend server

### Issue 4: API Key Format Error
**Log shows:**
```
   - OPENAI_API_KEY preview: sk-proj-iAYeE...
   - Error message: Incorrect API key provided
```

**Solution:**
- Make sure you copied the ENTIRE key (they're long!)
- Check for extra spaces or line breaks
- The key should start with `sk-proj-` or `sk-`

### Issue 5: Rate Limit
**Log shows:**
```
❌ OPENAI API CALL FAILED
   - API Status: 429
   - Error message: Rate limit exceeded
```

**Solution:**
- Wait a few minutes and try again
- Check your OpenAI usage limits
- Consider upgrading your OpenAI plan

### Issue 6: Network Error
**Log shows:**
```
❌ OPENAI API CALL FAILED
   - Error type: NetworkError
   - Error message: connect ETIMEDOUT
```

**Solution:**
- Check internet connection
- Check firewall settings
- Check if OpenAI API is accessible from your network

## Verification Steps

After fixing the issue:

1. **Restart backend server** (Ctrl+C and `npm run dev` again)
2. **Clear browser localStorage** or retake assessment
3. **Complete assessment again**
4. **Check backend logs** for success indicators
5. **Check frontend** - should show ✅ "AI-Powered Recommendations Included"

## Expected Success Output

When everything works correctly, you should see:

**Backend Console:**
```
================================================================================
🎯 UNDECIDED CAREER MATCHING - START
================================================================================
📤 CALLING AI SERVICE...
================================================================================
🤖 CLEAN AI SERVICE - callAI() START
================================================================================
📋 AI Configuration:
   - USE_REAL_AI: true
   - AI_PROVIDER: openai
   - OPENAI_API_KEY exists: true
   - OPENAI_API_KEY length: 164
🟢 Using OpenAI provider
🟢 CALLING OPENAI API...
   - Calling OpenAI chat.completions.create...
✅ OPENAI RESPONSE RECEIVED
   - Response length: 2847
   - Model used: gpt-3.5-turbo
   - Tokens used: 1234
================================================================================
🤖 CLEAN AI SERVICE - callAI() SUCCESS
================================================================================
🔍 PARSING AI RESPONSE...
✅ Undecided career matching completed
📊 Result summary:
   - Career matches: 3
   - Has aiRecommendations: true
   - aiProcessed flag: true
================================================================================
🎯 UNDECIDED CAREER MATCHING - SUCCESS
================================================================================
```

**Frontend:**
Shows green badge: ✅ "AI-Powered Recommendations Included"

## Still Having Issues?

If you've followed all steps and it's still not working:

1. **Run the environment check:**
   ```bash
   node test-ai-env-debug.js
   ```

2. **Copy the FULL backend console output** (from start to end of assessment)

3. **Check the specific error message** in the logs

4. **Verify your OpenAI account:**
   - Go to https://platform.openai.com/account/usage
   - Check if you have available credits
   - Check if the API key is active

5. **Try a simple test:**
   ```bash
   cd lantern-ai/backend
   node test-ai-connection.js
   ```

## Quick Reference

| Symptom | Likely Cause | Quick Fix |
|---------|-------------|-----------|
| "Using Fallback AI Mode" | USE_REAL_AI=false | Set to true in .env |
| "No AI provider configured" | Missing API key | Add OPENAI_API_KEY to .env |
| "Invalid API key" | Wrong/expired key | Get new key from OpenAI |
| "Rate limit exceeded" | Too many requests | Wait and try again |
| "Network error" | Connection issue | Check internet/firewall |

## Files Created

1. `AI_FALLBACK_MODE_FIX.md` - Explanation of the fix
2. `AI_FALLBACK_DEBUG_GUIDE.md` - Debug log interpretation guide
3. `test-ai-env-debug.js` - Environment variable checker
4. `AI_FALLBACK_TROUBLESHOOTING_COMPLETE.md` - This file

## Next Steps

1. Run `node test-ai-env-debug.js` to check configuration
2. Start backend and complete an assessment
3. Watch the backend console for detailed logs
4. Follow the troubleshooting steps based on what you see
5. Once fixed, you should see "AI-Powered Recommendations Included" in the frontend
