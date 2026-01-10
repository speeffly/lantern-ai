#!/usr/bin/env node

/**
 * Test the assignments API directly to debug the 500 error
 */

const API_URL = process.env.API_URL || 'http://localhost:3002';

async function testAssignmentsAPI() {
  console.log('🧪 Testing Student Assignments API');
  console.log('=' .repeat(50));
  console.log('API URL:', API_URL);

  // Test without authentication first
  console.log('\n1. Testing without authentication...');
  try {
    const response = await fetch(`${API_URL}/api/student/assignments`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test with a fake token
  console.log('\n2. Testing with fake token...');
  try {
    const response = await fetch(`${API_URL}/api/student/assignments`, {
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test the health endpoint to make sure server is running
  console.log('\n3. Testing server health...');
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Server is running');
      console.log('Health response:', data);
    } else {
      console.log('❌ Server health check failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Cannot reach server:', error.message);
  }

  // Test basic API endpoint
  console.log('\n4. Testing basic API endpoint...');
  try {
    const response = await fetch(`${API_URL}/api`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is responding');
      console.log('API info:', data);
    } else {
      console.log('❌ API endpoint failed:', response.status);
    }
  } catch (error) {
    console.error('❌ API endpoint error:', error.message);
  }
}

testAssignmentsAPI().catch(console.error);