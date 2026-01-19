#!/usr/bin/env node

/**
 * Create the missing student_assignments table in SQLite
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function createAssignmentsTable() {
  console.log('🔧 Creating student_assignments table in SQLite');
  console.log('=' .repeat(50));

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

    // Create the student_assignments table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS student_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          counselor_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          assignment_type VARCHAR(30) NOT NULL CHECK (assignment_type IN ('assessment', 'career_research', 'skill_development', 'course_planning')),
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          due_date DATETIME,
          status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
        db.close();
        reject(err);
        return;
      }

      console.log('✅ student_assignments table created successfully');

      // Create indexes
      const createIndexes = [
        'CREATE INDEX IF NOT EXISTS idx_student_assignments_counselor_id ON student_assignments(counselor_id)',
        'CREATE INDEX IF NOT EXISTS idx_student_assignments_student_id ON student_assignments(student_id)'
      ];

      let indexesCreated = 0;
      const totalIndexes = createIndexes.length;

      createIndexes.forEach((indexSQL, i) => {
        db.run(indexSQL, (err) => {
          if (err) {
            console.error(`❌ Error creating index ${i + 1}:`, err.message);
          } else {
            console.log(`✅ Index ${i + 1} created successfully`);
          }
          
          indexesCreated++;
          if (indexesCreated === totalIndexes) {
            // Test the table
            db.get('SELECT COUNT(*) as count FROM student_assignments', (err, row) => {
              if (err) {
                console.error('❌ Error testing table:', err.message);
              } else {
                console.log(`✅ Table test successful, current count: ${row.count}`);
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
          }
        });
      });
    });
  });
}

createAssignmentsTable().catch(console.error);