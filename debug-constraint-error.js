const https = require('https');

// Test the exact constraint error by trying different approaches
async function debugConstraintError() {
  console.log('🔍 DEBUGGING CONSTRAINT ERROR');
  console.log('='.repeat(50));

  // Test 1: Check if we can query the table structure
  console.log('\n1️⃣ TESTING TABLE STRUCTURE');
  await testTableStructure();

  // Test 2: Try a simple valid insert
  console.log('\n2️⃣ TESTING VALID INSERT');
  await testValidInsert();

  // Test 3: Try an invalid insert to see the exact error
  console.log('\n3️⃣ TESTING INVALID INSERT');
  await testInvalidInsert();

  // Test 4: Check if there are any existing invalid records
  console.log('\n4️⃣ CHECKING EXISTING DATA');
  await checkExistingData();
}

async function testTableStructure() {
  const query = encodeURIComponent(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'counselor_notes' 
    ORDER BY ordinal_position
  `);
  
  try {
    const result = await makeQuery(query);
    if (result.success) {
      console.log('✅ Table structure query successful');
      result.data.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('❌ Table structure query failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Table structure error:', error.message);
  }
}

async function testValidInsert() {
  // Try inserting with a valid note_type
  const query = encodeURIComponent(`
    INSERT INTO counselor_notes (student_id, counselor_id, note_type, title, content, is_shared_with_parent)
    VALUES (999, 999, 'general', 'Test Note', 'Test content', false)
    RETURNING id, note_type
  `);
  
  try {
    const result = await makeQuery(query);
    if (result.success) {
      console.log('✅ Valid insert successful:', result.data);
    } else {
      console.log('❌ Valid insert failed:', result.error);
      
      // Check if it's a foreign key error vs constraint error
      if (result.error.includes('foreign key')) {
        console.log('🔍 This is a foreign key error - users 999 don\'t exist');
      } else if (result.error.includes('check constraint')) {
        console.log('🔍 This is the constraint error we\'re investigating');
      }
    }
  } catch (error) {
    console.log('❌ Valid insert error:', error.message);
  }
}

async function testInvalidInsert() {
  // Try inserting with an invalid note_type to see the exact constraint
  const query = encodeURIComponent(`
    INSERT INTO counselor_notes (student_id, counselor_id, note_type, title, content, is_shared_with_parent)
    VALUES (999, 999, 'invalid_type', 'Test Note', 'Test content', false)
    RETURNING id, note_type
  `);
  
  try {
    const result = await makeQuery(query);
    if (result.success) {
      console.log('⚠️ Invalid insert unexpectedly successful:', result.data);
    } else {
      console.log('✅ Invalid insert correctly failed:', result.error);
      
      // Parse the constraint error to understand the exact constraint
      if (result.error.includes('counselor_notes_note_type_check')) {
        console.log('🎯 Found the exact constraint: counselor_notes_note_type_check');
        
        // Extract the constraint details from the error message
        const constraintMatch = result.error.match(/CHECK.*?\)/i);
        if (constraintMatch) {
          console.log('🔍 Constraint definition:', constraintMatch[0]);
        }
      }
    }
  } catch (error) {
    console.log('❌ Invalid insert error:', error.message);
  }
}

async function checkExistingData() {
  const query = encodeURIComponent(`
    SELECT id, student_id, counselor_id, note_type, title, created_at 
    FROM counselor_notes 
    ORDER BY created_at DESC 
    LIMIT 5
  `);
  
  try {
    const result = await makeQuery(query);
    if (result.success) {
      if (result.data.length === 0) {
        console.log('ℹ️ No existing counselor_notes found');
      } else {
        console.log('📋 Existing counselor_notes:');
        result.data.forEach((note, index) => {
          console.log(`   ${index + 1}. ID: ${note.id}, Type: "${note.note_type}", Title: "${note.title}"`);
        });
      }
    } else {
      console.log('❌ Existing data query failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Existing data error:', error.message);
  }
}

// Helper function to make database queries
async function makeQuery(encodedQuery) {
  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: `/api/database/query?sql=${encodedQuery}`,
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
          resolve(jsonBody);
        } catch (e) {
          resolve({ success: false, error: `Parse error: ${body}` });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test the actual API endpoint that's failing
async function testCounselorAPI() {
  console.log('\n5️⃣ TESTING COUNSELOR API ENDPOINT');
  console.log('='.repeat(40));

  // This would require authentication, but let's see what happens
  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: '/api/counselor/students/1',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
      // Note: Missing Authorization header - will fail auth but might show different error
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          console.log('📊 API Response Status:', res.statusCode);
          console.log('📊 API Response:', JSON.stringify(jsonBody, null, 2));
          
          if (jsonBody.error && jsonBody.error.includes('constraint')) {
            console.log('🎯 Found constraint error in API response!');
          }
          
          resolve(jsonBody);
        } catch (e) {
          console.log('📊 API Response (non-JSON):', body);
          resolve({ error: body });
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ API Request error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run all debug tests
async function runAllTests() {
  try {
    await debugConstraintError();
    await testCounselorAPI();
    
    console.log('\n🎯 DEBUGGING COMPLETE');
    console.log('='.repeat(50));
    
    console.log(`
📋 NEXT STEPS BASED ON RESULTS:

1. If foreign key errors: Create valid test users first
2. If constraint errors: Check exact constraint definition
3. If API errors: Check where constraint violation occurs in code
4. If no errors: Issue might be intermittent or environment-specific

🔍 Look for patterns in the error messages to identify:
- Exact constraint name and definition
- Which values are being rejected
- Whether it's INSERT, UPDATE, or SELECT causing the issue
    `);
    
  } catch (error) {
    console.error('❌ Debug tests failed:', error);
  }
}

runAllTests();

console.log(`
📋 CONSTRAINT ERROR DEBUGGING
=============================

🔧 ISSUE: "violates check constraint 'counselor_notes_note_type_check'"
🎯 PURPOSE: Identify exact cause and location of constraint violation

🧪 This script will:
1. Test table structure and constraints
2. Try valid and invalid inserts to see exact error messages
3. Check existing data for invalid values
4. Test the actual API endpoint that's failing

💡 Expected findings:
- Exact constraint definition from PostgreSQL
- Which note_type values are being rejected
- Whether the error is in INSERT or SELECT operations
- Location in code where constraint violation occurs
`);