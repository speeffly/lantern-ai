#!/usr/bin/env node

/**
 * Debug script for student assignments 500 error
 */

const { DatabaseAdapter } = require('./backend/src/services/databaseAdapter');

async function debugStudentAssignments() {
  console.log('🔍 Debugging Student Assignments 500 Error');
  console.log('=' .repeat(50));

  try {
    // Check if database connection works
    console.log('1. Testing database connection...');
    const testQuery = await DatabaseAdapter.get('SELECT 1 as test');
    console.log('✅ Database connection works:', testQuery);

    // Check if student_assignments table exists
    console.log('\n2. Checking if student_assignments table exists...');
    const tableExists = await DatabaseAdapter.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='student_assignments'
    `);
    
    if (tableExists) {
      console.log('✅ student_assignments table exists');
      
      // Check table structure
      console.log('\n3. Checking table structure...');
      const tableInfo = await DatabaseAdapter.all('PRAGMA table_info(student_assignments)');
      console.log('📋 Table columns:', tableInfo);
      
      // Check if there are any assignments
      console.log('\n4. Checking assignment count...');
      const count = await DatabaseAdapter.get('SELECT COUNT(*) as count FROM student_assignments');
      console.log('📊 Total assignments:', count.count);
      
      // Check if users table exists (for JOIN)
      console.log('\n5. Checking users table...');
      const usersTable = await DatabaseAdapter.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='users'
      `);
      
      if (usersTable) {
        console.log('✅ users table exists');
        
        // Test the actual query from the API
        console.log('\n6. Testing the API query...');
        const testStudentId = 1; // Use a test student ID
        const assignments = await DatabaseAdapter.all(`
          SELECT 
            sa.*,
            u.first_name as counselor_first_name,
            u.last_name as counselor_last_name,
            u.email as counselor_email
          FROM student_assignments sa
          LEFT JOIN users u ON sa.counselor_id = u.id
          WHERE sa.student_id = ?
          ORDER BY sa.created_at DESC
        `, [testStudentId]);
        
        console.log('✅ API query works, returned:', assignments.length, 'assignments');
        if (assignments.length > 0) {
          console.log('📝 Sample assignment:', assignments[0]);
        }
      } else {
        console.log('❌ users table does not exist - this could cause JOIN issues');
      }
      
    } else {
      console.log('❌ student_assignments table does not exist!');
      console.log('\n📋 Available tables:');
      const tables = await DatabaseAdapter.all(`
        SELECT name FROM sqlite_master WHERE type='table'
      `);
      tables.forEach(table => console.log(`  - ${table.name}`));
      
      console.log('\n🔧 Need to create student_assignments table');
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error);
    console.error('Stack trace:', error.stack);
  }
}

debugStudentAssignments().catch(console.error);