import { DatabaseService } from './databaseService';
import { DatabaseServicePG } from './databaseServicePG';

/**
 * Database Adapter - Automatically chooses between SQLite and PostgreSQL
 * Based on environment variables and availability
 */
export class DatabaseAdapter {
  private static usePostgreSQL = false;
  private static isInitialized = false;

  /**
   * Initialize the appropriate database service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔧 Initializing database adapter...');

    // Check if PostgreSQL is configured
    const databaseUrl = process.env.DATABASE_URL;
    const forcePostgreSQL = process.env.USE_POSTGRESQL === 'true';

    if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://') || forcePostgreSQL)) {
      console.log('🐘 Using PostgreSQL database');
      this.usePostgreSQL = true;
      await DatabaseServicePG.initialize();
    } else {
      console.log('🗄️ Using SQLite database');
      this.usePostgreSQL = false;
      await DatabaseService.initialize();
    }

    this.isInitialized = true;
    console.log('✅ Database adapter initialized successfully');
  }

  /**
   * Get a single row
   */
  static async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (this.usePostgreSQL) {
      // Convert SQLite syntax to PostgreSQL if needed
      const pgSql = this.convertSqlToPostgreSQL(sql);
      // console.log('🔄 SQL Conversion:', { original: sql, converted: pgSql, params });
      return DatabaseServicePG.get<T>(pgSql, params);
    } else {
      return DatabaseService.get<T>(sql, params);
    }
  }

  /**
   * Get multiple rows
   */
  static async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (this.usePostgreSQL) {
      const pgSql = this.convertSqlToPostgreSQL(sql);
      // console.log('🔄 SQL Conversion:', { original: sql, converted: pgSql, params });
      return DatabaseServicePG.all<T>(pgSql, params);
    } else {
      return DatabaseService.all<T>(sql, params);
    }
  }

  /**
   * Execute INSERT/UPDATE/DELETE
   */
  static async run(sql: string, params: any[] = []): Promise<any> {
    if (this.usePostgreSQL) {
      const pgSql = this.convertSqlToPostgreSQL(sql);
      // console.log('🔄 SQL Conversion:', { original: sql, converted: pgSql, params });
      
      // Handle INSERT statements to return lastID for compatibility
      if (pgSql.trim().toLowerCase().startsWith('insert')) {
        // Add RETURNING id if not already present
        let insertSql = pgSql;
        if (!insertSql.toLowerCase().includes('returning')) {
          insertSql = insertSql.replace(/;?\s*$/, ' RETURNING id;');
        }
        
        const result = await DatabaseServicePG.get<{ id: number }>(insertSql, params);
        return {
          rowCount: 1,
          lastID: result?.id || 0,
          insertId: result?.id || 0
        };
      } else {
        // For UPDATE/DELETE operations
        const result = await DatabaseServicePG.run(pgSql, params);
        return {
          rowCount: result.rowCount || 0,
          changes: result.rowCount || 0
        };
      }
    } else {
      return DatabaseService.run(sql, params);
    }
  }

  /**
   * Execute multiple statements in a transaction
   */
  static async transaction(statements: Array<{ sql: string; params?: any[] }>): Promise<void> {
    if (this.usePostgreSQL) {
      const pgStatements = statements.map(stmt => ({
        sql: this.convertSqlToPostgreSQL(stmt.sql),
        params: stmt.params
      }));
      return DatabaseServicePG.transaction(pgStatements);
    } else {
      return DatabaseService.transaction(statements);
    }
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (this.usePostgreSQL) {
      await DatabaseServicePG.close();
    } else {
      await DatabaseService.close();
    }
    this.isInitialized = false;
  }

  /**
   * Check if database is ready
   */
  static isReady(): boolean {
    if (this.usePostgreSQL) {
      return DatabaseServicePG.isReady();
    } else {
      return DatabaseService.isReady();
    }
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<any> {
    if (this.usePostgreSQL) {
      return DatabaseServicePG.getStats();
    } else {
      return DatabaseService.getStats();
    }
  }

  /**
   * Get database type info
   */
  static getDatabaseInfo(): { type: string; ready: boolean; connectionInfo?: any } {
    return {
      type: this.usePostgreSQL ? 'PostgreSQL' : 'SQLite',
      ready: this.isReady(),
      connectionInfo: this.usePostgreSQL ? DatabaseServicePG.getPoolInfo() : undefined
    };
  }

  /**
   * Convert SQLite-specific SQL to PostgreSQL-compatible SQL
   */
  private static convertSqlToPostgreSQL(sql: string): string {
    let pgSql = sql;

    // Convert SQLite parameter placeholders (?) to PostgreSQL ($1, $2, etc.)
    let paramIndex = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

    // Convert SQLite AUTOINCREMENT to PostgreSQL SERIAL (handled in schema)
    // Convert SQLite datetime functions
    pgSql = pgSql.replace(/datetime\(([^)]+)\)/g, 'to_timestamp($1)');
    pgSql = pgSql.replace(/CURRENT_TIMESTAMP/g, 'CURRENT_TIMESTAMP');
    
    // Convert SQLite LIMIT syntax (already compatible)
    // Convert SQLite boolean values in WHERE clauses
    pgSql = pgSql.replace(/= 1(?=\s|$)/g, '= true');
    pgSql = pgSql.replace(/= 0(?=\s|$)/g, '= false');
    
    // Convert SQLite string concatenation
    pgSql = pgSql.replace(/\|\|/g, '||'); // Already compatible
    
    return pgSql;
  }

  /**
   * Insert with returning ID (handles differences between SQLite and PostgreSQL)
   */
  static async insertWithId(sql: string, params: any[] = []): Promise<number> {
    if (this.usePostgreSQL) {
      // Use the run method which handles RETURNING id properly
      const result = await this.run(sql, params);
      return result.lastID || result.insertId || 0;
    } else {
      const result = await DatabaseService.run(sql, params);
      return result.lastID || 0;
    }
  }

  /**
   * Migrate data from SQLite to PostgreSQL (if needed)
   */
  static async migrateFromSQLite(sqliteDbPath: string): Promise<void> {
    if (!this.usePostgreSQL) {
      throw new Error('Migration only available when using PostgreSQL');
    }

    console.log('🔄 Starting migration from SQLite to PostgreSQL...');
    
    // This would implement data migration logic
    // For now, we'll just log that migration is available
    console.log('📊 Migration functionality available - implement as needed');
  }
}