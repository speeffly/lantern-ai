import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

// Enable verbose mode for debugging
const sqlite = sqlite3.verbose();

export class DatabaseService {
  private static db: sqlite3.Database | null = null;
  private static isInitialized = false;

  /**
   * Initialize the database connection and create tables
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Render-optimized database path
      let dbPath: string;
      
      if (process.env.RENDER) {
        // On Render, use /tmp for ephemeral storage (persists during session)
        dbPath = '/tmp/lantern_ai.db';
        console.log('🚀 Render deployment: Using /tmp for SQLite database');
      } else if (process.env.NODE_ENV === 'production') {
        // Other production environments
        dbPath = './lantern_ai.db';
        console.log('🏭 Production: Using current directory for SQLite database');
      } else {
        // Development environment
        const dbDir = './data';
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }
        dbPath = path.join(dbDir, 'lantern_ai.db');
        console.log('💻 Development: Using ./data directory for SQLite database');
      }

      console.log('🗄️ Initializing SQLite database at:', dbPath);

      // Create database connection with Render optimizations
      this.db = new sqlite.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          console.error('❌ Error opening SQLite database:', err);
          console.error('❌ Database path:', dbPath);
          console.error('❌ Environment:', process.env.NODE_ENV);
          console.error('❌ Render:', !!process.env.RENDER);
          throw err;
        }
        console.log('✅ Connected to SQLite database successfully');
      });

      // SQLite optimizations for Render deployment
      await this.run('PRAGMA foreign_keys = ON');
      await this.run('PRAGMA journal_mode = WAL');  // Better concurrency
      await this.run('PRAGMA synchronous = NORMAL'); // Faster writes
      await this.run('PRAGMA cache_size = 10000');   // More memory cache
      await this.run('PRAGMA temp_store = MEMORY');  // Temp tables in memory
      
      console.log('✅ SQLite performance optimizations applied');

      // Create tables from embedded schema
      await this.createTables();

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables from embedded schema
   */
  private static async createTables(): Promise<void> {
    try {
      console.log('🔧 Using embedded database schema (no file dependencies)');
      // Embedded schema to avoid file path issues in production deployment
      const schema = `
-- Lantern AI Database Schema
-- Multi-user career guidance platform with relationships

-- Users table (students, counselors, parents)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'counselor', 'parent')),
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Student profiles (extended information for students)
CREATE TABLE IF NOT EXISTS student_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    grade INTEGER,
    school_name VARCHAR(200),
    zip_code VARCHAR(10),
    interests TEXT, -- JSON array of interests
    skills TEXT, -- JSON array of skills
    education_goal VARCHAR(50),
    work_environment VARCHAR(50),
    gpa DECIMAL(3,2),
    extracurricular_activities TEXT, -- JSON array
    career_aspirations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Counselor profiles
CREATE TABLE IF NOT EXISTS counselor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    school_district VARCHAR(200),
    specializations TEXT, -- JSON array of specializations
    years_experience INTEGER,
    license_number VARCHAR(100),
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Parent profiles
CREATE TABLE IF NOT EXISTS parent_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    occupation VARCHAR(200),
    education_level VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Relationships between users (parent-student, counselor-student)
CREATE TABLE IF NOT EXISTS user_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    primary_user_id INTEGER NOT NULL, -- counselor or parent
    secondary_user_id INTEGER NOT NULL, -- student
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('parent_child', 'counselor_student')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (primary_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (secondary_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(primary_user_id, secondary_user_id, relationship_type)
);

-- Assessment sessions
CREATE TABLE IF NOT EXISTS assessment_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, -- NULL for anonymous sessions
    session_token VARCHAR(255) UNIQUE NOT NULL,
    zip_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Assessment answers
CREATE TABLE IF NOT EXISTS assessment_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    answer TEXT NOT NULL,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE
);

-- Career matches and recommendations
CREATE TABLE IF NOT EXISTS career_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    user_id INTEGER, -- For logged-in users
    career_matches TEXT NOT NULL, -- JSON array of career matches
    ai_recommendations TEXT, -- JSON object with AI recommendations
    local_job_market TEXT, -- JSON object with local job data
    academic_plan TEXT, -- JSON object with course recommendations
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Action plans (personalized career pathways)
CREATE TABLE IF NOT EXISTS action_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    career_code VARCHAR(50) NOT NULL,
    career_title VARCHAR(200) NOT NULL,
    short_term_goals TEXT, -- JSON array
    medium_term_goals TEXT, -- JSON array
    long_term_goals TEXT, -- JSON array
    skill_gaps TEXT, -- JSON array
    action_items TEXT, -- JSON array
    progress_notes TEXT, -- JSON array of progress updates
    created_by INTEGER, -- counselor who created/modified
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Counselor notes and recommendations
CREATE TABLE IF NOT EXISTS counselor_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    counselor_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    note_type VARCHAR(50) NOT NULL CHECK (note_type IN ('assessment', 'meeting', 'recommendation', 'progress', 'other')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_shared_with_parent BOOLEAN DEFAULT 0,
    is_shared_with_student BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS student_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    action_plan_id INTEGER,
    milestone_type VARCHAR(50) NOT NULL,
    milestone_description TEXT NOT NULL,
    target_date DATE,
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    notes TEXT,
    recorded_by INTEGER, -- who recorded this progress
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Communication log (messages between users)
CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'message' CHECK (message_type IN ('message', 'notification', 'reminder')),
    is_read BOOLEAN DEFAULT 0,
    parent_message_id INTEGER, -- for threading
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES communications(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_counselor_profiles_user_id ON counselor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON parent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_primary ON user_relationships(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_secondary ON user_relationships(secondary_user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_token ON assessment_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_session_id ON assessment_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_career_recommendations_user_id ON career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_counselor_notes_counselor_id ON counselor_notes(counselor_id);
CREATE INDEX IF NOT EXISTS idx_counselor_notes_student_id ON counselor_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_communications_from_user ON communications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_communications_to_user ON communications(to_user_id);
      `;
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        await this.run(statement);
      }

      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   */
  static getDatabase(): sqlite3.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Run a SQL statement (INSERT, UPDATE, DELETE, CREATE, etc.)
   */
  static async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ SQL Error:', err.message);
          console.error('❌ SQL Statement:', sql);
          console.error('❌ Parameters:', params);
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  /**
   * Get a single row
   */
  static async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ SQL Error:', err.message);
          console.error('❌ SQL Statement:', sql);
          console.error('❌ Parameters:', params);
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  /**
   * Get multiple rows
   */
  static async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ SQL Error:', err.message);
          console.error('❌ SQL Statement:', sql);
          console.error('❌ Parameters:', params);
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  /**
   * Execute multiple statements in a transaction
   */
  static async transaction(statements: Array<{ sql: string; params?: any[] }>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.serialize(() => {
        this.db!.run('BEGIN TRANSACTION');

        let completed = 0;
        let hasError = false;

        const complete = () => {
          completed++;
          if (completed === statements.length && !hasError) {
            this.db!.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          }
        };

        const rollback = (error: Error) => {
          if (!hasError) {
            hasError = true;
            this.db!.run('ROLLBACK', () => {
              reject(error);
            });
          }
        };

        for (const statement of statements) {
          this.db!.run(statement.sql, statement.params || [], function(err) {
            if (err) {
              rollback(err);
            } else {
              complete();
            }
          });
        }
      });
    });
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database connection closed');
          this.db = null;
          this.isInitialized = false;
          resolve();
        }
      });
    });
  }

  /**
   * Check if database is initialized
   */
  static isReady(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<any> {
    try {
      const tables = await this.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);

      const stats: any = {
        tables: {},
        totalTables: tables.length
      };

      for (const table of tables as any[]) {
        const count = await this.get(`SELECT COUNT(*) as count FROM ${table.name}`);
        stats.tables[table.name] = (count as any)?.count || 0;
      }

      return stats;
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      return { error: 'Failed to get stats' };
    }
  }
}