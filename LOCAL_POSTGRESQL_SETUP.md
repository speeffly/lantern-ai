# Local PostgreSQL Setup for Students

## 🎯 Why Use Local PostgreSQL?

- **Completely free** - No accounts or limits
- **Full control** - Learn database administration
- **Fast development** - No network latency
- **Privacy** - Data stays on your computer
- **Great for learning** - Understand how databases work

---

## 💻 Installation Guide

### **Windows Installation**

#### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose latest version (15.x or 16.x)
4. Download the Windows x86-64 installer

#### Step 2: Install PostgreSQL
1. Run the downloaded installer
2. **Installation Directory**: Keep default (`C:\Program Files\PostgreSQL\16`)
3. **Components**: Check all (PostgreSQL Server, pgAdmin, Command Line Tools)
4. **Data Directory**: Keep default
5. **Password**: Create a strong password for `postgres` user (REMEMBER THIS!)
6. **Port**: Keep default (5432)
7. **Locale**: Keep default
8. Click "Next" through remaining steps
9. **Important**: Uncheck "Launch Stack Builder" at the end

#### Step 3: Verify Installation
1. Open Command Prompt
2. Type: `psql --version`
3. Should show: `psql (PostgreSQL) 16.x`

---

### **Mac Installation**

#### Option 1: Homebrew (Recommended)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database user
createuser -s postgres
```

#### Option 2: Official Installer
1. Go to https://www.postgresql.org/download/macosx/
2. Download the installer
3. Follow installation steps (similar to Windows)

---

### **Linux Installation (Ubuntu/Debian)**

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql
```

---

## 🔧 Database Setup for Lantern AI

### Step 1: Create Database and User

**Windows/Mac (using psql):**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lantern_ai;

# Create user for your app
CREATE USER lantern_user WITH PASSWORD 'your_password_here';

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE lantern_ai TO lantern_user;

# Exit psql
\q
```

### Step 2: Test Connection
```bash
# Test connection with new user
psql -U lantern_user -d lantern_ai -h localhost

# If successful, you'll see:
# lantern_ai=>
```

### Step 3: Update Environment Variables

**Edit `lantern-ai/backend/.env`:**
```env
# Local PostgreSQL connection
DATABASE_URL=postgresql://lantern_user:your_password_here@localhost:5432/lantern_ai

# Other settings
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=lantern-ai-secret-key
NODE_ENV=development
```

---

## 📊 Create Database Schema

### Step 1: Install Database Dependencies
```bash
cd lantern-ai/backend
npm install pg @types/pg
```

### Step 2: Create Schema File

Create `lantern-ai/backend/src/database/schema.sql`:
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

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_action_plan_progress_user_id ON action_plan_progress(user_id);
```

### Step 3: Run Schema
```bash
# Connect to database and run schema
psql -U lantern_user -d lantern_ai -f backend/src/database/schema.sql
```

---

## 🔌 Database Connection Service

Create `lantern-ai/backend/src/services/databaseService.ts`:
```typescript
import { Pool } from 'pg';

class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  async close() {
    await this.pool.end();
  }
}

export const db = new DatabaseService();
```

---

## 🧪 Test Database Connection

Create `lantern-ai/backend/src/test-db.js`:
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('📅 Current time:', result.rows[0].now);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
```

**Run test:**
```bash
cd lantern-ai/backend
node src/test-db.js
```

---

## 🎓 Student Learning Benefits

### What Students Learn:
1. **Database Installation** - System administration skills
2. **SQL Basics** - Creating tables, indexes, queries
3. **Connection Management** - Connection pools, environment variables
4. **Schema Design** - Relationships, constraints, data types
5. **Local Development** - Setting up development environment

### Skills Gained:
- Database administration
- SQL query writing
- Environment configuration
- System setup and troubleshooting
- Professional development practices

---

## 🚀 Migration Path

### Phase 1: Local Development (Now)
- Each student installs PostgreSQL locally
- Develop and test with local database
- Learn database concepts hands-on

### Phase 2: Shared Development (Later)
- Set up one cloud database for team
- All students connect to shared database
- Collaborate on same data

### Phase 3: Production Deployment (Competition)
- Deploy to cloud with production database
- Professional setup for judges
- Scalable for real users

---

## 🛠️ Troubleshooting

### Common Issues:

**1. "psql: command not found"**
- **Windows**: Add PostgreSQL bin folder to PATH
- **Mac**: Install command line tools
- **Linux**: Install postgresql-client

**2. "Connection refused"**
- Check if PostgreSQL service is running
- Verify port 5432 is not blocked
- Check connection string format

**3. "Authentication failed"**
- Verify username and password
- Check pg_hba.conf file settings
- Try connecting as postgres user first

**4. "Database does not exist"**
- Create database first: `CREATE DATABASE lantern_ai;`
- Check database name spelling
- Verify user has access to database

---

## 📚 Learning Resources

- **PostgreSQL Tutorial**: https://www.postgresqltutorial.com/
- **SQL Practice**: https://sqlbolt.com/
- **pgAdmin Tutorial**: https://www.pgadmin.org/docs/
- **Node.js + PostgreSQL**: https://node-postgres.com/

---

## 🎯 Recommendation

**Start with local PostgreSQL** because:
1. **Students learn more** - Hands-on database administration
2. **No external dependencies** - Work offline
3. **Completely free** - No limits or accounts
4. **Professional skills** - Real-world database setup
5. **Easy to migrate** - Can move to cloud later

This gives your students valuable database skills while keeping development simple and free!