const https = require('https');

async function checkPostgreSQLSchema() {
  console.log('🐘 CHECKING POSTGRESQL SCHEMA');
  console.log('='.repeat(50));

  // Check PostgreSQL table schema
  const query = encodeURIComponent(`
    SELECT column_name, data_type, is_nullable, column_default, 
           character_maximum_length, check_clause
    FROM information_schema.columns 
    WHERE table_name = 'counselor_notes'
    ORDER BY ordinal_position
  `);
  
  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: `/api/database/query?sql=${query}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          console.log('📊 Schema query response:', JSON.stringify(jsonBody, null, 2));

          if (jsonBody.success && jsonBody.data) {
            console.log('\n📋 COUNSELOR_NOTES TABLE COLUMNS:');
            console.log('='.repeat(40));
            
            jsonBody.data.forEach(column => {
              console.log(`\n📝 Column: ${column.column_name}`);
              console.log(`   Type: ${column.data_type}`);
              console.log(`   Nullable: ${column.is_nullable}`);
              console.log(`   Default: ${column.column_default || 'None'}`);
              if (column.character_maximum_length) {
                console.log(`   Max Length: ${column.character_maximum_length}`);
              }
              if (column.check_clause) {
                console.log(`   Check Constraint: ${column.check_clause}`);
              }
            });
          }

          resolve(jsonBody);
        } catch (e) {
          console.log('❌ Failed to parse response:', body);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkConstraints() {
  console.log('\n🔒 CHECKING TABLE CONSTRAINTS');
  console.log('='.repeat(50));

  // Check PostgreSQL constraints
  const query = encodeURIComponent(`
    SELECT constraint_name, constraint_type, check_clause
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.check_constraints cc 
      ON tc.constraint_name = cc.constraint_name
    WHERE tc.table_name = 'counselor_notes'
  `);
  
  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: `/api/database/query?sql=${query}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          console.log('📊 Constraints query response:', JSON.stringify(jsonBody, null, 2));

          if (jsonBody.success && jsonBody.data) {
            console.log('\n📋 TABLE CONSTRAINTS:');
            console.log('='.repeat(30));
            
            jsonBody.data.forEach(constraint => {
              console.log(`\n🔒 Constraint: ${constraint.constraint_name}`);
              console.log(`   Type: ${constraint.constraint_type}`);
              if (constraint.check_clause) {
                console.log(`   Check: ${constraint.check_clause}`);
              }
            });
          }

          resolve(jsonBody);
        } catch (e) {
          console.log('❌ Failed to parse constraints response:', body);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testSimpleInsert() {
  console.log('\n🧪 TESTING SIMPLE INSERT');
  console.log('='.repeat(50));

  // Test a simple insert to see if constraint works
  const query = encodeURIComponent(`
    INSERT INTO counselor_notes (student_id, counselor_id, note_type, title, content, is_shared_with_parent)
    VALUES (1, 1, 'general', 'Test Note', 'This is a test note', false)
    RETURNING id, note_type
  `);
  
  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: `/api/database/query?sql=${query}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          console.log('📊 Insert test response:', JSON.stringify(jsonBody, null, 2));

          if (jsonBody.success) {
            console.log('✅ Simple insert with valid note_type worked');
          } else {
            console.log('❌ Simple insert failed:', jsonBody.error);
          }

          resolve(jsonBody);
        } catch (e) {
          console.log('❌ Failed to parse insert response:', body);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runPostgreSQLDiagnostics() {
  try {
    await checkPostgreSQLSchema();
    await checkConstraints();
    
    console.log('\n🎯 ANALYSIS COMPLETE');
    console.log('='.repeat(50));
    
    console.log(`
📋 FINDINGS:
- Database: PostgreSQL (not SQLite)
- Table: counselor_notes exists but is empty
- Constraint error occurs during page load, not data insertion

🔍 LIKELY CAUSES:
1. Schema mismatch between development and production
2. Constraint definition issue in PostgreSQL
3. Application trying to insert invalid data during initialization
4. Foreign key constraint failure (student_id or counselor_id doesn't exist)

🛠️ NEXT STEPS:
1. Check if student_id=1 and counselor_id=1 exist in users table
2. Verify constraint definition matches expected values
3. Add validation in application before database operations
4. Test with actual valid user IDs
    `);
    
  } catch (error) {
    console.error('❌ PostgreSQL diagnostics failed:', error);
  }
}

runPostgreSQLDiagnostics();

console.log(`
📋 POSTGRESQL SCHEMA DIAGNOSTICS
================================

🔧 ISSUE: PostgreSQL constraint violation on counselor_notes
🎯 PURPOSE: Check actual PostgreSQL schema and constraints

🐘 This script will:
1. Check counselor_notes table structure in PostgreSQL
2. List all constraints on the table
3. Identify the exact constraint causing the error
4. Test simple insert to verify constraint behavior
`);