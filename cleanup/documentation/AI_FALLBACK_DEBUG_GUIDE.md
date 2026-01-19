# AI Fallback Debug Guide

## Debug Statements Added

Comprehensive debug logging has been added to trace the exact flow of AI calls and identify where failures occur.

## What to Look For in Backend Logs

When you complete an assessment, look for these debug sections in your backend console:

### 1. Undecided Career Matching Start
```
================================================================================
🎯 UNDECIDED CAREER MATCHING - START
================================================================================
🤔 Generating career matches for undecided student...
📋 Input responses: [list of response keys]
👤 Student: Grade X, ZIP XXXXX
📊 Total response keys: XX
```

### 2. AI Service Call
```
📤 CALLING AI SERVICE...
   - Prompt length: XXXX characters
   - About to call CleanAIRecommendationService.callAI()
```

### 3. Clean AI Service Configuration
```
================================================================================
🤖 CLEAN AI SERVICE - callAI() START
================================================================================
📋 AI Configuration:
   - USE_REAL_AI: true/false
   - AI_PROVIDER: openai/gemini
   - OPENAI_API_KEY exists: true/false
   - OPENAI_API_KEY length: XXX
   - OPENAI_API_KEY preview: sk-proj-...
   - GEMINI_API_KEY exists: true/false
   - Context length: XXXX characters
```

**KEY CHECKPOINT**: If `USE_REAL_AI: false`, the system will throw an error here and fall back.

### 4. OpenAI API Call
```
🟢 CALLING OPENAI API...
   - API Key exists: true
   - API Key preview: sk-proj-iAYeE...
   - System prompt length: XXX
   - User context length: XXX
   - Calling OpenAI chat.completions.create...
```

**KEY CHECKPOINT**: If the API key is invalid or expired, you'll see an error here.

### 5. Success Path
```
✅ OPENAI RESPONSE RECEIVED
   - Response length: XXXX
   - Response preview: {"careerMatches":[...
   - Model used: gpt-3.5-turbo
   - Tokens used: XXX
================================================================================
🤖 CLEAN AI SERVICE - callAI() SUCCESS
================================================================================

🔍 PARSING AI RESPONSE...
✅ Undecided career matching completed
📊 Result summary:
   - Career matches: 3
   - Undecided path flag: true
   - Has selection rationale: true
   - Has aiRecommendations: true
   - aiProcessed flag: true  <-- THIS IS CRITICAL!
================================================================================
🎯 UNDECIDED CAREER MATCHING - SUCCESS
================================================================================
```

**KEY INDICATOR**: `aiProcessed flag: true` means real AI was used successfully!

### 6. Failure Path
```
================================================================================
❌ OPENAI API CALL FAILED
================================================================================
   - Error type: [Error type]
   - Error message: [Error message]
   - API Status: [HTTP status if available]
   - API Error: [API error details]
   - Full error: [Complete error object]
================================================================================

================================================================================
❌ UNDECIDED CAREER MATCHING - FAILED
================================================================================
❌ Error details: [error]
   - Error type: [type]
   - Error message: [message]
   - Error stack: [stack trace]
================================================================================

🔄 FALLING BACK to generateDirectCounselorRecommendations...
```

## Common Failure Scenarios

### Scenario 1: USE_REAL_AI is false
**Log Output:**
```
📋 AI Configuration:
   - USE_REAL_AI: false
⚠️  USE_REAL_AI is false - would normally throw error
```

**Solution:** Set `USE_REAL_AI=true` in `.env` file

### Scenario 2: Missing API Key
**Log Output:**
```
📋 AI Configuration:
   - USE_REAL_AI: true
   - OPENAI_API_KEY exists: false
   - OPENAI_API_KEY length: 0
❌ No AI provider configured!
```

**Solution:** Add valid `OPENAI_API_KEY=sk-...` to `.env` file

### Scenario 3: Invalid/Expired API Key
**Log Output:**
```
🟢 CALLING OPENAI API...
   - API Key exists: true
   - Calling OpenAI chat.completions.create...
❌ OPENAI API CALL FAILED
   - Error type: APIError
   - Error message: Invalid API key
   - API Status: 401
```

**Solution:** Get a new API key from https://platform.openai.com/api-keys

### Scenario 4: Network/Connection Error
**Log Output:**
```
🟢 CALLING OPENAI API...
❌ OPENAI API CALL FAILED
   - Error type: NetworkError
   - Error message: connect ETIMEDOUT
```

**Solution:** Check internet connection, firewall, or proxy settings

### Scenario 5: Rate Limit Exceeded
**Log Output:**
```
❌ OPENAI API CALL FAILED
   - Error type: RateLimitError
   - API Status: 429
   - Error message: Rate limit exceeded
```

**Solution:** Wait a moment and try again, or upgrade OpenAI plan

## How to Test

1. **Start backend with logging:**
   ```bash
   cd lantern-ai/backend
   npm run dev
   ```

2. **Complete an assessment** in the frontend

3. **Watch the backend console** for the debug output

4. **Look for the key indicators:**
   - ✅ `aiProcessed flag: true` = Real AI working!
   - 🔄 `FALLING BACK to generateDirectCounselorRecommendations` = AI failed

## Frontend Behavior

Based on the backend response:

- **Real AI Success**: Shows ✅ "AI-Powered Recommendations Included"
- **Fallback Mode**: Shows 🔄 "Using Fallback AI Mode (Testing)"

The frontend checks for `aiRecommendations.aiProcessed === true` to determine which message to show.

## Next Steps After Debugging

Once you identify the issue from the logs:

1. Fix the root cause (API key, environment variable, etc.)
2. Restart the backend server
3. Clear browser localStorage (or retake assessment)
4. Complete assessment again
5. Verify you see "AI-Powered Recommendations Included"

## Files Modified

- `lantern-ai/backend/src/services/counselorGuidanceService.ts` - Added detailed logging
- `lantern-ai/backend/src/services/cleanAIRecommendationService.ts` - Added detailed logging
