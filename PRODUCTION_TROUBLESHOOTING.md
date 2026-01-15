# Production Troubleshooting Guide

## 🚨 Issue: "Same issue in production after deployment"

### Quick Diagnostic Questions

Please answer these to help identify the problem:

1. **What specific issue are you seeing?**
   - [ ] Assessments disappearing after logout
   - [ ] Grade/location not displaying
   - [ ] TypeScript compilation errors
   - [ ] Backend not starting
   - [ ] Other: _______________

2. **Did the backend rebuild successfully?**
   - [ ] Yes, I see "Build succeeded" in deployment logs
   - [ ] No, build failed
   - [ ] Not sure / didn't check

3. **Is the backend running the new code?**
   - [ ] Yes, I restarted the service
   - [ ] No, haven't restarted
   - [ ] Not sure

4. **What do the production logs show?**
   - [ ] "✅ Assessment and recommendations saved to database"
   - [ ] "⚠️ No authenticated user"
   - [ ] TypeScript errors
   - [ ] Other errors: _______________

---

## 🔍 Step-by-Step Diagnosis

### Step 1: Verify Deployment Completed

**Check your hosting platform (Render/Amplify):**

```
✅ Build Status: Should show "Build succeeded"
✅ Deploy Status: Should show "Deploy succeeded" or "Live"
✅ Last Deploy Time: Should be recent (within last few minutes)
```

**If build failed:**
- Check build logs for TypeScript errors
- Verify all files were committed and pushed
- Check if `package.json` and `package-lock.json` are in sync

---

### Step 2: Verify Backend is Running New Code

**Check backend logs for startup messages:**

```
Expected to see:
🔧 Initializing database adapter...
🐘 Using PostgreSQL database
✅ Database adapter initialized successfully
🚀 Server running on port 5000
```

**If you don't see these:**
- Backend may not have restarted
- Force restart the backend service
- Check for startup errors in logs

---

### Step 3: Test Assessment Submission

**Complete a new assessment in production and check logs:**

**Expected logs:**
```
✅ Authenticated user: [userId] ([email])
💾 Saving assessment to database for user [userId]...
✅ Created assessment session: [sessionId]
✅ Saved [X] assessment answers
✅ Updated student profile with grade [X] and zipCode [X]
✅ Marked session as completed
✅ Assessment and recommendations saved to database
```

**If you see:**
```
⚠️ No authenticated user - assessment will only be saved to localStorage
```
**Problem:** User is not authenticated or token is invalid
**Solution:** 
- Check JWT_SECRET environment variable
- Have user log out and log back in
- Clear browser cookies

---

### Step 4: Check Database Connection

**In production logs, look for:**
```
✅ Database adapter initialized successfully
```

**If you see database connection errors:**
- Verify DATABASE_URL environment variable is set
- Check PostgreSQL database is accessible
- Verify database credentials are correct

---

### Step 5: Verify Environment Variables

**Required environment variables in production:**

```bash
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=lantern-ai-secret-key  # Or your custom secret
USE_REAL_AI=true  # If using OpenAI
OPENAI_API_KEY=sk-...  # If USE_REAL_AI=true
```

**Check in your hosting platform:**
- Render: Dashboard → Service → Environment
- Amplify: Console → App → Environment variables

---

## 🔧 Common Issues & Solutions

### Issue 1: "Assessment still disappearing after logout"

**Possible Causes:**
1. Backend not rebuilt with new code
2. Backend not restarted
3. User completed assessment before deployment
4. Database not saving (check logs)

**Solutions:**
1. Force rebuild and restart backend
2. Check logs for "✅ Assessment and recommendations saved to database"
3. Have user retake assessment after deployment
4. Verify DATABASE_URL is set correctly

---

### Issue 2: "TypeScript compilation errors in production"

**Possible Causes:**
1. Code not committed/pushed
2. Build cache issues
3. Missing dependencies

**Solutions:**
1. Verify all files are committed: `git status`
2. Clear build cache and rebuild
3. Check `package-lock.json` is committed
4. Run `npm install` and `npm run build` locally first

---

### Issue 3: "Backend logs show old code"

**Possible Causes:**
1. Deployment didn't complete
2. Backend not restarted
3. Multiple instances running (old + new)

**Solutions:**
1. Check deployment status in hosting platform
2. Force restart backend service
3. Check for multiple running instances
4. Verify latest commit hash in logs

---

### Issue 4: "No logs showing assessment save"

**Possible Causes:**
1. User not logged in
2. Token invalid
3. Backend not receiving requests
4. CORS issues

**Solutions:**
1. Have user log out and log back in
2. Check browser console for errors
3. Verify backend URL is correct
4. Check CORS configuration

---

## 🧪 Testing in Production

### Test 1: New User Assessment
1. Create a new test account
2. Log in
3. Complete assessment
4. **Check backend logs** - should see database save messages
5. Log out
6. Log back in
7. Navigate to results page
8. **Assessment should still be there** ✅

### Test 2: Existing User
1. Log in as existing user
2. If they have old assessment, it will be gone (expected)
3. Have them retake assessment
4. **Check backend logs** - should see database save messages
5. Test logout/login cycle
6. **Assessment should persist** ✅

### Test 3: Cross-Device
1. Complete assessment on Device A
2. Log in on Device B
3. Navigate to results page
4. **Assessment should appear** ✅

---

## 📊 What to Check in Logs

### ✅ GOOD - Assessment Saved Successfully
```
✅ Authenticated user: 123 (user@example.com)
💾 Saving assessment to database for user 123...
✅ Created assessment session: 456
✅ Saved 10 assessment answers
✅ Updated student profile with grade 11 and zipCode 12345
✅ Marked session as completed
✅ Assessment and recommendations saved to database
```

### ⚠️ WARNING - Not Saved (Anonymous)
```
⚠️ No authenticated user - assessment will only be saved to localStorage
   User will lose data on logout or browser clear
   Token present: false
```

### ❌ ERROR - Database Save Failed
```
❌ Database save failed: [error details]
   This assessment will only be available in localStorage
   User will lose data on logout or browser clear
```

---

## 🆘 Still Having Issues?

If you've checked everything above and still have issues:

1. **Share the specific error message or behavior**
2. **Share relevant production logs** (last 50 lines)
3. **Confirm deployment status** (build succeeded? deploy succeeded?)
4. **Confirm environment variables are set**
5. **Try the diagnostic script:**
   ```bash
   PRODUCTION_URL=https://your-backend.com \
   TEST_EMAIL=test@example.com \
   TEST_PASSWORD=password \
   node diagnose-production-issue.js
   ```

---

## 📝 Deployment Verification Checklist

Before considering deployment successful:

- [ ] Build succeeded in hosting platform
- [ ] Deploy succeeded in hosting platform
- [ ] Backend shows startup messages in logs
- [ ] Database connection successful
- [ ] Environment variables are set
- [ ] Test user can complete assessment
- [ ] Backend logs show "Assessment and recommendations saved to database"
- [ ] Assessment persists after logout/login
- [ ] Grade and location display correctly
- [ ] No TypeScript errors in logs

---

**Last Updated:** After production deployment
**Status:** Troubleshooting active deployment
