# Lantern AI API Testing Guide

Test the Lantern AI backend API endpoints.

## Prerequisites

Backend server must be running:
```bash
cd lantern-ai/backend
npm install
npm run dev
```

## Test Endpoints

### 1. Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Lantern AI API is running",
  "timestamp": "2025-11-20T...",
  "version": "1.0.0"
}
```

### 2. Create Session
```bash
curl -X POST http://localhost:3001/api/sessions/start
```

Expected response:
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-here",
    "expiresAt": "2025-11-21T..."
  },
  "message": "Session created"
}
```

**Save the sessionId for next steps!**

### 3. Get Assessment Questions
```bash
curl http://localhost:3001/api/assessment/questions
```

Expected response: Array of 12 questions

### 4. Submit Assessment Answers
```bash
curl -X POST http://localhost:3001/api/assessment/answers \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "answers": [
      {"questionId": "q1", "answer": "Strongly Agree", "timestamp": "2025-11-20T12:00:00Z"},
      {"questionId": "q2", "answer": "Agree", "timestamp": "2025-11-20T12:00:10Z"},
      {"questionId": "q3", "answer": "Strongly Agree", "timestamp": "2025-11-20T12:00:20Z"},
      {"questionId": "q4", "answer": "A mix of both", "timestamp": "2025-11-20T12:00:30Z"},
      {"questionId": "q5", "answer": "Both are fine", "timestamp": "2025-11-20T12:00:40Z"},
      {"questionId": "q6", "answer": "Agree", "timestamp": "2025-11-20T12:00:50Z"},
      {"questionId": "q7", "answer": "Strongly Agree", "timestamp": "2025-11-20T12:01:00Z"},
      {"questionId": "q8", "answer": "Neutral", "timestamp": "2025-11-20T12:01:10Z"},
      {"questionId": "q9", "answer": "Get a certificate or short training (under 1 year)", "timestamp": "2025-11-20T12:01:20Z"},
      {"questionId": "q10", "answer": "Agree", "timestamp": "2025-11-20T12:01:30Z"},
      {"questionId": "q11", "answer": "Strongly Agree", "timestamp": "2025-11-20T12:01:40Z"},
      {"questionId": "q12", "answer": "Yes, definitely", "timestamp": "2025-11-20T12:01:50Z"}
    ]
  }'
```

### 5. Complete Assessment & Generate Profile
```bash
curl -X POST http://localhost:3001/api/assessment/complete \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "zipCode": "12345"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "interests": ["Helping Others", "Healthcare", "Community Impact"],
    "skills": ["Technology", "Attention to Detail", "Communication"],
    "workEnvironment": "mixed",
    "teamPreference": "both",
    "educationGoal": "certificate",
    "zipCode": "12345",
    "completedAt": "...",
    "updatedAt": "..."
  },
  "message": "Profile generated successfully"
}
```

### 6. Get Career Matches
```bash
curl -X POST http://localhost:3001/api/careers/matches \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "zipCode": "12345"
  }'
```

Expected response: Array of career matches with scores

### 7. Get Career Details
```bash
curl http://localhost:3001/api/careers/rn-001
```

### 8. Get Career Pathway
```bash
curl http://localhost:3001/api/careers/rn-001/pathway
```

## Complete Flow Test

Here's a complete test flow using a bash script:

```bash
#!/bin/bash

# 1. Create session
echo "Creating session..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3001/api/sessions/start)
SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.data.sessionId')
echo "Session ID: $SESSION_ID"

# 2. Get questions
echo "Getting questions..."
curl -s http://localhost:3001/api/assessment/questions | jq '.data | length'

# 3. Submit answers
echo "Submitting answers..."
curl -s -X POST http://localhost:3001/api/assessment/answers \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"answers\": [
      {\"questionId\": \"q1\", \"answer\": \"Strongly Agree\", \"timestamp\": \"2025-11-20T12:00:00Z\"},
      {\"questionId\": \"q2\", \"answer\": \"Agree\", \"timestamp\": \"2025-11-20T12:00:10Z\"},
      {\"questionId\": \"q3\", \"answer\": \"Strongly Agree\", \"timestamp\": \"2025-11-20T12:00:20Z\"},
      {\"questionId\": \"q4\", \"answer\": \"A mix of both\", \"timestamp\": \"2025-11-20T12:00:30Z\"},
      {\"questionId\": \"q5\", \"answer\": \"Both are fine\", \"timestamp\": \"2025-11-20T12:00:40Z\"},
      {\"questionId\": \"q6\", \"answer\": \"Agree\", \"timestamp\": \"2025-11-20T12:00:50Z\"},
      {\"questionId\": \"q7\", \"answer\": \"Strongly Agree\", \"timestamp\": \"2025-11-20T12:01:00Z\"},
      {\"questionId\": \"q8\", \"answer\": \"Neutral\", \"timestamp\": \"2025-11-20T12:01:10Z\"},
      {\"questionId\": \"q9\", \"answer\": \"Get a certificate or short training (under 1 year)\", \"timestamp\": \"2025-11-20T12:01:20Z\"},
      {\"questionId\": \"q10\", \"answer\": \"Agree\", \"timestamp\": \"2025-11-20T12:01:30Z\"},
      {\"questionId\": \"q11\", \"answer\": \"Strongly Agree\", \"timestamp\": \"2025-11-20T12:01:40Z\"},
      {\"questionId\": \"q12\", \"answer\": \"Yes, definitely\", \"timestamp\": \"2025-11-20T12:01:50Z\"}
    ]
  }"

# 4. Complete assessment
echo "Completing assessment..."
curl -s -X POST http://localhost:3001/api/assessment/complete \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"zipCode\": \"12345\"
  }" | jq '.data'

# 5. Get career matches
echo "Getting career matches..."
curl -s -X POST http://localhost:3001/api/careers/matches \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"zipCode\": \"12345\"
  }" | jq '.data.matches[0:3]'

echo "Test complete!"
```

Save this as `test-api.sh`, make it executable (`chmod +x test-api.sh`), and run it!

## Expected Results

After running the complete flow, you should see:
1. ✅ Session created
2. ✅ 12 questions retrieved
3. ✅ Answers saved
4. ✅ Profile generated with interests and skills
5. ✅ 10 career matches returned, sorted by match score
6. ✅ Top matches should be healthcare careers (based on sample answers)

## Troubleshooting

**Port already in use:**
```bash
# Find process using port 3001
lsof -i :3001
# Kill it
kill -9 <PID>
```

**Module not found:**
```bash
cd backend
npm install
```

**TypeScript errors:**
```bash
npm run build
```

---

🎉 If all tests pass, your Lantern AI backend is working perfectly!
