import { Pool, Client } from 'pg';

export class DatabaseServicePG {
  private static pool: Pool | null = null;
  private static isInitialized = false;

  /**
   * Initialize PostgreSQL connection pool
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔧 Starting PostgreSQL database initialization...');
    
    try {
      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is required for PostgreSQL');
      }

      console.log('🗄️ Connecting to PostgreSQL database...');

      // Create connection pool
      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      });

      // Test connection
      const client = await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database successfully');
      client.release();

      // Create tables
      await this.createTables();

      this.isInitialized = true;
      console.log('✅ PostgreSQL database initialized successfully');
    } catch (error) {
      console.error('❌ PostgreSQL database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables with PostgreSQL syntax
   */
  private static async createTables(): Promise<void> {
    try {
      console.log('🔧 Creating PostgreSQL database tables...');
      
      const schema = `
        -- Users table (students, counselors, parents)
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'counselor', 'parent')),
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT true
        );

        -- Student profiles
        CREATE TABLE IF NOT EXISTS student_profiles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Counselor profiles
        CREATE TABLE IF NOT EXISTS counselor_profiles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            school_district VARCHAR(200),
            specializations TEXT, -- JSON array of specializations
            years_experience INTEGER,
            license_number VARCHAR(100),
            bio TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Parent profiles
        CREATE TABLE IF NOT EXISTS parent_profiles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            occupation VARCHAR(200),
            education_level VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Relationships between users
        CREATE TABLE IF NOT EXISTS user_relationships (
            id SERIAL PRIMARY KEY,
            primary_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            secondary_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('parent_child', 'counselor_student')),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER REFERENCES users(id),
            UNIQUE(primary_user_id, secondary_user_id, relationship_type)
        );

        -- Assessment sessions
        CREATE TABLE IF NOT EXISTS assessment_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            zip_code VARCHAR(10),
            status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            expires_at TIMESTAMP NOT NULL
        );

        -- Assessment answers
        CREATE TABLE IF NOT EXISTS assessment_answers (
            id SERIAL PRIMARY KEY,
            session_id INTEGER NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
            question_id VARCHAR(50) NOT NULL,
            answer TEXT NOT NULL,
            answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Career matches and recommendations
        CREATE TABLE IF NOT EXISTS career_recommendations (
            id SERIAL PRIMARY KEY,
            session_id INTEGER REFERENCES assessment_sessions(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            career_matches TEXT NOT NULL, -- JSON array of career matches
            ai_recommendations TEXT, -- JSON object with AI recommendations
            local_job_market TEXT, -- JSON object with local job data
            academic_plan TEXT, -- JSON object with course recommendations
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Action plans
        CREATE TABLE IF NOT EXISTS action_plans (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            career_code VARCHAR(50) NOT NULL,
            career_title VARCHAR(200) NOT NULL,
            short_term_goals TEXT, -- JSON array
            medium_term_goals TEXT, -- JSON array
            long_term_goals TEXT, -- JSON array
            skill_gaps TEXT, -- JSON array
            action_items TEXT, -- JSON array
            progress_notes TEXT, -- JSON array of progress updates
            created_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Counselor notes
        CREATE TABLE IF NOT EXISTS counselor_notes (
            id SERIAL PRIMARY KEY,
            counselor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            note_type VARCHAR(50) NOT NULL CHECK (note_type IN ('assessment', 'meeting', 'recommendation', 'progress', 'other')),
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            is_shared_with_parent BOOLEAN DEFAULT false,
            is_shared_with_student BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Progress tracking
        CREATE TABLE IF NOT EXISTS student_progress (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            action_plan_id INTEGER REFERENCES action_plans(id) ON DELETE SET NULL,
            milestone_type VARCHAR(50) NOT NULL,
            milestone_description TEXT NOT NULL,
            target_date DATE,
            completion_date DATE,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
            notes TEXT,
            recorded_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Communication log
        CREATE TABLE IF NOT EXISTS communications (
            id SERIAL PRIMARY KEY,
            from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            subject VARCHAR(200),
            message TEXT NOT NULL,
            message_type VARCHAR(20) DEFAULT 'message' CHECK (message_type IN ('message', 'notification', 'reminder')),
            is_read BOOLEAN DEFAULT false,
            parent_message_id INTEGER REFERENCES communications(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      
      // Execute schema creation
      await this.query(schema);
      
      console.log('✅ PostgreSQL database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating PostgreSQL tables:', error);
      throw error;
    }
  }

  /**
   * Execute a query with parameters
   */
  static async query(text: string, params: any[] = []): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('❌ PostgreSQL Query Error:', error);
      console.error('❌ SQL Statement:', text);
      console.error('❌ Parameters:', params);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a single row
   */
  static async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const result = await this.query(sql, params);
    return result.rows[0] as T;
  }

  /**
   * Get multiple rows
   */
  static async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.query(sql, params);
    return result.rows as T[];
  }

  /**
   * Execute INSERT/UPDATE/DELETE and return result info
   */
  static async run(sql: string, params: any[] = []): Promise<{ rowCount: number; insertId?: number }> {
    const result = await this.query(sql, params);
    return {
      rowCount: result.rowCount || 0,
      insertId: result.rows[0]?.id // For INSERT with RETURNING id
    };
  }

  /**
   * Execute multiple statements in a transaction
   */
  static async transaction(statements: Array<{ sql: string; params?: any[] }>): Promise<void> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const statement of statements) {
        await client.query(statement.sql, statement.params || []);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close database connection pool
   */
  static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ PostgreSQL connection pool closed');
      this.pool = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if database is initialized
   */
  static isReady(): boolean {
    return this.isInitialized && this.pool !== null;
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<any> {
    try {
      const tables = await this.all(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      const stats: any = {
        tables: {},
        totalTables: tables.length
      };

      for (const table of tables as any[]) {
        const count = await this.get(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        stats.tables[table.table_name] = (count as any)?.count || 0;
      }

      return stats;
    } catch (error) {
      console.error('❌ Error getting PostgreSQL database stats:', error);
      return { error: 'Failed to get stats' };
    }
  }

  /**
   * Get connection pool info
   */
  static getPoolInfo(): any {
    if (!this.pool) {
      return { error: 'Pool not initialized' };
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}