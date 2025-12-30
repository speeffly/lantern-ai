# 🔍 SQLite Database Viewing Guide

## 📊 How to View Your SQLite Database Contents

Your SQLite database is located at:
- **Development**: `lantern-ai/backend/data/lantern_ai.db`
- **Production (Render)**: `/tmp/lantern_ai.db`

## 🌐 Method 1: Web API Endpoints (NEW - Easiest!)

### **Database Statistics**
```bash
# Get table counts and overview
curl https://lantern-ai.onrender.com/api/database/stats

# Or visit in browser:
https://lantern-ai.onrender.com/api/database/stats
```

### **View All Users**
```bash
# Get all users with their roles and profiles
curl https://lantern-ai.onrender.com/api/database/users

# Or visit in browser:
https://lantern-ai.onrender.com/api/database/users
```

### **View Assessment Sessions**
```bash
# Get recent assessment sessions with user info
curl https://lantern-ai.onrender.com/api/database/sessions

# Or visit in browser:
https://lantern-ai.onrender.com/api/database/sessions
```

### **Custom SQL Queries**
```bash
# Execute custom SELECT queries
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT COUNT(*) as total_users FROM users"

# View users by role
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT role, COUNT(*) as count FROM users GROUP BY role"

# View student profiles
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT u.email, sp.grade, sp.school_name FROM users u JOIN student_profiles sp ON u.id = sp.user_id LIMIT 10"
```

### **Database Schema**
```bash
# View all table structures
curl https://lantern-ai.onrender.com/api/database/tables
```

## 🛠️ Method 2: Command Line SQLite3

### **Install SQLite3**
```bash
# Windows (using chocolatey)
choco install sqlite

# Or download from: https://sqlite.org/download.html
```

### **Open Database**
```bash
# Navigate to backend directory
cd lantern-ai/backend

# Open the database
sqlite3 data/lantern_ai.db
```

### **Useful SQLite Commands**
```sql
-- Show all tables
.tables

-- Show table structure
.schema users
.schema student_profiles

-- View all users
SELECT * FROM users;

-- View users with their roles
SELECT id, email, first_name, last_name, role, created_at FROM users;

-- View student profiles
SELECT u.email, u.first_name, u.last_name, sp.grade, sp.school_name, sp.zip_code 
FROM users u 
JOIN student_profiles sp ON u.id = sp.user_id;

-- View assessment sessions
SELECT * FROM assessment_sessions ORDER BY started_at DESC LIMIT 10;

-- View career recommendations
SELECT * FROM career_recommendations ORDER BY generated_at DESC LIMIT 5;

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'student_profiles', COUNT(*) FROM student_profiles
UNION ALL
SELECT 'assessment_sessions', COUNT(*) FROM assessment_sessions
UNION ALL
SELECT 'career_recommendations', COUNT(*) FROM career_recommendations;

-- Exit SQLite
.quit
```

## 🖥️ Method 2: Visual Database Tools

### **DB Browser for SQLite (Free GUI)**
1. **Download**: https://sqlitebrowser.org/
2. **Install** and open
3. **Open Database**: Navigate to `lantern-ai/backend/data/lantern_ai.db`
4. **Browse Data**: Click "Browse Data" tab to see table contents
5. **Execute SQL**: Use "Execute SQL" tab for custom queries

### **VS Code Extension**
1. **Install**: "SQLite Viewer" extension in VS Code
2. **Open**: Right-click on `lantern_ai.db` file → "Open with SQLite Viewer"
3. **Browse**: View tables and data in VS Code

## 🌐 Method 3: Browser-Based Database Viewer

