# 🔍 Accessing SQLite Database on Render

## 🌐 Your Database Location on Render

**Database Path**: `/tmp/lantern_ai.db` (on Render server)
**Environment**: Ubuntu Linux with SQLite3 pre-installed

## 🚀 Method 1: Render Shell Access (Direct SQLite3)

### **Step 1: Access Render Shell**
1. **Login to Render Dashboard**: https://dashboard.render.com/
2. **Navigate to your service**: Find "lantern-ai" backend service
3. **Open Shell**: Click "Shell" tab or "Connect" button
4. **Wait for connection**: Shell will open in browser

### **Step 2: Navigate to Database**
```bash
# Check if you're in the right directory
pwd

# List files to see if database exists
ls -la /tmp/

# Look for lantern_ai.db
ls -la /tmp/lantern_ai.db
```

### **Step 3: Open SQLite3**
```bash
# Open the database with SQLite3
sqlite3 /tmp/lantern_ai.db

# You should see SQLite prompt:
# SQLite version 3.x.x
# sqlite>
```

### **Step 4: Essential SQLite Commands**
```sql
-- Show all tables
.tables

-- Show database schema
.schema

-- View all users
SELECT * FROM users;

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- View recent registrations
SELECT email, first_name, last_name, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- View student profiles
SELECT u.email, u.first_name, sp.grade, sp.school_name, sp.zip_code
FROM users u 
JOIN student_profiles sp ON u.id = sp.user_id
WHERE u.role = 'student';

-- View assessment sessions
SELECT id, user_id, status, started_at, completed_at
FROM assessment_sessions 
ORDER BY started_at DESC 
LIMIT 10;

-- Exit SQLite
.quit
```

## 🌐 Method 2: Use Your New API Endpoints (Recommended)

Since you now have database API endpoints, this is actually easier:

### **Quick Database Check**
```bash
# Check database stats
curl https://lantern-ai.onrender.com/api/database/stats

# View all users
curl https://lantern-ai.onrender.com/api/database/users

# View recent sessions
curl https://lantern-ai.onrender.com/api/database/sessions

# Custom query - count users
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT COUNT(*) as total_users FROM users"

# Custom query - users by role
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT role, COUNT(*) as count FROM users GROUP BY role"
```

### **Use the Web Viewer**
1. **Open** `lantern-ai/database-viewer.html` in your browser
2. **Click buttons** to view data without any command line access
3. **Run custom queries** through the web interface

## 🔧 Method 3: Add Database Download Endpoint

I can add an endpoint to download the database file:

### **Add to backend/src/index.ts**
```typescript
// Database download endpoint (for backup/analysis)
app.get('/api/database/download', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    let dbPath: string;
    if (process.env.RENDER) {
      dbPath = '/tmp/lantern_ai.db';
    } else {
      dbPath = path.join(process.cwd(), 'data', 'lantern_ai.db');
    }
    
    if (fs.existsSync(dbPath)) {
      res.download(dbPath, 'lantern_ai_backup.db');
    } else {
      res.status(404).json({ error: 'Database file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to download database' });
  }
});
```

Then download with:
```bash
curl -O https://lantern-ai.onrender.com/api/database/download
```

## 🎯 Render-Specific SQLite Commands

### **Check Database Size**
```bash
# In Render shell
ls -lh /tmp/lantern_ai.db

# Or in SQLite
sqlite3 /tmp/lantern_ai.db "PRAGMA page_count; PRAGMA page_size;"
```

### **Database Backup on Render**
```bash
# Create backup
sqlite3 /tmp/lantern_ai.db ".backup /tmp/backup.db"

# Verify backup
ls -la /tmp/backup.db
```

### **Check Database Integrity**
```bash
sqlite3 /tmp/lantern_ai.db "PRAGMA integrity_check;"
```

## 🚨 Important Render Considerations

### **Ephemeral Storage**
- ⚠️ **Render uses ephemeral storage** - database resets on deployment
- ✅ **Data persists during runtime** - survives restarts but not redeployments
- 🔄 **For permanent storage**, consider upgrading to Render PostgreSQL

### **Database Persistence**
```bash
# Check when database was created
sqlite3 /tmp/lantern_ai.db "SELECT datetime(created_at) FROM users ORDER BY created_at LIMIT 1;"

# Check last activity
sqlite3 /tmp/lantern_ai.db "SELECT datetime(created_at) FROM users ORDER BY created_at DESC LIMIT 1;"
```

## 🎯 Quick Database Health Check

### **Run This in Render Shell**
```bash
# Complete database health check
sqlite3 /tmp/lantern_ai.db << 'EOF'
.headers on
.mode column

SELECT 'Database Info' as check_type, 'OK' as status;
SELECT 'Total Tables' as metric, COUNT(*) as value FROM sqlite_master WHERE type='table';
SELECT 'Total Users' as metric, COUNT(*) as value FROM users;
SELECT 'Students' as metric, COUNT(*) as value FROM users WHERE role='student';
SELECT 'Counselors' as metric, COUNT(*) as value FROM users WHERE role='counselor';
SELECT 'Parents' as metric, COUNT(*) as value FROM users WHERE role='parent';
SELECT 'Assessment Sessions' as metric, COUNT(*) as value FROM assessment_sessions;
SELECT 'Completed Sessions' as metric, COUNT(*) as value FROM assessment_sessions WHERE status='completed';

.quit
EOF
```

## 🌐 Alternative: Use Web-Based Tools

### **Option 1: Your Database Viewer**
- **Open**: `lantern-ai/database-viewer.html`
- **No command line needed**
- **Real-time data viewing**

### **Option 2: API Endpoints**
```bash
# Get comprehensive database overview
curl https://lantern-ai.onrender.com/api/database/stats | jq '.'

# Get all users formatted
curl https://lantern-ai.onrender.com/api/database/users | jq '.data[] | {email, role, created_at}'
```

## 🎉 Recommended Workflow

### **For Quick Checks**
1. **Use API endpoints** - fastest and easiest
2. **Use web viewer** - visual interface
3. **Use Render shell** - when you need direct SQLite access

### **For Development**
1. **Local SQLite3** on your development database
2. **API endpoints** for production data
3. **Web viewer** for demonstrations

## 📊 Expected Database Contents

After users register, you should see:

```sql
-- Users table
sqlite> SELECT COUNT(*) FROM users;
-- Should show number of registered users

-- User breakdown
sqlite> SELECT role, COUNT(*) FROM users GROUP BY role;
-- Should show students, counselors, parents

-- Recent activity
sqlite> SELECT email, role, datetime(created_at) FROM users ORDER BY created_at DESC LIMIT 5;
-- Should show recent registrations
```

## 🚀 Quick Start Commands

### **Access Render Shell**
1. Go to https://dashboard.render.com/
2. Click your "lantern-ai" service
3. Click "Shell" tab
4. Run: `sqlite3 /tmp/lantern_ai.db`

### **Quick Database Check**
```bash
# One-liner to check if database is working
sqlite3 /tmp/lantern_ai.db "SELECT 'Users: ' || COUNT(*) FROM users; SELECT 'Tables: ' || COUNT(*) FROM sqlite_master WHERE type='table';"
```

**Your SQLite database is accessible through Render's shell interface and your new API endpoints!** 🎯