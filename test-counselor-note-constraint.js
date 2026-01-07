const https = require('https');

// Test configuration
const API_BASE = 'https://lantern-ai.onrender.com';

// Test counselor credentials (you'll need to use actual counselor credentials)
const COUNSELOR_EMAIL = 'counselor@test.com';
const COUNSELOR_PASSWORD = 'password123';
const TEST_STUDENT_ID = 1; // Student ID to test with

let counselorToken = null;

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function loginCounselor() {
  console.log('🔐 Testing counselor login...');
  
  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: '/api/auth-db/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const loginData = {
    email: COUNSELOR_EMAIL,
    password: COUNSELOR_PASSWORD
  };

  try {
    const response = await makeRequest(options, loginData);
    console.log('📊 Login response status:', response.status);
    console.log('📊 Login response:', response.data);

    if (response.data.success && response.data.token) {
      counselorToken = response.data.token;
      console.log('✅ Counselor login successful');
      return true;
    } else {
      console.log('❌ Counselor login failed:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function testNoteCreation(noteType, expectedSuccess = true) {
  console.log(`\n📝 Testing note creation with noteType: "${noteType}"`);
  
  if (!counselorToken) {
    console.log('❌ No counselor token available');
    return false;
  }

  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: `/api/counselor/students/${TEST_STUDENT_ID}/notes`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${counselorToken}`,
      'Content-Type': 'application/json'
    }
  };

  const noteData = {
    noteType: noteType,
    title: `Test Note - ${noteType}`,
    content: `This is a test note with noteType: ${noteType}`,
    isSharedWithParent: false
  };

  try {
    const response = await makeRequest(options, noteData);
    console.log('📊 Create note response status:', response.status);
    console.log('📊 Create note response:', JSON.stringify(response.data, null, 2));

    if (expectedSuccess) {
      if (response.data.success) {
        console.log(`✅ Successfully created note with noteType: "${noteType}"`);
        return true;
      } else {
        console.log(`❌ Failed to create note with noteType: "${noteType}"`);
        console.log(`🔍 Error: ${response.data.error}`);
        return false;
      }
    } else {
      if (!response.data.success) {
        console.log(`✅ Expected failure for noteType: "${noteType}"`);
        console.log(`🔍 Error (expected): ${response.data.error}`);
        return true;
      } else {
        console.log(`❌ Unexpected success for noteType: "${noteType}"`);
        return false;
      }
    }
  } catch (error) {
    console.error(`❌ Error testing noteType "${noteType}":`, error.message);
    return false;
  }
}

async function testAllNoteTypes() {
  console.log('🧪 TESTING COUNSELOR NOTE CONSTRAINT');
  console.log('='.repeat(50));
  
  // Step 1: Login as counselor
  const loginSuccess = await loginCounselor();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without counselor login');
    return;
  }

  // Step 2: Test valid note types (should succeed)
  console.log('\n🎯 Testing VALID note types (should succeed):');
  const validTypes = ['general', 'career_guidance', 'academic', 'personal', 'parent_communication'];
  
  for (const noteType of validTypes) {
    await testNoteCreation(noteType, true);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Step 3: Test invalid note types (should fail)
  console.log('\n🎯 Testing INVALID note types (should fail):');
  const invalidTypes = ['invalid', 'test', 'meeting', 'progress', 'other'];
  
  for (const noteType of invalidTypes) {
    await testNoteCreation(noteType, false);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ NOTE CONSTRAINT TESTING COMPLETE!');
  console.log('='.repeat(50));
}

// Run the test
testAllNoteTypes().catch(error => {
  console.error('❌ Test failed:', error);
});

console.log(`
📋 COUNSELOR NOTE CONSTRAINT TEST
=================================

🔧 ISSUE: "violates check constraint 'counselor_notes_note_type_check'"
🎯 PURPOSE: Test which note_type values are causing the constraint violation

📝 Database Constraint (PostgreSQL):
CHECK (note_type IN ('general', 'career_guidance', 'academic', 'personal', 'parent_communication'))

🧪 Test Plan:
1. Login as counselor
2. Test all VALID note types (should succeed)
3. Test INVALID note types (should fail with constraint error)
4. Identify which value is causing the issue

⚠️ Prerequisites:
- Counselor account must exist in database
- Student with ID ${TEST_STUDENT_ID} must exist
- Update COUNSELOR_EMAIL and COUNSELOR_PASSWORD in this script

🎯 Expected Results:
- Valid types: Success (note created)
- Invalid types: Failure with constraint violation error
`);