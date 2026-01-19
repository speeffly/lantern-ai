const https = require('https');

// Test configuration
const API_BASE = 'https://lantern-ai.onrender.com';

// Test student credentials (you'll need to use actual student credentials)
const STUDENT_EMAIL = 'student@test.com';
const STUDENT_PASSWORD = 'password123';

let studentToken = null;

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
async function loginStudent() {
  console.log('🔐 Testing student login...');
  
  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: '/api/auth-db/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const loginData = {
    email: STUDENT_EMAIL,
    password: STUDENT_PASSWORD
  };

  try {
    const response = await makeRequest(options, loginData);
    console.log('📊 Login response status:', response.status);
    console.log('📊 Login response:', response.data);

    if (response.data.success && response.data.token) {
      studentToken = response.data.token;
      console.log('✅ Student login successful');
      console.log('🎫 Token preview:', studentToken.substring(0, 50) + '...');
      return true;
    } else {
      console.log('❌ Student login failed:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function getStudentAssignments() {
  console.log('\n📚 Testing get student assignments...');
  
  if (!studentToken) {
    console.log('❌ No student token available');
    return false;
  }

  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: '/api/student/assignments',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('📊 Get assignments response status:', response.status);
    console.log('📊 Get assignments response:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('✅ Successfully retrieved assignments');
      console.log(`📋 Found ${response.data.data.length} assignments`);
      
      // Display assignment details
      response.data.data.forEach((assignment, index) => {
        console.log(`\n📝 Assignment ${index + 1}:`);
        console.log(`   ID: ${assignment.id}`);
        console.log(`   Title: ${assignment.title}`);
        console.log(`   Type: ${assignment.assignment_type}`);
        console.log(`   Status: ${assignment.status}`);
        console.log(`   Due Date: ${assignment.due_date || 'No due date'}`);
        console.log(`   Counselor: ${assignment.counselor_first_name} ${assignment.counselor_last_name}`);
      });
      
      return response.data.data;
    } else {
      console.log('❌ Failed to get assignments:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Get assignments error:', error.message);
    return false;
  }
}

async function updateAssignmentStatus(assignmentId, newStatus) {
  console.log(`\n🔄 Testing assignment status update (ID: ${assignmentId}, Status: ${newStatus})...`);
  
  if (!studentToken) {
    console.log('❌ No student token available');
    return false;
  }

  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: `/api/student/assignments/${assignmentId}/status`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    }
  };

  const updateData = {
    status: newStatus
  };

  try {
    const response = await makeRequest(options, updateData);
    console.log('📊 Update status response status:', response.status);
    console.log('📊 Update status response:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('✅ Successfully updated assignment status');
      console.log(`🔄 Assignment ${assignmentId} status changed to: ${newStatus}`);
      return true;
    } else {
      console.log('❌ Failed to update assignment status:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Update assignment status error:', error.message);
    return false;
  }
}

async function testStudentAssignmentWorkflow() {
  console.log('🚀 TESTING STUDENT ASSIGNMENT FUNCTIONALITY');
  console.log('='.repeat(50));
  
  // Step 1: Login as student
  const loginSuccess = await loginStudent();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without student login');
    return;
  }

  // Step 2: Get assignments
  const assignments = await getStudentAssignments();
  if (!assignments || assignments.length === 0) {
    console.log('ℹ️ No assignments found for this student');
    console.log('💡 Create an assignment from counselor dashboard first');
    return;
  }

  // Step 3: Test status updates on first assignment
  const firstAssignment = assignments[0];
  console.log(`\n🎯 Testing status updates on assignment: "${firstAssignment.title}"`);
  console.log(`📊 Current status: ${firstAssignment.status}`);

  // Test status progression
  if (firstAssignment.status === 'assigned') {
    console.log('\n🔄 Testing: assigned → in_progress');
    await updateAssignmentStatus(firstAssignment.id, 'in_progress');
    
    // Wait a moment and check status
    await new Promise(resolve => setTimeout(resolve, 1000));
    await getStudentAssignments();
    
    console.log('\n🔄 Testing: in_progress → completed');
    await updateAssignmentStatus(firstAssignment.id, 'completed');
  } else if (firstAssignment.status === 'in_progress') {
    console.log('\n🔄 Testing: in_progress → completed');
    await updateAssignmentStatus(firstAssignment.id, 'completed');
  } else {
    console.log(`ℹ️ Assignment is already ${firstAssignment.status}, no status change needed`);
  }

  // Final status check
  console.log('\n📊 Final assignment status check:');
  await getStudentAssignments();

  console.log('\n✅ STUDENT ASSIGNMENT TESTING COMPLETE!');
  console.log('='.repeat(50));
}

// Run the test
testStudentAssignmentWorkflow().catch(error => {
  console.error('❌ Test failed:', error);
});

console.log(`
📋 STUDENT ASSIGNMENT TEST INSTRUCTIONS:
===========================================

1. Make sure you have a student account created
2. Update STUDENT_EMAIL and STUDENT_PASSWORD in this script
3. Create at least one assignment from counselor dashboard
4. Run this test to verify the workflow

🔗 API Endpoints Being Tested:
- POST /api/auth-db/login (student login)
- GET /api/student/assignments (get assignments)
- PATCH /api/student/assignments/:id/status (update status)

🎯 Expected Workflow:
1. Student logs in successfully
2. Student retrieves assignments list
3. Student updates assignment status (assigned → in_progress → completed)
4. Status changes are reflected in database

⚠️ Prerequisites:
- Student account must exist in database
- At least one assignment must be created by counselor
- Backend must be deployed with student routes
`);