### **Quick Database Dashboard**
Create a simple HTML file to view your database:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Lantern AI Database Viewer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .stats { background: #f0f9ff; }
        .users { background: #f0fdf4; }
        .sessions { background: #fefce8; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        button { padding: 8px 16px; margin: 5px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <h1>🔍 Lantern AI Database Viewer</h1>
    
    <div class="section stats">
        <h2>📊 Database Statistics</h2>
        <button onclick="loadStats()">Load Stats</button>
        <pre id="stats-output">Click "Load Stats" to view database statistics</pre>
    </div>
    
    <div class="section users">
        <h2>👥 Users</h2>
        <button onclick="loadUsers()">Load Users</button>
        <pre id="users-output">Click "Load Users" to view all users</pre>
    </div>
    
    <div class="section sessions">
        <h2>📝 Assessment Sessions</h2>
        <button onclick="loadSessions()">Load Sessions</button>
        <pre id="sessions-output">Click "Load Sessions" to view recent sessions</pre>
    </div>
    
    <div class="section">
        <h2>🔍 Custom Query</h2>
        <input type="text" id="custom-query" placeholder="SELECT * FROM users LIMIT 5" style="width: 400px; padding: 8px;">
        <button onclick="runQuery()">Run Query</button>
        <pre id="query-output">Enter a SELECT query above</pre>
    </div>

    <script>
        const API_BASE = 'https://lantern-ai.onrender.com/api/database';
        
        async function loadStats() {
            try {
                const response = await fetch(`${API_BASE}/stats`);
                const data = await response.json();
                document.getElementById('stats-output').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('stats-output').textContent = 'Error: ' + error.message;
            }
        }
        
        async function loadUsers() {
            try {
                const response = await fetch(`${API_BASE}/users`);
                const data = await response.json();
                document.getElementById('users-output').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('users-output').textContent = 'Error: ' + error.message;
            }
        }
        
        async function loadSessions() {
            try {
                const response = await fetch(`${API_BASE}/sessions`);
                const data = await response.json();
                document.getElementById('sessions-output').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('sessions-output').textContent = 'Error: ' + error.message;
            }
        }
        
        async function runQuery() {
            const query = document.getElementById('custom-query').value;
            if (!query.trim()) {
                alert('Please enter a query');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/query?sql=${encodeURIComponent(query)}`);
                const data = await response.json();
                document.getElementById('query-output').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('query-output').textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
```

Save this as `database-viewer.html` and open in your browser!

## 📋 Method 4: Quick Database Check Commands

### **Check if Database Exists**
```bash
# In backend directory
ls -la data/
# Should show: lantern_ai.db
```

### **Quick Table List**
```bash
sqlite3 data/lantern_ai.db ".tables"
```

### **Quick User Count**
```bash
sqlite3 data/lantern_ai.db "SELECT COUNT(*) as user_count FROM users;"
```

### **Recent Users**
```bash
sqlite3 data/lantern_ai.db "SELECT email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
```

## 🔍 Useful Queries for Your System

### **View All Users by Role**
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

### **View Student Information**
```sql
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    sp.grade,
    sp.school_name,
    sp.zip_code,
    sp.interests
FROM users u
LEFT JOIN student_profiles sp ON u.id = sp.user_id
WHERE u.role = 'student';
```

### **View Assessment Activity**
```sql
SELECT 
    u.email,
    u.role,
    COUNT(ass.id) as assessment_count,
    MAX(ass.started_at) as last_assessment
FROM users u
LEFT JOIN assessment_sessions ass ON u.id = ass.user_id
GROUP BY u.id, u.email, u.role
ORDER BY assessment_count DESC;
```

### **View User Relationships**
```sql
SELECT 
    p.email as primary_user,
    p.role as primary_role,
    s.email as secondary_user,
    s.role as secondary_role,
    ur.relationship_type,
    ur.status
FROM user_relationships ur
JOIN users p ON ur.primary_user_id = p.id
JOIN users s ON ur.secondary_user_id = s.id;
```

## 🚀 Production Database (Render)

For the production database on Render, you can:

### **Option 1: Add Database Stats API**
```typescript
// Add to your backend
app.get('/api/debug/stats', async (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    return res.status(404).json({ error: 'Not available in production' });
  }
  
  try {
    const stats = await DatabaseService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});
```

### **Option 2: Render Shell Access**
Some hosting platforms provide shell access to view files directly.

## 📊 Expected Database Contents

After users register and use your system, you should see:

### **Users Table**
- Student accounts with email, password, role='student'
- Counselor accounts with role='counselor'
- Parent accounts with role='parent'

### **Student Profiles**
- Grade level, school, ZIP code, interests
- Linked to user accounts via user_id

### **Assessment Sessions**
- Session tokens, user IDs, completion status
- Assessment answers and timestamps

### **Career Recommendations**
- AI-generated career matches
- Local job market data
- Academic planning recommendations

## 🎯 Quick Start

**Easiest method for you:**
1. **Install DB Browser for SQLite** (GUI tool)
2. **Open** `lantern-ai/backend/data/lantern_ai.db`
3. **Browse tables** to see your data
4. **Run queries** to analyze user activity

## 🚀 Quick Start - View Your Database Now!

### **Option 1: Web Browser (Easiest)**
1. **Open** `lantern-ai/database-viewer.html` in your browser
2. **Click buttons** to view users, sessions, and statistics
3. **Run custom queries** with the built-in query tool

### **Option 2: Direct API Calls**
```bash
# Quick check - how many users do you have?
curl "https://lantern-ai.onrender.com/api/database/query?sql=SELECT COUNT(*) as total_users FROM users"

# See all your registered users
curl "https://lantern-ai.onrender.com/api/database/users"
```

### **Option 3: Command Line**
```bash
# If you have SQLite installed locally
cd lantern-ai/backend
sqlite3 data/lantern_ai.db "SELECT * FROM users;"
```

## 🎯 What You Should See

After users register and use your system:

### **Users Table**
- ✅ Student accounts with email, role='student'
- ✅ Counselor accounts with role='counselor'  
- ✅ Parent accounts with role='parent'
- ✅ Encrypted passwords (bcrypt hashes)

### **Student Profiles**
- ✅ Grade levels, schools, ZIP codes
- ✅ Student interests and career aspirations
- ✅ Linked to user accounts via user_id

### **Assessment Sessions**
- ✅ Anonymous and logged-in user sessions
- ✅ Assessment answers and completion status
- ✅ Session tokens and timestamps

### **Career Recommendations**
- ✅ AI-generated career matches
- ✅ Local job market analysis
- ✅ Academic pathway recommendations

## 🏆 Database Status Check

**Your database now includes:**
- ✅ **Persistent user accounts** (survive server restarts)
- ✅ **Multi-user system** with roles and relationships
- ✅ **Assessment data** and career recommendations
- ✅ **Professional schema** with proper relationships
- ✅ **Real-time monitoring** via API endpoints

**Your SQLite database contains all the user data, assessments, and recommendations from your Lantern AI system!** 🚀

## 📊 Database Monitoring URLs

**Live Database Stats**: https://lantern-ai.onrender.com/api/database/stats
**All Users**: https://lantern-ai.onrender.com/api/database/users  
**Recent Sessions**: https://lantern-ai.onrender.com/api/database/sessions
**Custom Queries**: https://lantern-ai.onrender.com/api/database/query?sql=YOUR_QUERY

**Your database is now fully accessible and monitorable! 🎉**