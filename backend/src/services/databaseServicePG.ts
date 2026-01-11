import { Pool } from 'pg';

export class DatabaseServicePG {
  private static pool: Pool | null = null;
  private static isInitialized = false;

  /**
   * Initialize PostgreSQL connection pool
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // console.log('🔧 Starting PostgreSQL database initialization...');
    
    try {
      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is required for PostgreSQL');
      }

      // console.log('🗄️ Connecting to PostgreSQL database...');

      // Create connection pool with better settings for Render
      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }, // Always use SSL for Render
        max: 5, // Reduced pool size for better stability
        idleTimeoutMillis: 60000, // Longer idle timeout
        connectionTimeoutMillis: 10000, // Longer connection timeout
        statement_timeout: 30000, // 30 second statement timeout
        query_timeout: 30000, // 30 second query timeout
      });

      // Test connection with retry logic
      let retries = 3;
      let connected = false;
      
      while (retries > 0 && !connected) {
        try {
          const client = await this.pool.connect();
          // console.log('✅ Connected to PostgreSQL database successfully');
          client.release();
          connected = true;
        } catch (error) {
          retries--;
          // console.log(`⚠️ Connection attempt failed, ${retries} retries left...`);
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }

      // Create tables with better error handling
      await this.createTablesGradually();

      this.isInitialized = true;
      // console.log('✅ PostgreSQL database initialized successfully');
    } catch (error) {
      // console.error('❌ PostgreSQL database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables gradually to avoid connection issues
   */
  private static async createTablesGradually(): Promise<void> {
    try {
      // console.log('🔧 Creating PostgreSQL database tables gradually...');
      
      // Create tables in smaller groups to avoid connection reset
      const tableGroups = [
        // Group 1: Core user tables
        `
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
        `,
        
        // Group 2: Profile tables
        `
        CREATE TABLE IF NOT EXISTS student_profiles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            grade INTEGER,
            school_name VARCHAR(200),
            zip_code VARCHAR(10),
            interests TEXT,
            skills TEXT,
            education_goal VARCHAR(50),
            work_environment VARCHAR(50),
            gpa DECIMAL(3,2),
            extracurricular_activities TEXT,
            career_aspirations TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS counselor_profiles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            school_district VARCHAR(200),
            specializations TEXT,
            years_experience INTEGER,
            license_number VARCHAR(100),
            bio TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS parent_profiles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            occupation VARCHAR(200),
            education_level VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `,
        
        // Group 3: Assessment tables
        `
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

        CREATE TABLE IF NOT EXISTS assessment_answers (
            id SERIAL PRIMARY KEY,
            session_id INTEGER NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
            question_id VARCHAR(50) NOT NULL,
            answer TEXT NOT NULL,
            answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `,
        
        // Group 4: Career and action plan tables
        `
        CREATE TABLE IF NOT EXISTS career_recommendations (
            id SERIAL PRIMARY KEY,
            session_id INTEGER REFERENCES assessment_sessions(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            career_matches TEXT NOT NULL,
            ai_recommendations TEXT,
            local_job_market TEXT,
            academic_plan TEXT,
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS action_plans (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            career_code VARCHAR(50) NOT NULL,
            career_title VARCHAR(200) NOT NULL,
            short_term_goals TEXT,
            medium_term_goals TEXT,
            long_term_goals TEXT,
            skill_gaps TEXT,
            action_items TEXT,
            progress_notes TEXT,
            created_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS recommendation_feedback (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            session_id INTEGER REFERENCES assessment_sessions(id) ON DELETE CASCADE,
            recommendation_id INTEGER REFERENCES career_recommendations(id) ON DELETE CASCADE,
            career_code VARCHAR(50) NOT NULL,
            career_title VARCHAR(200) NOT NULL,
            feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'rating', 'comment')),
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            is_helpful BOOLEAN,
            comment TEXT,
            improvement_suggestions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ai_learning_data (
            id SERIAL PRIMARY KEY,
            user_profile TEXT NOT NULL,
            original_recommendation TEXT NOT NULL,
            feedback_summary TEXT NOT NULL,
            improvement_notes TEXT,
            feedback_score DECIMAL(3,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `,
        
        // Group 5: Relationship and counselor functionality tables
        `
        CREATE TABLE IF NOT EXISTS user_relationships (
            id SERIAL PRIMARY KEY,
            primary_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            secondary_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('parent_child', 'counselor_student')),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
            created_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(primary_user_id, secondary_user_id, relationship_type)
        );

        CREATE TABLE IF NOT EXISTS counselor_notes (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            counselor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            note_type VARCHAR(30) NOT NULL,
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            is_shared_with_parent BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Add constraint separately to ensure proper creation
        DO $$ 
        BEGIN
            -- Drop constraint if it exists (in case of schema updates)
            ALTER TABLE counselor_notes DROP CONSTRAINT IF EXISTS counselor_notes_note_type_check;
            
            -- Add the constraint with explicit definition
            ALTER TABLE counselor_notes 
            ADD CONSTRAINT counselor_notes_note_type_check 
            CHECK (note_type IN ('general', 'career_guidance', 'academic', 'personal', 'parent_communication'));
            
        EXCEPTION 
            WHEN OTHERS THEN 
                -- Log the error but don't fail the entire schema creation
                RAISE NOTICE 'Could not create counselor_notes constraint: %', SQLERRM;
        END $$;

        CREATE TABLE IF NOT EXISTS student_assignments (
            id SERIAL PRIMARY KEY,
            counselor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            assignment_type VARCHAR(30) NOT NULL CHECK (assignment_type IN ('assessment', 'career_research', 'skill_development', 'course_planning')),
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            due_date TIMESTAMP,
            status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `
      ];
      
      // Create tables group by group with delays
      for (let i = 0; i < tableGroups.length; i++) {
        // console.log(`🔧 Creating table group ${i + 1}/${tableGroups.length}...`);
        await this.query(tableGroups[i]);
        // console.log(`✅ Table group ${i + 1} created successfully`);
        
        // Small delay between groups to avoid overwhelming the connection
        if (i < tableGroups.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Create indexes separately
      // console.log('🔧 Creating database indexes...');
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
        'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);',
        'CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_id ON assessment_sessions(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_assessment_sessions_token ON assessment_sessions(session_token);',
        'CREATE INDEX IF NOT EXISTS idx_assessment_answers_session_id ON assessment_answers(session_id);'
      ];
      
      for (const index of indexes) {
        await this.query(index);
      }
      
      // console.log('✅ PostgreSQL database tables and indexes created successfully');
    } catch (error) {
      // console.error('❌ Error creating PostgreSQL tables:', error);
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
      // console.error('❌ PostgreSQL Query Error:', error);
      // console.error('❌ SQL Statement:', text);
      // console.error('❌ Parameters:', params);
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
      // console.log('✅ PostgreSQL connection pool closed');
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
      // console.error('❌ Error getting PostgreSQL database stats:', error);
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