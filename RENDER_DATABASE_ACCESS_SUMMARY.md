# 🎯 Complete Guide: Accessing SQLite Database on Render

## 🌐 Your Database Setup

**Location**: `/tmp/lantern_ai.db` on Render server
**Environment**: Ubuntu Linux with SQLite3 pre-installed
**Status**: ✅ Database API endpoints added for easy access

## 🚀 **Method 1: Web Browser (Easiest)**

### **Option A: Database Viewer (No Command Line)**
1. **Open**: `lantern-ai/database-viewer.html` in your browser
2. **Click buttons** to view users, sessions, statistics
3. **Run custom queries** with built-in query tool
4. **Real-time monitoring** of your database

### **Option B: Direct API URLs**
```bash
# Database statistics
https://lantern-ai.onrender.com/api/database/stats

# All users with profiles
https://lantern-ai.onrender.com/api/database/users

# Recent assessment sessions
https://lantern-ai.onrender.com/api/database/sessions

# Custom query (URL encoded)
https://lantern-ai.onrender.com/api/database/query?sql=SELECT COUNT(*) FROM users
```

## 🔧 **Method 2: Render Shell Access (Direct SQLite3)**

### **Step 1: Access Render Dashboard**
1. **Login**: https://dashboard.render.com/
2. **Find your service**: "lantern-ai" backend
3. **Click "Shell"** tab or "Connect" button

### **Step 2: Open SQLite3**
```bash
# Navigate to database
sqlite3 /tmp/lantern_ai.db

# You'll see:
# SQLite version 3.x.x
# sqlite>
```

### **Step 3: Essential Commands**
```sql
-- Show all tables
.tables

-- View users
SELECT * FROM users;

-- Count by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Recent registrations
SELECT email, first_name, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Student profiles
SELECT u.email, sp.grade, sp.school_name 
FROM users u 
JOIN student_profiles sp ON u.id = sp.user_id;

-- Assessment activity
SELECT COUNT(*) as total_sessions FROM assessment_sessions;

-- Exit
.quit
```

## 📱 **Method 3: Command Line API Calls**

### **Quick Database Check**
```bash
# Get database overview
curl https://lantern-ai.onrender.com/api/database/stats

# Count users
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT COUNT(*) as total_users FROM users"

# Users by role
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT role, COUNT(*) as count FROM users GROUP BY role"

# Recent users
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5"
```

### **Formatted Output (with jq)**
```bash
# Pretty print JSON
curl -s https://lantern-ai.onrender.com/api/database/users | jq '.data[] | {email, role, created_at}'

# Get just the count
curl -s https://lantern-ai.onrender.com/api/database/stats | jq '.data.totalTables'
```

## 💾 **Method 4: Database Download & Backup**

### **Download Database File**
```bash
# Download current database
curl -O https://lantern-ai.onrender.com/api/database/download

# This downloads: lantern_ai_backup.db
```

### **Create and Download Backup**
```bash
# Create backup
curl https://lantern-ai.onrender.com/api/database/backup

# Download backup
curl -O https://lantern-ai.onrender.com/api/database/download-backup
```

### **Open Downloaded Database Locally**
```bash
# If you have SQLite3 installed locally
sqlite3 lantern_ai_backup.db

# View tables
.tables

# Query data
SELECT * FROM users;
```

## 🎯 **Recommended Workflow**

### **For Quick Checks (Daily Use)**
1. **Web Viewer** - `database-viewer.html` (easiest)
2. **API URLs** - Direct browser access
3. **curl commands** - Command line quick checks

### **For Deep Analysis**
1. **Render Shell** - Direct SQLite3 access
2. **Download database** - Analyze locally
3. **Custom queries** - Via API endpoints

### **For Demonstrations**
1. **Web Viewer** - Professional interface
2. **API endpoints** - Show real-time data
3. **Render Shell** - Technical demonstration

## 📊 **What You Should See**

### **After Users Register**
```sql
-- User counts
sqlite> SELECT role, COUNT(*) FROM users GROUP BY role;
student|5
counselor|2
parent|3

-- Recent activity
sqlite> SELECT email, role, datetime(created_at) FROM users ORDER BY created_at DESC LIMIT 3;
john.doe@email.com|student|2024-12-17 10:30:00
jane.smith@email.com|counselor|2024-12-17 09:15:00
parent@email.com|parent|2024-12-17 08:45:00
```

### **Database Health Check**
```bash
# Quick health check via API
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT 'Users' as table_name, COUNT(*) as count FROM users UNION SELECT 'Sessions', COUNT(*) FROM assessment_sessions"
```

## 🚨 **Important Notes**

### **Render Limitations**
- ⚠️ **Ephemeral storage** - Database resets on new deployments
- ✅ **Runtime persistence** - Data survives restarts during same deployment
- 🔄 **Backup regularly** if you need permanent data

### **Database Location**
- **Production (Render)**: `/tmp/lantern_ai.db`
- **Development**: `./data/lantern_ai.db`
- **Fallback**: In-memory database if file access fails

## 🎉 **Quick Start Commands**

### **Fastest Database Check**
```bash
# One command to see if database is working
curl -s "https://lantern-ai.onrender.com/api/database/query?sql=SELECT COUNT(*) as users FROM users" | jq '.data[0].users'
```

### **Complete Database Overview**
```bash
# Get comprehensive stats
curl -s https://lantern-ai.onrender.com/api/database/stats | jq '.data'
```

### **Access Render Shell**
1. **Go to**: https://dashboard.render.com/
2. **Click**: Your "lantern-ai" service
3. **Click**: "Shell" tab
4. **Run**: `sqlite3 /tmp/lantern_ai.db`

## 🏆 **Your Database is Now Fully Accessible!**

✅ **Web interface** for easy viewing
✅ **API endpoints** for programmatic access  
✅ **Shell access** for direct SQLite3 commands
✅ **Download capability** for local analysis
✅ **Real-time monitoring** of user activity

**You can now view your SQLite database contents in multiple ways without needing any local SQLite installation!** 🚀