const axios = require('axios');

// Test the add student functionality
async function testAddStudent() {
  const baseUrl = 'https://lantern-ai.onrender.com';
  
  console.log('🧪 Testing Add Student Functionality...\n');

  try {
    // Step 1: Login as counselor (fresh login)
    console.log('1️⃣ Logging in as counselor...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth-db/login`, {
      email: 'counselor@test.com',
      password: 'password123'
    });

    console.log('Login response:', loginResponse.data);

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token length:', token.length);

    // Step 2: Test add student endpoint
    console.log('\n2️⃣ Testing add student endpoint...');
    const addStudentResponse = await axios.post(
      `${baseUrl}/api/counselor/students`,
      {
        studentEmail: 'student@test.com'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📡 Add student response:', addStudentResponse.data);

    if (addStudentResponse.data.success) {
      console.log('✅ Add student successful');
    } else {
      console.log('❌ Add student failed:', addStudentResponse.data.error);
    }

    // Step 3: Verify student was added
    console.log('\n3️⃣ Verifying student was added...');
    const studentsResponse = await axios.get(`${baseUrl}/api/counselor/students`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('👥 Students list:', studentsResponse.data);

    if (studentsResponse.data.success) {
      const students = studentsResponse.data.data;
      const addedStudent = students.find(s => s.student.email === 'student@test.com');
      
      if (addedStudent) {
        console.log('✅ Student found in list:', addedStudent.student.email);
      } else {
        console.log('❌ Student not found in list');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

// Test if counselor user exists
async function testCounselorExists() {
  const baseUrl = 'https://lantern-ai.onrender.com';
  
  console.log('\n🔍 Checking if test counselor exists...');
  
  try {
    const loginResponse = await axios.post(`${baseUrl}/api/auth-db/login`, {
      email: 'counselor@test.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Test counselor exists and can login');
    } else {
      console.log('❌ Test counselor does not exist or cannot login');
    }
  } catch (error) {
    console.log('❌ Counselor login failed:', error.response?.data || error.message);
    
    // Try to create the counselor
    try {
      console.log('📝 Attempting to create test counselor...');
      const registerResponse = await axios.post(`${baseUrl}/api/auth-db/register`, {
        firstName: 'Test',
        lastName: 'Counselor',
        email: 'counselor@test.com',
        password: 'password123',
        role: 'counselor'
      });
      
      console.log('✅ Test counselor created:', registerResponse.data);
    } catch (regError) {
      console.log('❌ Failed to create test counselor:', regError.response?.data || regError.message);
    }
  }
}

// Test if student user exists
async function testStudentExists() {
  const baseUrl = 'https://lantern-ai.onrender.com';
  
  console.log('\n🔍 Checking if test student exists...');
  
  try {
    const loginResponse = await axios.post(`${baseUrl}/api/auth-db/login`, {
      email: 'student@test.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Test student exists and can login');
    } else {
      console.log('❌ Test student does not exist or cannot login');
    }
  } catch (error) {
    console.log('❌ Student login failed:', error.response?.data || error.message);
    
    // Try to create the student
    try {
      console.log('📝 Attempting to create test student...');
      const registerResponse = await axios.post(`${baseUrl}/api/auth-db/register`, {
        firstName: 'Test',
        lastName: 'Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student'
      });
      
      console.log('✅ Test student created:', registerResponse.data);
    } catch (regError) {
      console.log('❌ Failed to create test student:', regError.response?.data || regError.message);
    }
  }
}

// Run tests
async function runTests() {
  await testCounselorExists();
  await testStudentExists();
  await testAddStudent();
}

runTests();