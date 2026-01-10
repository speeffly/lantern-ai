#!/usr/bin/env node

/**
 * Test assignments API with proper authentication
 */

const API_URL = process.env.API_URL || 'http://localhost:3002';

async function testWithAuth() {
  console.log('🧪 Testing Student Assignments API with Authentication');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create a test student account
    console.log('1. Creating test student account...');
    const registerResponse = await fetch(`${API_URL}/api/auth-db/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.student@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'Student',
        role: 'student'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    let token;
    if (registerResponse.status === 201 || (registerResponse.status === 400 && registerData.error?.includes('already exists'))) {
      // Account created or already exists, try to login
      console.log('\n2. Logging in as test student...');
      const loginResponse = await fetch(`${API_URL}/api/auth-db/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test.student@example.com',
          password: 'testpassword123'
        })
      });

      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);

      if (loginData.success && loginData.token) {
        token = loginData.token;
        console.log('✅ Successfully logged in, got token');
      } else {
        console.error('❌ Login failed:', loginData);
        return;
      }
    } else {
      console.error('❌ Registration failed:', registerData);
      return;
    }

    // Step 3: Test assignments API with valid token
    console.log('\n3. Testing assignments API with valid token...');
    const assignmentsResponse = await fetch(`${API_URL}/api/student/assignments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const assignmentsData = await assignmentsResponse.json();
    console.log('Assignments API Status:', assignmentsResponse.status);
    console.log('Assignments API Response:', assignmentsData);

    if (assignmentsResponse.status === 200 && assignmentsData.success) {
      console.log('✅ SUCCESS! Assignments API is working correctly');
      console.log(`📊 Found ${assignmentsData.data.length} assignments for the student`);
      
      if (assignmentsData.data.length === 0) {
        console.log('✅ Empty assignments list - this should show "No Assignments Yet" in the UI');
      } else {
        console.log('📝 Sample assignment:', assignmentsData.data[0]);
      }
    } else {
      console.error('❌ Assignments API failed:', assignmentsResponse.status, assignmentsData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testWithAuth().catch(console.error);