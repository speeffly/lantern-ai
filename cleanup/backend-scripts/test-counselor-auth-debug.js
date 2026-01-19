const axios = require('axios');

async function debugCounselorAuth() {
  const baseUrl = 'https://lantern-ai.onrender.com';
  
  console.log('🔍 DEBUGGING COUNSELOR AUTHENTICATION ISSUE\n');

  try {
    // Step 1: Test counselor login
    console.log('1️⃣ Testing counselor login...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth-db/login`, {
      email: 'counselor@test.com',
      password: 'password123'
    });

    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));

    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

    // Step 2: Decode the token to see its structure
    console.log('\n2️⃣ Decoding JWT token...');
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('Token payload:', JSON.stringify(payload, null, 2));
      } catch (e) {
        console.log('❌ Failed to decode token:', e.message);
      }
    }

    // Step 3: Test profile endpoint (should work)
    console.log('\n3️⃣ Testing profile endpoint...');
    try {
      const profileResponse = await axios.get(`${baseUrl}/api/auth-db/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Profile endpoint works:', profileResponse.data.success);
    } catch (error) {
      console.log('❌ Profile endpoint failed:', error.response?.data || error.message);
    }

    // Step 4: Test counselor stats endpoint
    console.log('\n4️⃣ Testing counselor stats endpoint...');
    try {
      const statsResponse = await axios.get(`${baseUrl}/api/counselor/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Stats endpoint works:', statsResponse.data);
    } catch (error) {
      console.log('❌ Stats endpoint failed:', error.response?.data || error.message);
      console.log('Response status:', error.response?.status);
    }

    // Step 5: Test counselor students endpoint
    console.log('\n5️⃣ Testing counselor students endpoint...');
    try {
      const studentsResponse = await axios.get(`${baseUrl}/api/counselor/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Students endpoint works:', studentsResponse.data);
    } catch (error) {
      console.log('❌ Students endpoint failed:', error.response?.data || error.message);
      console.log('Response status:', error.response?.status);
    }

    // Step 6: Test add student endpoint
    console.log('\n6️⃣ Testing add student endpoint...');
    try {
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
      console.log('✅ Add student works:', addStudentResponse.data);
    } catch (error) {
      console.log('❌ Add student failed:', error.response?.data || error.message);
      console.log('Response status:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugCounselorAuth();