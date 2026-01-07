const https = require('https');

// Check and fix invalid counselor_notes data
async function checkCounselorNotesData() {
  console.log('🔍 CHECKING COUNSELOR NOTES DATA');
  console.log('='.repeat(50));

  // Check what data exists in counselor_notes table
  const query = encodeURIComponent('SELECT id, note_type, title, created_at FROM counselor_notes ORDER BY created_at DESC LIMIT 10');
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
          console.log('📊 Query response status:', res.statusCode);
          console.log('📊 Query response:', JSON.stringify(jsonBody, null, 2));

          if (jsonBody.success && jsonBody.data) {
            console.log('\n📋 COUNSELOR NOTES DATA:');
            console.log('='.repeat(30));
            
            if (jsonBody.data.length === 0) {
              console.log('ℹ️ No counselor notes found in database');
            } else {
              jsonBody.data.forEach((note, index) => {
                console.log(`\n📝 Note ${index + 1}:`);
                console.log(`   ID: ${note.id}`);
                console.log(`   Note Type: "${note.note_type}"`);
                console.log(`   Title: ${note.title}`);
                console.log(`   Created: ${note.created_at}`);
                
                // Check if note_type is valid
                const validTypes = ['general', 'career_guidance', 'academic', 'personal', 'parent_communication'];
                const isValid = validTypes.includes(note.note_type);
                console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
                
                if (!isValid) {
                  console.log(`   🚨 INVALID NOTE TYPE: "${note.note_type}"`);
                }
              });
            }
          } else {
            console.log('❌ Failed to query counselor_notes:', jsonBody.error);
          }

          resolve(jsonBody);
        } catch (e) {
          console.log('❌ Failed to parse response:', body);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function checkDatabaseSchema() {
  console.log('\n🏗️ CHECKING DATABASE SCHEMA');
  console.log('='.repeat(50));

  // Check the actual table schema
  const schemaQuery = encodeURIComponent('SELECT sql FROM sqlite_master WHERE type=\'table\' AND name=\'counselor_notes\'');
  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: `/api/database/query?sql=${schemaQuery}`,
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

          if (jsonBody.success && jsonBody.data && jsonBody.data.length > 0) {
            console.log('\n📋 COUNSELOR_NOTES TABLE SCHEMA:');
            console.log('='.repeat(40));
            console.log(jsonBody.data[0].sql);
            
            // Check if it has the constraint
            const hasConstraint = jsonBody.data[0].sql.includes('CHECK');
            console.log(`\n🔍 Has CHECK constraint: ${hasConstraint ? '✅' : '❌'}`);
            
            if (hasConstraint) {
              const constraintMatch = jsonBody.data[0].sql.match(/CHECK\s*\([^)]+\)/i);
              if (constraintMatch) {
                console.log(`🔍 Constraint: ${constraintMatch[0]}`);
              }
            }
          } else {
            console.log('❌ Table not found or query failed');
          }

          resolve(jsonBody);
        } catch (e) {
          console.log('❌ Failed to parse schema response:', body);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Schema request error:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function suggestFix() {
  console.log('\n🛠️ SUGGESTED FIXES');
  console.log('='.repeat(50));
  
  console.log(`
📋 POSSIBLE CAUSES & SOLUTIONS:

1. 🗄️ INVALID DATA IN DATABASE:
   - Some counselor_notes have invalid note_type values
   - Solution: Update invalid records to 'general'
   - SQL: UPDATE counselor_notes SET note_type = 'general' WHERE note_type NOT IN ('general', 'career_guidance', 'academic', 'personal', 'parent_communication');

2. 🏗️ SCHEMA MISMATCH:
   - SQLite vs PostgreSQL constraint differences
   - Solution: Ensure consistent schema across environments
   - Check if using correct database adapter

3. 🔤 CASE SENSITIVITY:
   - PostgreSQL is case-sensitive for constraints
   - Solution: Ensure exact case match in frontend/backend
   - Frontend sends: 'general', 'career_guidance', etc.

4. 📝 DATA TYPE ISSUES:
   - note_type field receiving non-string values
   - Solution: Validate data types in backend
   - Ensure noteType is always a string

🎯 IMMEDIATE ACTIONS:
1. Check database for invalid note_type values
2. Update any invalid records to 'general'
3. Add validation in backend to prevent future issues
4. Test note creation with valid values only

🧪 TESTING:
1. Try creating a note with noteType: 'general'
2. Check if constraint error still occurs
3. Verify all existing notes have valid note_type values
`);
}

// Run all checks
async function runDiagnostics() {
  try {
    await checkCounselorNotesData();
    await checkDatabaseSchema();
    await suggestFix();
    
    console.log('\n✅ DIAGNOSTICS COMPLETE');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
  }
}

runDiagnostics();

console.log(`
📋 COUNSELOR NOTES CONSTRAINT DIAGNOSTICS
=========================================

🔧 ISSUE: "violates check constraint 'counselor_notes_note_type_check'"
🎯 PURPOSE: Identify and fix invalid data causing constraint violations

📝 Valid note_type values:
- 'general'
- 'career_guidance'
- 'academic'
- 'personal'
- 'parent_communication'

🔍 This script will:
1. Check existing counselor_notes data
2. Identify any invalid note_type values
3. Show database schema and constraints
4. Suggest specific fixes for the issue

⚠️ If invalid data is found, you'll need to clean it up before the constraint error stops occurring.
`);