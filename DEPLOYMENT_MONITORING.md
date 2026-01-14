# Production Deployment Monitoring - Quick Reference

## 🎯 What to Watch After Deployment

### ✅ SUCCESS Indicators

#### Backend Logs (GOOD)
```
✅ Authenticated user: 123 (user@example.com)
💾 Saving assessment to database for user 123...
✅ Created assessment session: 456
✅ Saved 8 assessment answers
✅ Updated student profile with grade 11 and zipCode 12345
✅ Marked session as completed
✅ Assessment and recommendations saved to database
```

#### Frontend Console (GOOD)
```
🔐 User is logged in, attempting to load from database...
✅ Found completed assessment in database, loading full results...
✅ Loaded results from database successfully
```

---

### ⚠️ WARNING Indicators

#### Backend Logs (NEEDS ATTENTION)
```
⚠️  No authenticated user - assessment will only be saved to localStorage
   User will lose data on logout or browser clear
   Token present: false
```
**Meaning**: User is not logged in. Assessment won't persist.
**Action**: Ensure users are logged in before taking assessment.

---

### ❌ ERROR Indicators

#### Backend Logs (CRITICAL)
```
❌ Database save failed: [error details]
   This assessment will only be available in localStorage
   User will lose data on logout or browser clear
```
**Meaning**: Database connection or save operation failed.
**Action**: 
1. Check DATABASE_URL environment variable
2. Verify PostgreSQL database is accessible
3. Check database connection logs
4. Review error details for specific issue

---

## 🔍 Quick Health Check

### 1. Backend Health
```bash
# Check if backend is running
curl https://your-backend-url.com/health

# Expected response:
{"status": "ok", "database": "connected"}
```

### 2. Database Connection
Look for this in backend startup logs:
```
🔧 Initializing database adapter...
🐘 Using PostgreSQL database
✅ Database adapter initialized successfully
```

### 3. Assessment Save Test
1. Log in as test user
2. Complete assessment
3. Check backend logs for:
   - "✅ Authenticated user: [userId]"
   - "💾 Saving assessment to database"
   - "✅ Assessment and recommendations saved to database"

### 4. Persistence Test
1. Complete assessment
2. Log out
3. Log back in
4. Navigate to results page
5. **Assessment should still be there**

---

## 📊 Key Metrics to Monitor

### First 24 Hours
- [ ] Number of new assessments completed
- [ ] Number of successful database saves
- [ ] Number of localStorage-only saves (should be 0 for logged-in users)
- [ ] Number of "assessment not found" errors
- [ ] User complaints about lost assessments

### First Week
- [ ] Assessment completion rate
- [ ] Assessment persistence rate (logout/login success)
- [ ] Cross-device access success rate
- [ ] Parent dashboard accuracy
- [ ] Grade/location display accuracy

---

## 🚨 Common Issues & Quick Fixes

### Issue: "Assessment still disappearing"
**Quick Check:**
```bash
# Check if new code is deployed
git log -1 --oneline
# Should show: "Fix critical assessment persistence bug"

# Check backend logs for database saves
# Should see: "✅ Assessment and recommendations saved to database"
```

**Quick Fix:**
1. Verify deployment completed successfully
2. Clear browser cache
3. Have user retake assessment
4. Check backend logs during assessment submission

---

### Issue: "No authenticated user" in logs
**Quick Check:**
- Is user logged in?
- Is JWT token valid?
- Check Authorization header in network tab

**Quick Fix:**
1. Have user log out and log back in
2. Clear browser cookies
3. Retake assessment
4. Verify token is sent in Authorization header

---

### Issue: "Database save failed"
**Quick Check:**
```bash
# Check DATABASE_URL environment variable
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

**Quick Fix:**
1. Verify DATABASE_URL is set correctly
2. Check database is accessible from backend
3. Verify database credentials are valid
4. Check database connection limits

---

## 📞 Emergency Contacts

### If Critical Issues Arise:

1. **Rollback Option**: 
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Database Check**:
   ```sql
   -- Check recent assessment sessions
   SELECT * FROM assessment_sessions 
   ORDER BY created_at DESC 
   LIMIT 10;
   
   -- Check if assessments are being saved
   SELECT COUNT(*) as total_assessments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
   FROM assessment_sessions
   WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

3. **Backend Logs**:
   - Render: Dashboard → Service → Logs
   - Amplify: Console → App → Monitoring → Logs
   - AWS: CloudWatch Logs

---

## ✅ Deployment Success Checklist

After deployment, verify:

- [ ] Backend shows "✅ Database adapter initialized successfully"
- [ ] Test user can complete assessment
- [ ] Backend logs show "✅ Assessment and recommendations saved to database"
- [ ] Assessment persists after logout/login
- [ ] Grade and location display correctly
- [ ] Parent dashboard shows correct status
- [ ] No critical errors in logs
- [ ] Cross-device access works

---

## 📈 Success Metrics

**Target Goals (First Week):**
- 100% of logged-in assessments saved to database
- 0% assessment loss after logout
- 95%+ assessment persistence rate
- <1% database save failures
- 100% grade/location display accuracy

---

## 🎉 All Clear Indicators

You can relax when you see:
1. ✅ Multiple successful assessment saves in logs
2. ✅ No "localStorage only" warnings for logged-in users
3. ✅ No database connection errors
4. ✅ Users reporting assessments persist after logout
5. ✅ Parent dashboards showing correct data
6. ✅ No increase in support tickets about lost assessments

---

**Last Updated**: After assessment persistence fix deployment
**Next Review**: 24 hours after deployment
