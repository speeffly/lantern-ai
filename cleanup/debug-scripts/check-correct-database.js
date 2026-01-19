#!/usr/bin/env node

/**
 * Check the correct SQLite database that the backend is using
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkCorrectDatabase() {
  console.log('🔍 Checking the correct SQLite database');
  console.log('=' .repeat(50));

  const dbPath = path.join(__dirname, 'backend', 'data', 'lantern_ai.db');
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

    // Check all tables
    db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
      if (err) {
        console.error('❌ Error listing tables:', err.message);
        db.close();
        reject(err);
        return;
      }

      console.log('\n📋 Available tables:');
      tables.forEach(table => console.log(`  - ${table.name}`));

      // Check if student_assignments table exists
      const hasAssignmentsTable = tables.some(table => table.name === 'student_assignments');
      const hasUsersTable = tables.some(table => table.name === 'users');

      console.log(`\n✅ student_assignments table: ${hasAssignmentsTable ? 'EXISTS' : 'MISSING'}`);
      console.log(`✅ users table: ${hasUsersTable ? 'EXISTS' : 'MISSING'}`);

      if (hasUsersTable) {
        // Check users count
        db.get('SELECT COUNT(*) as count FROM users', (err, userCount) => {
          if (err) {
            console.error('❌ Error counting users:', err.message);
          } else {
            console.log(`📊 Total users: ${userCount.count}`);
          }

          if (hasAssignmentsTable) {
            // Check assignments count
            db.get('SELECT COUNT(*) as count FROM student_assignments', (err, assignmentCount) => {
              if (err) {
                console.error('❌ Error counting assignments:', err.message);
              } else {
                console.log(`📊 Total assignments: ${assignmentCount.count}`);
              }

              // Test the API query
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
            });
          } else {
            console.log('❌ student_assignments table missing - need to create it');
            db.close();
            resolve();
          }
        });
      } else {
        console.log('❌ users table missing - database not initialized properly');
        db.close();
        resolve();
      }
    });
  });
}

checkCorrectDatabase().catch(console.error);