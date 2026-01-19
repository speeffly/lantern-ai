# Questionnaire Troubleshooting Guide

## Issue: Questions Not Showing Up in Survey

The questionnaire system is fully implemented and working correctly. If questions aren't showing up, here's how to troubleshoot:

## ✅ Verified Working Components

1. **QuestionnaireService**: ✅ Working perfectly
   - 14 sections with 22 questions total
   - All question types implemented (single_choice, multi_select, text, text_area, matrix)
   - Validation and conversion working correctly

2. **API Routes**: ✅ Implemented
   - `/api/questionnaire` endpoint exists
   - All questionnaire endpoints implemented

3. **Frontend Component**: ✅ Implemented with debugging
   - React component with proper state management
   - Error handling and debugging added

## 🔍 Troubleshooting Steps

### Step 1: Start the Backend Server
The most likely issue is that the backend server isn't running.

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not done)
npm install

# Build the TypeScript code
npm run build:tsc

# Start the development server
npm run dev
```

The server should start on `http://localhost:3002`

### Step 2: Test the API Directly
Once the server is running, test the API endpoint directly:

```bash
# Test in browser or curl
curl http://localhost:3002/api/questionnaire

# Or visit in browser:
# http://localhost:3002/api/questionnaire
```

Expected response:
```json
{
  "success": true,
  "data": {
    "version": "v1",
    "title": "Lantern AI Career Questionnaire",
    "sections": [...]
  }
}
```

### Step 3: Test Frontend Pages

#### Option A: Debug Page (Recommended)
Visit: `http://localhost:3001/questionnaire-debug`

This page:
- Uses static data to test the UI components
- Has an "Test API" button to check server connectivity
- Shows detailed debugging information
- Will work even if the server is down

#### Option B: Full Questionnaire Page
Visit: `http://localhost:3001/questionnaire-test`

This page:
- Requires the backend server to be running
- Fetches data from the API
- Shows detailed console logging for debugging

### Step 4: Check Browser Console
Open browser developer tools (F12) and check the Console tab for:
- Network errors (server not running)
- CORS errors (server configuration)
- JavaScript errors (frontend issues)

## 🚀 Quick Start Commands

### Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

### Terminal 2 (Frontend):
```bash
cd frontend  
npm run dev
```

### Test URLs:
- Backend API: `http://localhost:3002/api/questionnaire`
- Debug Page: `http://localhost:3001/questionnaire-debug`
- Full Page: `http://localhost:3001/questionnaire-test`

## 🔧 Common Issues & Solutions

### Issue: "Failed to fetch"
**Cause**: Backend server not running
**Solution**: Start backend with `npm run dev` in backend directory

### Issue: CORS Error
**Cause**: Frontend and backend on different ports
**Solution**: Backend is configured for localhost:3001 frontend

### Issue: "No questions in section"
**Cause**: API returning empty data
**Solution**: Check server logs and API response format

### Issue: TypeScript Errors
**Cause**: Code not compiled
**Solution**: Run `npm run build:tsc` in backend directory

## 📊 Expected Questionnaire Structure

The questionnaire should show:

1. **Basic Information** (2 questions)
   - Grade selection (9th, 10th, 11th, 12th)
   - ZIP code input

2. **Work Environment Preferences** (1 question)
   - Multi-select work environment options

3. **Work Style** (1 question)
   - Multi-select work style preferences

4. **Thinking Style** (1 question)
   - Multi-select problem-solving preferences

5. **Education & Training** (1 question)
   - Single choice education willingness

6. **Academic Interests** (1 question)
   - Multi-select subject interests

7. **Academic Performance** (1 question)
   - Matrix rating for each subject

8. **Interests & Experience** (2 questions)
   - Text areas for interests and experience

9. **Personality & Traits** (2 questions)
   - Multi-select traits + optional text

10. **Values** (3 questions)
    - Single choice for income, stability, helping importance

11. **Lifestyle & Constraints** (1 question)
    - Multi-select constraints

12. **Decision Readiness & Risk** (2 questions)
    - Single choice for pressure and risk tolerance

13. **Support & Confidence** (2 questions)
    - Single choice for support and confidence levels

14. **Reflection** (2 questions)
    - Optional text areas for impact and inspiration

**Total: 14 sections, 22 questions**

## ✅ Verification Commands

```bash
# Test questionnaire service directly
cd backend
node test-questionnaire-service.js

# Test full integration
node test-questionnaire-integration.js

# Run unit tests
npm run test:questionnaire
```

All tests should pass, confirming the system is working correctly.

## 🆘 If Still Not Working

1. **Check server logs** for error messages
2. **Verify port numbers** (backend: 3002, frontend: 3001)
3. **Clear browser cache** and reload
4. **Check firewall/antivirus** blocking local connections
5. **Try the debug page first** to isolate the issue

The questionnaire system is fully implemented and tested. The issue is most likely that the backend server needs to be started.