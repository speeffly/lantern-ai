# Quick Cloud Database Setup - Supabase

## 🚀 5-Minute Setup for Your Team

### Why Supabase?
- ✅ **No credit card required**
- ✅ **5-minute setup**
- ✅ **500MB free storage** (plenty for your project)
- ✅ **Built-in authentication** (can replace your custom auth later)
- ✅ **All students share same database**
- ✅ **Perfect for competition demo**

---

## 📋 Step-by-Step Setup

### Step 1: Create Supabase Account (2 minutes)
1. Go to https://supabase.com/
2. Click "Start your project"
3. Sign up with **GitHub account** (easiest)
4. Verify email if prompted

### Step 2: Create Project (2 minutes)
1. Click "New project"
2. **Organization**: Choose your GitHub username
3. **Project name**: `lantern-ai`
4. **Database password**: Create strong password (SAVE THIS!)
5. **Region**: Choose closest to your location
6. Click "Create new project"
7. **Wait 2-3 minutes** for database to initialize

### Step 3: Get Connection String (1 minute)
1. Go to **Settings** → **Database** (left sidebar)
2. Scroll down to **Connection string**
3. Copy the **URI** format connection string
4. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`
5. Replace `[YOUR-PASSWORD]` with your actual password

---

## 🔧 Update Your Project

### Step 1: Install Database Package
```bash
cd lantern-ai/backend
npm install pg @types/pg
```

### Step 2: Update .env File
**Edit `lantern-ai/backend/.env`:**
```env
# Add your Supabase connection string
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres

# Keep existing settings
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=lantern-ai-secret-key
NODE_ENV=development
```

### Step 3: Create Database Tables
1. Go to Supabase dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **New query**
4. Copy and paste this SQL:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    school_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    grade INTEGER,
    zip_code VARCHAR(10),
    profile_completed BOOLEAN DEFAULT FALSE,
    consent_given BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    answers JSONB,
    zip_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action plan progress table
CREATE TABLE action_plan_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    career_code VARCHAR(50) NOT NULL,
    step_id VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, career_code, step_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_action_plan_progress_user_id ON action_plan_progress(user_id);
```

5. Click **Run** button
6. Should see "Success. No rows returned"

---

## 🧪 Test Connection

### Create Test File
**Create `lantern-ai/backend/test-db.js`:**
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log('📊 Users table exists, count:', result.rows[0].count);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
```

### Run Test
```bash
cd lantern-ai/backend
node test-db.js
```

**Expected output:**
```
✅ Database connected successfully!
📊 Users table exists, count: 0
```

---

## 🔄 Update Auth Service (Optional - for persistent users)

If you want to use the database instead of in-memory storage, update your auth service:

**Edit `lantern-ai/backend/src/services/authService.ts`:**

Add at the top:
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

**Note**: For now, you can keep using in-memory storage and add database integration later if time permits.

---

## 👥 Team Access

### Share Database Access:
1. **Option A**: Share the connection string securely with all students
2. **Option B**: Add students as collaborators:
   - Go to Supabase project settings
   - Click "Team" 
   - Invite students by email

### Each Student Updates Their .env:
```env
DATABASE_URL=the-shared-connection-string
```

---

## 📊 View Data (Supabase Dashboard)

1. Go to **Table Editor** in Supabase dashboard
2. See all your tables: `users`, `students`, `sessions`, `action_plan_progress`
3. View/edit data directly in the browser
4. Perfect for debugging and demos!

---

## 🎯 Benefits for Competition

### What Judges Will See:
- ✅ **Professional database setup**
- ✅ **Persistent user accounts**
- ✅ **Real-time data sharing**
- ✅ **Scalable architecture**
- ✅ **Production-ready deployment**

### What Students Learn:
- ✅ **Cloud database concepts**
- ✅ **SQL basics**
- ✅ **Environment variables**
- ✅ **Professional development practices**

---

## 🚨 Important Notes

### Security:
- **Never commit .env files** to Git
- **Keep database password secure**
- **Share connection string privately** (Slack, email, etc.)

### Limits:
- **500MB storage** (plenty for your project)
- **2GB bandwidth/month** (more than enough)
- **No time limits** on free tier

### Backup:
- Supabase automatically backs up your data
- You can export data anytime from dashboard

---

## 🆘 Troubleshooting

### "Connection refused":
- Check connection string format
- Verify password is correct
- Make sure you're using the URI format

### "SSL required":
- Add `ssl: { rejectUnauthorized: false }` to connection config

### "Table doesn't exist":
- Make sure you ran the SQL schema in Supabase SQL Editor
- Check table names are correct

---

## ⏰ Timeline

- **Setup**: 5 minutes
- **Testing**: 2 minutes  
- **Team sharing**: 3 minutes
- **Total**: 10 minutes to get everyone connected!

---

## 🎉 You're Done!

Once this is set up:
1. ✅ All 4 students can connect to same database
2. ✅ User accounts will persist between sessions
3. ✅ Perfect for competition demo
4. ✅ Professional, scalable setup
5. ✅ Ready to impress judges!

**Next step**: Focus on your features - the database is handled! 🚀