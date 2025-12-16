import sqlite3 from 'sqlite3';
import { promisify } from 'util';
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
      // Create database directory if it doesn't exist
      const dbDir = path.join(__dirname, '../../data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const dbPath = path.join(dbDir, 'lantern_ai.db');
      console.log('🗄️ Initializing database at:', dbPath);

      // Create database connection
      this.db = new sqlite.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err);
          throw err;
        }
        console.log('✅ Connected to SQLite database');
      });

      // Enable foreign keys
      await this.run('PRAGMA foreign_keys = ON');

      // Create tables from schema
      await this.createTables();

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables from schema file
   */
  private static async createTables(): Promise<void> {
    try {
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
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