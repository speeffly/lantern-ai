#!/usr/bin/env node

/**
 * Check SQLite database for student_assignments table
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkSQLiteAssignments() {
  console.log('🔍 Checking SQLite database for student_assignments table');
  console.log('=' .repeat(60));

  const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
  console.log('Database path:', dbPath);

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
    });

    // Check if student_assignments table exists
    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='student_assignments'`, (err, row) => {
      if (err) {
        console.error('❌ Error checking table:', err.message);
        db.close();
        reject(err);
        return;
      }

      if (row) {
        console.log('✅ student_assignments table exists');
        
        // Check table structure
        db.all('PRAGMA table_info(student_assignments)', (err, columns) => {
          if (err) {
            console.error('❌ Error getting table info:', err.message);
            db.close();
            reject(err);
            return;
          }
          
          console.log('\n📋 Table structure:');
          columns.forEach(col => {
            console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
          });
          
          // Check if there are any assignments
          db.get('SELECT COUNT(*) as count FROM student_assignments', (err, countRow) => {
            if (err) {
              console.error('❌ Error counting assignments:', err.message);
              db.close();
              reject(err);
              return;
            }
            
            console.log(`\n📊 Total assignments: ${countRow.count}`);
            
            // Check if users table exists (for JOIN)
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`, (err, usersRow) => {
              if (err) {
                console.error('❌ Error checking users table:', err.message);
                db.close();
                reject(err);
                return;
              }
              
              if (usersRow) {
                console.log('✅ users table exists');
                
                // Test the actual query from the API
                const testQuery = `
                  SELECT 
                    sa.*,
                    u.first_name as counselor_first_name,
                    u.last_name as counselor_last_name,
                    u.email as counselor_email
                  FROM student_assignments sa
                  LEFT JOIN users u ON sa.counselor_id = u.id
                  WHERE sa.student_id = ?
                  ORDER BY sa.created_at DESC
                `;
                
                db.all(testQuery, [1], (err, assignments) => {
                  if (err) {
                    console.error('❌ Error testing API query:', err.message);
                    console.error('Query:', testQuery);
                  } else {
                    console.log(`✅ API query test successful, returned ${assignments.length} assignments`);
                  }
                  
                  db.close((err) => {
                    if (err) {
                      console.error('❌ Error closing database:', err.message);
                    } else {
                      console.log('✅ Database connection closed');
                    }
                    resolve();
                  });
                });
              } else {
                console.log('❌ users table does not exist');
                db.close();
                resolve();
              }
            });
          });
        });
      } else {
        console.log('❌ student_assignments table does not exist');
        
        // List all tables
        db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
          if (err) {
            console.error('❌ Error listing tables:', err.message);
          } else {
            console.log('\n📋 Available tables:');
            tables.forEach(table => console.log(`  - ${table.name}`));
          }
          
          db.close();
          resolve();
        });
      }
    });
  });
}

checkSQLiteAssignments().catch(console.error);